#Import packages
import time
import os
import pandas as pd
import json

os.chdir(os.getcwd()+'\\dashboard')
from utils import urllib_request

#Import config
from config import OKLINK_API_KEY

#Get tx details -
url = "https://www.oklink.com/api/explorer/v1/okexchain/transactions/0xF7823E8E07D214CDB1A9C5FCC32161798663DCEB6DD90512829D30E9DD12031A?t=1677347357302"

transaction_hash = '0xF7823E8E07D214CDB1A9C5FCC32161798663DCEB6DD90512829D30E9DD12031A'
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
def get_transaction_details_wrapper(transaction_hashes):
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

    return data

#Get transaction for contract