#Import packages
import time
import os
import pandas as pd
import json

os.chdir(os.getcwd()+'\\dashboard')
from utils import urllib_request

#Import config
from config import OKLINK_API_KEY, OKX_DEX_ROUTER_ADDRESS

def get_tx_hashes(nb_tx=400000, limit=150, address='0xc97b81b8a38b9146010df85f1ac714afe1554343', use_proxies = False):
    tx_hashes = []
    offset = 0
    while offset + limit <= nb_tx:
        url = f"https://www.oklink.com/api/explorer/v1/okexchain/addresses/{address}/transactions/condition?t=1677350101344&offset={offset}&address={address}&tokenAddress={address}&limit={limit}&nonzeroValue=false&type=2"
        hashes = urllib_request(url, {"x-apikey":  "LWIzMWUtNDU0Ny05Mjk5LWI2ZDA3Yjc2MzFhYmEyYzkwM2NjfDI3ODg0NTg0Njg0MDU2NTQ="}, use_proxies=use_proxies)
        hits = json.loads(hashes)['data']['hits']
        for tx in hits:
            tx_hashes.append('0x' + tx['hash'])
        offset += limit

        print(len(tx_hashes))
    return tx_hashes

#Get transaction details from Oklink
def get_transaction_details(transaction_hash, api_key = OKLINK_API_KEY, use_proxies = False):
    """
    Get transaction details from Oklink
    @params:
        transaction_hash   - Required  : transaction hash (str)
        api_key            - Required  : Oklink api key (str)
        use_proxies        - Required  : use proxies flag (bool)
    """
    #Create request
    url = f"https://www.oklink.com/api/explorer/v1/okexchain/transactions/{transaction_hash}?t={time.time()}"
    additional_headers = {"x-apikey": api_key}
    
    #Send request
    tx_data = urllib_request(url, additional_headers, use_proxies = use_proxies)
    
    #Unwrap byte object
    tx_data = json.loads(tx_data)

    #Data wrangling
    tx_data = tx_data['data']
    tx_data.pop('inputData')
    tx_data = pd.json_normalize(tx_data)

    return tx_data

#Get transaction details for list of tx hashes
def get_transaction_details_wrapper(transaction_hashes, temp_save = True):
    """
    Get transaction details for list of tx hashes
    @params:
        transaction_hashes - Required  : list of transaction hashes (list)
    """
    #Init empty datafarme
    data = pd.DataFrame()

    #Loop through all hashs
    for tx_hash in transaction_hashes:
        #Get tx data
        tx_data = get_transaction_details(tx_hash)

        #Append data
        data = data.append(tx_data)

        print(f"{len(data)} from {len(transaction_hashes)}")

        #Temp save
        if temp_save and len(data) % 500 == 0:
            print('Saving dataframe')
            data.to_csv('temp_save_dex_data.csv')


    return data

#Get all tx hashes for a contract
tx_hashes = get_tx_hashes(nb_tx=400000, limit=150, address=OKX_DEX_ROUTER_ADDRESS)

#Load hashes
tx_hashes = pd.read_pickle(r'C:\Users\lucas\Downloads\tx_hashes_all.pkl')
len(tx_hashes)
os.chdir(r'C:\Users\lucas\OneDrive\Hackathons\ETHDenver 2023\public-goods-prediction-markets\dashboard')

get_transaction_details_wrapper(tx_hashes, temp_save = True)
