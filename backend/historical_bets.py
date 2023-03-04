#Import packages
from web3 import Web3
import copy
import numpy as np
import os
from web3.auto import w3

os.chdir(r'./backend')
#Import own functions
from firebase_handling import get_last_checked_block, save_bucket_tvl_timeseries, get_bucket_tvl_timeseries, update_last_checked_block
from config import RPC_DICT, ABI, CONTRACT_DEPLOYMENT_BLOCK, CONTRACT_ADDRESS, EVENT_SIGNATURE_HASH

#Get latest betting events from contract
def get_new_events(chain_name, contract_address, event_signature_hash = EVENT_SIGNATURE_HASH, block_increment = 2000, contract_deployment_block = CONTRACT_DEPLOYMENT_BLOCK, web3 = w3):
	"""
    Get latest betting events from contract
    @params:
        chain_name          		- Required  : chain name (str)
        contract_address    		- Required  : contract address (str)
        event_signature_hash        - Required  : bed event signature hash (str)
        block_increment         	- Required  : block increment for querying logs (int)
        contract_deployment_block   - Required  : deployment block smart contract (int)
        web3         				- Required  : web3 object (web3)
    """
	#Get start up from firebase
	start_block = get_last_checked_block(chain_name)

	start_block = max(start_block,contract_deployment_block)

	new_bets = []

	#Loop through blocks
	while True:
		#Set end block
		end_block = start_block + block_increment
		
		# predict_contract_bet_event = predict_contract.events.Bet.createFilter(fromBlock= start_block, toBlock = int(start_block + 2000))   
		#Set filter
		predict_contract_bet_event = web3.eth.filter({
			"address": web3.toChecksumAddress(contract_address),
			"topics": [event_signature_hash],
			"fromBlock": start_block,
			"endBlock": end_block,
			})
		
		#Retrieve logs
		event_logs = predict_contract_bet_event.get_all_entries()

		# Solidity example
		# emit Bet(msg.sender, predictionId, scaledBet, msg.value, block.timestamp, bucketIndex);
		# log = event_logs[0]

		#Unwrap logs
		for log in event_logs:
			block_num = log['blockNumber'] 

			#Unwrap data
			log_data = log['data'][2:]
			data_list =[]
			for i in range(int(len(log_data)/64)):
				data_list.append(log_data[int(i*64):int((i+1)*64)])

			#Unwrap variables
			better = (log['topics'][1].hex())
			better = web3.toChecksumAddress('0x'+better[len(better)-40:])
			prediction_id = int(log['topics'][2].hex(),16)
			scaled_bet = int(data_list[0],16)
			amount = int(data_list[1],16)
			timestamp = int(data_list[2],16)
			bucket_index = int(data_list[3],16)
			
			log_dict = {'block': block_num, 'better': better, 'prediction_id': prediction_id,'scaled_bet': scaled_bet, 'amount':amount,'timestamp':timestamp,'bucket_index':bucket_index}
			new_bets.append(log_dict)

		latest_block = web3.eth.get_block_number()
		
		if end_block > latest_block:
			end_block = latest_block

		start_block += block_increment

		#Exit condition
		if start_block > latest_block:
			break

	#Update block number stored
	update_last_checked_block(chain_name, latest_block)

	return new_bets

#Formats dictionary to be conform with firebase
def format_timeseries_dict(bet_timeseries):
	"""
    Formats dictionary to be conform with firebase
    @params:
        bet_timeseries          - Required  : bet time series dictionary (dict)
    """
	#Convert list to str
	for k1 in list(bet_timeseries.keys()):
		bet_timeseries[k1]['detailed'] = {str(key):str(value) for (key,value) in bet_timeseries[k1]['detailed'].items()}
		bet_timeseries[k1]['averaged'] = {str(key):(value) for (key,value) in bet_timeseries[k1]['averaged'].items()}
	
		if not isinstance(k1, str):
			bet_timeseries[str(k1)] = bet_timeseries[k1]
			bet_timeseries.pop(k1)
	return bet_timeseries

