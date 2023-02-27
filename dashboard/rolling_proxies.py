#Import packages
from bs4 import BeautifulSoup
from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import string
import random

#Import config
from config import CHROME_DRIVER_PATH, PROXIES_SIGN_UP_URL

#Starts selenium and returns driver object
def start_selenium_driver(chrome_driver_path = CHROME_DRIVER_PATH):
    """
    Starts selenium and returns driver object
    @params:
    chrome_driver_path       - Required  : path to chrome driver (str)
    """
    #Set options
    options = Options()
    options.add_argument('log-level=3')
    options.add_argument("--disable-blink-features")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument('--ignore-certificate-errors')

    #Start driver
    driver = webdriver.Chrome(chrome_driver_path,options=options)
    # driver.set_window_position(2000, 1350)

    return driver   

#Generates password
def generate_password(password_length=10):
    """
    Generates password
    @params:
    password_length          - Required  : length for passoword (int)
    """
    #Letter subset
    letters = string.ascii_letters + string.digits
    
    #Generate password
    password = ''.join(random.choice(letters) for i in range(password_length))
    
    return password

#Generates email address
def generate_email(email_length=5):
    """
    Generates email address
    @params:
    email_length            - Required  : length for email address (int)
    """
    #Letter subset
    letters = string.ascii_letters
    digits = string.digits
    
    #Generate password
    email_str = ''.join(random.choice(letters) for i in range(email_length))
    email_str = email_str + ''.join(random.choice(digits) for i in range(4))
    email_str = email_str + '@gmx.com'
    
    return email_str

#Returns api key for rolling proxies
def get_new_rolling_proxies_key(sign_up_url = PROXIES_SIGN_UP_URL):
    """
    Returns api key for rolling proxies
    @params:
    sign_up_url             - Required  : sign up url (str)
    """
    #Set up driver
    driver = start_selenium_driver()

    driver.get(sign_up_url)

    #Generate sign up data
    email_address = generate_email()
    password_string = generate_password()

    #Fill out sign up form
    driver.find_element("id",'email').send_keys(email_address)
    driver.find_element("id",'password1').send_keys(password_string)
    driver.find_element("id",'password2').send_keys(password_string)

    #Send sign up
    driver.find_element("id",'submitbtn').click()

    #Sleep
    time.sleep(15)

    #Get API Key
    api_key = driver.find_element("class name",'col-lg-12').text
    api_key = api_key.split('\n')[0].split(': ')[1]

    #Close driver
    driver.quit()
    
    return api_key
