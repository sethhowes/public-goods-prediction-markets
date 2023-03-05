from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
import logging

#Import own functions
from historical_bets import update_betting_timeseries

from config import CONTRACT_CHAIN_DICT
#Set up Flask app
app = Flask(__name__)
CORS(app)
print('ready')

# app.logger.addHandler(logging.StreamHandler(sys.stdout))
# app.logger.setLevel(logging.ERROR)

#TODO Add Flask and functionality 
#Endpoint for web3 historical

#Set up routes
@app.route('/', methods=['GET'])
@cross_origin(headers=['Content- Type','Authorization'])
def landing_page():
    return "Welcome to cocknisseur"

@app.route('/timeseries', methods=['GET'])
@cross_origin(headers=['Content- Type','Authorization'])
def get_timeseries():
    #Get chain name
    chain_name = request.args.get('chain_name', type=str)

    #Chain contract matching
    if chain_name not in CONTRACT_CHAIN_DICT.keys():
        return {'error': f"No contract instance for {chain_name}"}
    
    contract_address = CONTRACT_CHAIN_DICT[chain_name]
    
    res = update_betting_timeseries(chain_name=chain_name,contract_address=contract_address)
    
    return res

#Run Flask app
if __name__ == '__main__':
    #Server settings
    app.run()