#Updates betting timeseries
def update_betting_timeseries(chain_name, rpc_dict = RPC_DICT, contract_address = CONTRACT_ADDRESS, abi = ABI):
	"""
    Updates betting timeseries
    @params:
        chain_name          - Required  : chain name (str)
        rpc_dict            - Required  : rpc dictionary (dict)
        contract_address    - Required  : contract address (str)
        abi         		- Required  : contract abi (str)
    """
	#Select rpc url
	if chain_name in rpc_dict.keys():
		rpc_url = rpc_dict[chain_name]
	else:
		return {'error': f"no rpc defined for {chain_name}"}
	
	#Initialise blockchain connection
	web3 = Web3(Web3.HTTPProvider(rpc_url))

	#Set up contract instance
	contract_address = web3.toChecksumAddress(contract_address)
	predict_contract = web3.eth.contract(contract_address, abi=abi)
	view_predict_func = predict_contract.functions.viewPrediction

	#Get new bets
	new_bets = get_new_events(chain_name, contract_address, web3 = web3)

	#Unique ids
	pred_ids = []
	for bet in new_bets:
		pred_ids.append(bet['prediction_id'])
	pred_ids = list(set(pred_ids))

	#Get buckets
	bucket_dict = {}
	for p_id in pred_ids:
		bucket_values = view_predict_func(p_id).call()[2]
		bucket_dict[p_id] = bucket_values

	#Query database
	bet_timeseries = get_bucket_tvl_timeseries(chain_name)

	#Check if data already exists
	if bet_timeseries != None:
		#Add prediction ids
		for p_id in pred_ids:
			if str(p_id) in bet_timeseries.keys():
				bet_time_level = {}
				last_key = list(bet_timeseries[str(p_id)]['detailed'].keys())[-1]
				start_values = eval(bet_timeseries[str(p_id)]['detailed'][last_key])

				for bet in new_bets:
					#Match id
					if bet['prediction_id'] == p_id:
						t_stamp = bet['timestamp']
						b_index = bet['bucket_index']
						b_amount =bet['amount']

						#Update bucket value
						start_values[b_index] =  start_values[b_index] + b_amount

						#Timestamp check
						bet_time_level[str(t_stamp)] = copy.deepcopy(start_values)

				bet_timeseries[str(p_id)]['detailed'].update(bet_time_level)

				#Aggregate bets
				for p_id in pred_ids:
					average_overtime = {}
					bucket_values = bucket_dict[p_id]
					bucket_data = bet_timeseries[str(p_id)]['detailed']

					for t_stamp in bucket_data.keys():
						bucket_tvl = bucket_data[t_stamp]
						if isinstance(bucket_tvl,str):
							bucket_tvl = eval(bucket_data[t_stamp])

						total_amount = sum(bucket_tvl)

						avg = (np.array(bucket_values) * np.array(bucket_tvl)).sum() / total_amount
						average_overtime[t_stamp] = avg

					bet_timeseries[str(p_id)]['averaged'] = average_overtime
			
			#Add new market
			else:
				bet_time_level = {}
				start_values = [0]*len(bucket_dict[p_id])

				for bet in new_bets:
					#Match id
					if bet['prediction_id'] == p_id:
						t_stamp = bet['timestamp']
						b_index = bet['bucket_index']
						b_amount =bet['amount']

						#Update bucket value
						start_values[b_index] =  start_values[b_index] + b_amount
						bet_time_level[t_stamp] = copy.deepcopy(start_values)

				bet_timeseries[p_id] = {'detailed': bet_time_level}

				#Aggregate bets
				for p_id in pred_ids:
					average_overtime = {}
					bucket_values = bucket_dict[p_id]
					bucket_data = bet_timeseries[p_id]['detailed']

					for t_stamp in bucket_data.keys():
						bucket_tvl = bucket_data[t_stamp]
						total_amount = sum(bucket_data[t_stamp])
						avg = (np.array(bucket_values) * np.array(bucket_tvl)).sum() / total_amount
						average_overtime[t_stamp] = avg

					bet_timeseries[p_id].update({'averaged': average_overtime})

	#Create new timeseries 	
	else:
		bet_timeseries = {}
		
		#Update detailed data
		for p_id in pred_ids:
			bet_time_level = {}
			start_values = [0]*len(bucket_dict[p_id])

			for bet in new_bets:
				#Match id
				if bet['prediction_id'] == p_id:
					t_stamp = bet['timestamp']
					b_index = bet['bucket_index']
					b_amount =bet['amount']

					#Update bucket value
					start_values[b_index] =  start_values[b_index] + b_amount
					bet_time_level[t_stamp] = copy.deepcopy(start_values)

			bet_timeseries[p_id] = {'detailed': bet_time_level}

		#Aggregate bets
		for p_id in pred_ids:
			average_overtime = {}
			bucket_values = bucket_dict[p_id]
			bucket_data = bet_timeseries[p_id]['detailed']

			for t_stamp in bucket_data.keys():
				bucket_tvl = bucket_data[t_stamp]
				total_amount = sum(bucket_data[t_stamp])
				avg = (np.array(bucket_values) * np.array(bucket_tvl)).sum() / total_amount
				average_overtime[t_stamp] = avg

			bet_timeseries[p_id].update({'averaged': average_overtime})
	
	#Convert list to str
	bet_timeseries = format_timeseries_dict(bet_timeseries)

	#Save time series data
	save_bucket_tvl_timeseries(chain_name, bet_timeseries, firebase_db = "")

	return bet_timeseries
			
