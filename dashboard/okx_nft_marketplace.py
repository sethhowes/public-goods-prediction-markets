#Import packages
import time
import os
import pandas as pd
import json

os.chdir(os.getcwd()+'\\dashboard')
from utils import urllib_request

#Get transaction NFT transactions from Okx marketplace
def get_nft_transactions(cursor = '', use_proxies = False):
    """
    Get transaction NFT transactions from Okx marketplace
    @params:
        cursor             - Required  : cursor pagnation (str)
        use_proxies        - Required  : use proxies flag (bool)
    """
    #Create request
    url = f"https://www.okx.com/priapi/v1/nft/trading/collectionHistory?t={int(time.time())}&showCollOrder=true&chain=1&type=SALE&project=&direction=0"
    
    #Account for cursor
    if cursor != '':
        url = url + f"&cursor={cursor}"
    
    #Send request
    nft_data = urllib_request(url, {}, use_proxies = use_proxies)
    
    #Unwrap byte object
    nft_data = json.loads(nft_data)


    #Data wrangling
    next_cursor = nft_data['data']['cursor']
    next_flag = nft_data['data']['next']
    nft_data = nft_data['data']
    nft_data = nft_data['data']
    nft_data = pd.json_normalize(nft_data)

    return {'data': nft_data, 'next_cursor': next_cursor, 'next_flag': next_flag}

#Get all nft transaction on the OKX marketplace
def get_all_nft_transactions(max_length_dataframe = 100, temp_save = True):
    """
    Get all nft transaction on the OKX marketplace
    @params:
    max_length_dataframe    - Required  : max length dataframe break value (int)
    temp_save               - Required  : temporary save flag (bool)
    """
    #Init empty dataframe
    data = pd.DataFrame()
    
    #First request
    nft_data_dict = get_nft_transactions(cursor = '', use_proxies = False)
    next_cursor = nft_data_dict['next_cursor']
    next_flag = nft_data_dict['next_flag']
    nft_data = nft_data_dict['data']
    
    #Add data to data frame
    data = data.append(nft_data)
    
    #Loop requests
    while True:
        #First request
        while True:
            try:
                nft_data_dict = get_nft_transactions(cursor = next_cursor, use_proxies = False)
                break
            except:
                time.sleep(2)

        next_cursor = nft_data_dict['next_cursor']
        next_flag = nft_data_dict['next_flag']
        nft_data = nft_data_dict['data']
        
        #Add data to data frame
        data = data.append(nft_data)
        
        print(len(data))
        
        #Final break condititons to get all data
        if len(nft_data) < 10 or not next_flag:
            break

        #Break condition for testing and getting data
        if max_length_dataframe != '' and len(data) >= max_length_dataframe:
            break
        
        #Temp save
        if temp_save and len(data) % 500 == 0:
            print('Saving dataframe')
            data.to_csv('temp_save_nft_data.csv')

    return data


nft_data_test = get_all_nft_transactions(max_length_dataframe = '', temp_save = True)
# nft_data_test.to_csv('NFT_data_test.csv')