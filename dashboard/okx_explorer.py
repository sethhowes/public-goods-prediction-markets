#Import packages
import json
import os
import time
import pandas as pd

os.chdir(os.getcwd()+'\\dashboard')
from utils import urllib_request
from rolling_proxies import get_new_rolling_proxies_key

#Import config
from config import OKLINK_API_KEY, OKX_DEX_ROUTER_ADDRESS, PROXIES

def get_tx_hashes(limit=100, api_key = OKLINK_API_KEY, address=OKX_DEX_ROUTER_ADDRESS, start=1661061600, skip=1800):
    """
    Get transaction hashes from Oklink
    @params:
        limit       - Required  : number of transactions per api call (int)
        api_key     - Required  : Oklink api key (str)
        address     - Required  : address of the contract to monitor (str)
        start       - Required  : timestamp of the first request (int)
        skip        - Required  : step for the rolling api calls (int)
    """
    # Initializing the variables
    tx_hashes = [] # Init empty tx hashes list
    offset = 0 # Init offset for api calls

    # Build rolling api calls
    while start + skip <= time.time(): # make requests from starting point until now
        end = start + skip # timestamp of the last request for the current call
        
        # Iterate over the 10000 possible transactions in the range start-stop
        for _ in range(100):
            # Create request 
            url = f"https://www.oklink.com/api/explorer/v1/okexchain/addresses/\
                {address}/transactions/condition?t=1677358990583&offset={offset}\
                &address={address}&tokenAddress={address}&limit={limit}\
                &nonzeroValue=false&type=2&start={start}&end={end}&msgType=0"
            additional_headers = {"x-apikey": api_key}
            
            # Send request
            hashes = urllib_request(url, additional_headers)

            # Extract transactions data
            hits = json.loads(hashes)['data']['hits']

            # Save on api calls if less than 10000 transactions in start-stop
            if len(hits) == 0:
              break
            
            # Build tx hashes list
            for tx in hits:
                tx_hashes.append('0x' + tx['hash'])

            # Increase offset
            offset += limit

        # Prepare for next round of api calls
        offset = 0
        start += skip

    return tx_hashes

#Get transaction details from Oklink
def get_transaction_details(transaction_hash, api_key = OKLINK_API_KEY, proxies = PROXIES, use_proxies = False):
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
    tx_data = urllib_request(url, additional_headers, proxies=proxies, use_proxies = use_proxies)
    
    #Unwrap byte object
    tx_data = json.loads(tx_data)

    #Data wrangling
    tx_data = tx_data['data']
    tx_data.pop('inputData')
    tx_data = pd.json_normalize(tx_data)

    return tx_data

#Get transaction details for list of tx hashes
def get_transaction_details_wrapper(transaction_hashes, temp_save = True, use_proxies=True):
    """
    Get transaction details for list of tx hashes
    @params:
        transaction_hashes - Required  : list of transaction hashes (list)
    """
    #Init empty datafarme
    data = pd.DataFrame()

    #Get proxy api key
    if use_proxies:
        proxies_api_key = get_new_rolling_proxies_key()
        proxies = {'url': f"http://api.proxiesapi.com/?auth_key={proxies_api_key}&url="}

    #Loop through all hashs
    for tx_hash in transaction_hashes:
        #Get tx data
        while True:
            try:
                tx_data = get_transaction_details(tx_hash, proxies = proxies, use_proxies = use_proxies)
                break
            except:
                time.sleep(2)

                #Refresh proxy api key
                if use_proxies:
                    proxies_api_key = get_new_rolling_proxies_key()
                    proxies = {'url': f"http://api.proxiesapi.com/?auth_key={proxies_api_key}&url="}

        #Append data
        data = data.append(tx_data)

        print(f"{len(data)} from {len(transaction_hashes)}")

        #Temp save
        if temp_save and len(data) % 500 == 0:
            print('Saving dataframe')
            data.to_csv('temp_save_dex_data.csv')

    return data

#Get all tx hashes for a contract
tx_hashes = get_tx_hashes()

get_transaction_details_wrapper(tx_hashes, temp_save = True)