
#Import packages
import firebase_admin
from firebase_admin import credentials, firestore

import os
os.getcwd()
# os.chdir('./backend')
from config import FIREBASE_PARAMS

#Initialize firebase db connection
def init_firebase(firebase_params = FIREBASE_PARAMS):
    """
    Initialize firebase db connection
    @params:
        firebase_params     - Required  : firebase parameters (dict)
    """

    try:
        cred = credentials.Certificate(firebase_params['certificate'])
        firebase_admin.initialize_app(cred,{
        'databaseURL': firebase_params['project_url']
        })
    except:
        pass

    #Reference to database
    db = firestore.client()
    return db

#Get last blocked that contract was checked for events
def get_last_checked_block(chain_name, firebase_db = "", firebase_params = FIREBASE_PARAMS):
    """
    Get last blocked that contract was checked for events
    @params:
        chain_name          - Required  : contract address (str)
        firebase_db         - Required  : fire base db object (firebase client) or empty (str) to connect within function
        firebase_params     - Required  : firebase parameters (dict)
    """
    #Set up firebase_db object
    if firebase_db == "":
        firebase_db = init_firebase()

    key_name = chain_name.lower()
    collection_name = firebase_params['last_block']
    last_block = firebase_db.collection(collection_name).document(key_name).get().to_dict()

    if last_block == None:
        return None
    else:
        return last_block['block']
    
#Update last blocked that contract was checked for events
def update_last_checked_block(chain_name, new_block, firebase_db = "", firebase_params = FIREBASE_PARAMS):
    """
    Update last blocked that contract was checked for events
    @params:
        chain_name          - Required  : contract address (str)
        new_block           - Required  : new block number (int)
        firebase_db         - Required  : fire base db object (firebase client) or empty (str) to connect within function
        firebase_params     - Required  : firebase parameters (dict)
    """
    #Set up firebase_db object
    if firebase_db == "":
        firebase_db = init_firebase()

    key_name = chain_name.lower()
    collection_name = firebase_params['last_block']
    _ = firebase_db.collection(collection_name).document(key_name).set({'block':new_block})

#Get bucket tvl timeseries
def get_bucket_tvl_timeseries(chain_name, firebase_db = "", firebase_params = FIREBASE_PARAMS):
    """
    Get bucket tvl timeseries
    @params:
        chain_name          - Required  : contract address (str)
        firebase_db         - Required  : fire base db object (firebase client) or empty (str) to connect within function
        firebase_params     - Required  : firebase parameters (dict)
    """
    #Set up firebase_db object
    if firebase_db == "":
        firebase_db = init_firebase()

    key_name = chain_name.lower()# + "_" + str(prediction_id)
    collection_name = firebase_params['historical']
    historical_timeseries = firebase_db.collection(collection_name).document(key_name).get().to_dict()

    if historical_timeseries == None:
        return None
    else:
        return historical_timeseries
    
#Save bucket tvl timeseries
def save_bucket_tvl_timeseries(chain_name, item_to_add, firebase_db = "", firebase_params = FIREBASE_PARAMS):
    """
    Save bucket tvl timeseries
    @params:
        chain_name          - Required  : contract address (str)
        item_to_add         - Required  : item to add to database (various)
        firebase_db         - Required  : fire base db object (firebase client) or empty (str) to connect within function
        firebase_params     - Required  : firebase parameters (dict)
    """
    #Set up firebase_db object
    if firebase_db == "":
        firebase_db = init_firebase()

    key_name = chain_name.lower()# + "_" + str(prediction_id)
    collection_name = firebase_params['historical']
    _ = firebase_db.collection(collection_name).document(key_name).set(item_to_add)
