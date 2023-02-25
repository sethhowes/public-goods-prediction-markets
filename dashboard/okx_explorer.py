#Import packages
import json
from bs4 import BeautifulSoup
import os
os.chdir(os.getcwd()+'\\dashboard')
from utils import urllib_request


#Get tx details -
url = "https://www.oklink.com/api/explorer/v1/okexchain/transactions/0xF7823E8E07D214CDB1A9C5FCC32161798663DCEB6DD90512829D30E9DD12031A?t=1677347357302"
additional_headers = {"x-apikey": "LWIzMWUtNDU0Ny05Mjk5LWI2ZDA3Yjc2MzFhYmEyYzkwM2NjfDI3ODg0NTg0Njg0MDU2NTQ="}
urllib_request(url, additional_headers)


#Get transaction for contract