import pickle
import requests

import pandas as pd
from PIL import Image
from io import BytesIO



def unique(sequence):
    seen = set()
    return [x for x in sequence if not (x in seen or seen.add(x))]

def get_color_name(rgb):
    colors = {
        "red": (255, 0, 0),
        "green": (0, 255, 0),
        "blue": (0, 0, 255),
        "yellow": (255, 255, 0),
        "magenta": (255, 0, 255),
        "cyan": (0, 255, 255),
        "black": (0, 0, 0),
        "white": (255, 255, 255)
    }
    min_distance = float("inf")
    closest_color = None
    for color, value in colors.items():
        distance = sum([(i - j) ** 2 for i, j in zip(rgb, value)])
        if distance < min_distance:
            min_distance = distance
            closest_color = color
    return closest_color

nft_data = pd.read_csv('temp_save_nft_data.csv', low_memory=False).iloc[:100]
nft_data = nft_data.drop_duplicates(subset=nft_data.columns.difference(['usdPrice', 'Unnamed: 0']))


analysis_columns = [
    'from',
    'to',
    'tokenId',
    'nftName',
    'txId',
    'usdPrice',
    'platformName',
    'contractAddress',
    'count',
    'nftPicUrl',
    'collectionName',
    'createOn',
]

filtered_nft_data = nft_data[analysis_columns].loc[nft_data['count'] == 1].drop(columns=['count']).drop_duplicates()

sellers = list(filtered_nft_data['from'].unique())
buyers = list(filtered_nft_data['to'].unique())

actors = list(set(sellers + buyers))

def initialize_data(actors):
    analysed_data = {}
    for actor in actors:
        analysed_data[actor] = {
            'hashes': [],
            'nb_txs': 0,
            'nft_links': [],
            'last_operations': [],
            'operations': {},
            'volume': 0,
            'favorite_color': '',
            'pnl': 0
        }
    return analysed_data    

analysed_data = initialize_data(actors)

for index, row in filtered_nft_data.iterrows():
    hash_id = row['txId']
    timestamp = int(row['createOn'])
    buyer = row['to']
    seller = row['from']
    collection_name = row['collectionName']
    tokenId = row['tokenId']
    nft_name = row['nftName']
    value = float(row['usdPrice'])
    platform = row['platformName']
    contract = row['contractAddress']
    nft_url = row['nftPicUrl']

    analysed_data[buyer]['hashes'].append(hash_id)
    analysed_data[buyer]['nb_txs'] += 1
    analysed_data[buyer]['nft_links'].append(nft_url)
    analysed_data[buyer]['last_operations'].insert(0, hash_id)
    analysed_data[buyer]['volume'] += value

    analysed_data[seller]['hashes'].append(hash_id)
    analysed_data[seller]['nb_txs'] += 1
    analysed_data[seller]['nft_links'].append(nft_url)
    analysed_data[seller]['last_operations'].insert(0, hash_id)
    analysed_data[seller]['volume']  += value

    if (collection_name + '/' + contract in analysed_data[buyer]['operations'].keys()):
        if (nft_name+tokenId in analysed_data[buyer]['operations'][collection_name + '/' + contract].keys()):
            analysed_data[buyer]['operations'][collection_name + '/' + contract][nft_name+tokenId].append({
                            'hash': hash_id,
                            'side': 'buy',
                            'price': value,
                            'platformName': platform,
                            'timestamp': timestamp
                        })
        else:
            analysed_data[buyer]['operations'][collection_name + '/' + contract][nft_name+tokenId] = [{
                'hash': hash_id,
                'side': 'buy',
                'price': value,
                'platformName': platform,
                'timestamp': timestamp
            }]
    else:
        analysed_data[buyer]['operations'][collection_name + '/' + contract] = {}
        analysed_data[buyer]['operations'][collection_name + '/' + contract][nft_name+tokenId] = [{
                'hash': hash_id,
                'side': 'buy',
                'price': value,
                'platformName': platform,
                'timestamp': timestamp
            }]
        
    if (collection_name + '/' + contract in analysed_data[seller]['operations'].keys()):
        if (nft_name+tokenId in analysed_data[seller]['operations'][collection_name + '/' + contract].keys()):
            analysed_data[seller]['operations'][collection_name + '/' + contract][nft_name+tokenId].append({
                            'hash': hash_id,
                            'side': 'sell',
                            'price': value,
                            'platformName': platform,
                            'timestamp': timestamp
                        })
        else:
            analysed_data[seller]['operations'][collection_name + '/' + contract][nft_name+tokenId] = [{
                'hash': hash_id,
                'side': 'sell',
                'price': value,
                'platformName': platform,
                'timestamp': timestamp
            }]
    else:
        analysed_data[seller]['operations'][collection_name + '/' + contract] = {}
        analysed_data[seller]['operations'][collection_name + '/' + contract][nft_name+tokenId] = [{
                'hash': hash_id,
                'side': 'sell',
                'price': value,
                'platformName': platform,
                'timestamp': timestamp
            }]

