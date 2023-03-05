from flask import Flask, request
from flask import Flask, render_template
from flask_cors import CORS, cross_origin
import logging
import json
import sys
import pandas as pd
from pretty_html_table import build_table

#Import own functions
# from historical_bets import update_betting_timeseries

from config import CONTRACT_CHAIN_DICT, DATA_FILE_NAME
#Set up Flask app
app = Flask(__name__,template_folder='templates')
CORS(app)
print('ready')

# app.logger.addHandler(logging.StreamHandler(sys.stdout))
# app.logger.setLevel(logging.ERROR)

#Set up routes
@app.route('/', methods=['GET'])
@cross_origin(headers=['Content- Type','Authorization'])
def landing_page():
    return "Welcome to Cognoscenti"

# @app.route('/timeseries', methods=['GET'])
# @cross_origin(headers=['Content- Type','Authorization'])
# def get_timeseries():
#     #Get chain name
#     chain_name = request.args.get('chain_name', type=str)

#     #Chain contract matching
#     if chain_name not in CONTRACT_CHAIN_DICT.keys():
#         return {'error': f"No contract instance for {chain_name}"}
    
#     contract_address = CONTRACT_CHAIN_DICT[chain_name]
    
#     res = update_betting_timeseries(chain_name=chain_name,contract_address=contract_address)
    
#     return res

@app.route('/okx_dashboard', methods=['GET'])
@cross_origin(headers=['Content- Type','Authorization'])
def get_dashboard_data():
    #Load data set
    with open(DATA_FILE_NAME) as user_file:
        file_contents = user_file.read()
    
    return file_contents


@app.route('/okx', methods=['GET'])
@cross_origin(headers=['Content- Type','Authorization'])
def get_dashboard():
    #Load data set
    # with open(DATA_FILE_NAME) as user_file:
    #     file_contents = user_file.read()
    
    # # # users = User.query
    # file_contents = json.loads(file_contents)
    # addr = list(file_contents.keys())
    # data = pd.DataFrame(file_contents)
    # data = data.T
    # data['address'] = addr

    data = pd.read_pickle('all_data.pkl')
    addr = list(data.keys())
    data = pd.DataFrame(data)
    data = data.T
    data['address'] = data.index
    # data = data.to_json(orient='records')
    # print(data)

    html_table_blue_light = build_table(data,'blue_light')
    return html_table_blue_light
    # print(type(data)
    # return_data = data.to_html()
    # return render_template('base.html')
    # return render_template('bootstrap_table.html', title='Bootstrap Table',users=file_contents)
    
if __name__ == '__main__':
#Run Flask app
    #Server settings
    app.run()
