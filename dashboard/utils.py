#Import packges
import urllib.request
import ssl
import requests

#Import config
from config import PROXIES

#Urllib request handling
def urllib_request(url, additional_headers={}, proxies=PROXIES, use_proxies = False):
    """
    Urllib request handling
    @params:
        url             - Required  : request url (str)
        proxies         - Required  : proxy dictionary (dict)
        use_proxies     - Required  : use proxy flag (bool)
    """
    #Headers
    headers_urllib = {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0'}
    headers_urllib.update(additional_headers)

    try:
        #Build request
        req = urllib.request.Request(url, method="GET", headers=headers_urllib)
        
        #Set proxy if set to true
        if use_proxies:
            #Check if proxy url via a service is provided
            if 'url' in proxies.keys():
                proxy_url = proxies['url'] + url + "&use_headers=true"
                req = urllib.request.Request(proxy_url, method="GET", headers=headers_urllib)
            
            #Check if native proxies are supplied
            elif 'ip' in proxies.keys():
                #If only http is supported in proxy replace https
                if proxies['protocol'] == 'http':
                    proxy_url = url.replace('https','http')
                    req = urllib.request.Request(proxy_url, method="GET", headers=headers_urllib)
                
                req.set_proxy(proxies['ip'], proxies['protocol'])
            
        gcontext = ssl.SSLContext()
        r = urllib.request.urlopen(req, context=gcontext,timeout=1000)
        data = r.read()
        
        return data
    except Exception as e:
        print(f"Error: urllib request {url} - {e}")
        
        return None 