with open('./analysed_data.pkl', 'wb') as fp:
  pickle.dump(analysed_data, fp)

def get_favorite_color(nft_links, url_to_ref):
    colors = []
    R = 0
    G = 0
    B = 0
    for nft_link in nft_links:
        if nft_link in url_to_ref.keys():
            img = Image.open(url_to_ref[nft_link])
        else:
            response = requests.get(nft_link)
            img = Image.open(BytesIO(response.content))
            if url_to_ref:
                url_to_ref[nft_link] = f"./img/img_{len(url_to_ref.keys())-1}.png"
                img.save(f"./img/img_{len(url_to_ref.keys())-1}.png")
            else:
                url_to_ref[nft_link] = "./img/img_0.png"
                img.save("./img/img_0.png")
        if img.mode == 'RGB':
            colors.extend(list(img.getdata()))
            R += sum([x[0] for x in colors]) / len(colors)
            G += sum([x[1] for x in colors]) / len(colors)
            B += sum([x[2] for x in colors]) / len(colors)

    return get_color_name((R/len(nft_links), G/len(nft_links), B/len(nft_links))), url_to_ref

def get_actor_pnl(operations):
    pnl = 0
    for collection in operations:
        collection_data = operations[collection]
        for NFT in collection_data:
            if NFT != 'collection_volume':
                NFT_data = collection_data[NFT]
                NFT_data.sort(key = lambda x:x['timestamp'])
                if (len(NFT_data) == 1):
                    pnl += 0
                elif (len(NFT_data) % 2 == 0):
                    buy = 0
                    sell = 0
                    for operation in NFT_data:
                        if operation['side'] == 'buy':
                            buy += operation['price']
                        else:
                            sell += operation['price']
                    pnl += sell - buy
                elif (len(NFT_data) % 2 == 1):
                    buy = 0
                    sell = 0
                    for operation in NFT_data[:-1]:
                        if operation['side'] == 'buy':
                            buy += operation['price']
                        else:
                            sell += operation['price']
                    pnl += sell - buy            
    return pnl

def add_per_user_per_collection_volume(operations):
    for collection in operations:
        volume_per_collection = 0
        for nft_id in operations[collection]:
            nft_orders = operations[collection][nft_id]
            for order in nft_orders:
                volume_per_collection += order['price']
        operations[collection]['collection_volume'] = volume_per_collection

try:
    with open('./url_to_ref.pkl', 'rb') as fp:
        url_to_ref = pickle.load(fp)
except:
    url_to_ref = {}

for i, actor in enumerate(actors):
    print(i)
    analysed_data[actor]['favorite_color'], url_to_ref = get_favorite_color(analysed_data[actor]['nft_links'], url_to_ref)
    add_per_user_per_collection_volume(analysed_data[actor]['operations'])
    analysed_data[actor]['pnl'] = get_actor_pnl(analysed_data[actor]['operations'])

with open('./url_to_ref.pkl', 'wb') as fp:
  pickle.dump(url_to_ref, fp)

with open('./final_analysed_data.pkl', 'wb') as fp:
  pickle.dump(analysed_data, fp)