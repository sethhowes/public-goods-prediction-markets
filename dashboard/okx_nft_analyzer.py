import pickle
import requests

import pandas as pd
from PIL import Image
from io import BytesIO


def sort_list(list1, list2):
    zipped_pairs = zip(list2, list1)
    z = [x for _, x in sorted(zipped_pairs, reverse=True)]
    return z

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

nft_data = pd.read_csv('temp_save_nft_data.csv', low_memory=False)
nft_data = nft_data.drop_duplicates(subset=nft_data.columns.difference(['usdPrice']))
analysed_data = {}

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

for i, actor in enumerate(actors):

    print(i)

    hashes = []
    timestamps = []
    nft_links = []
    volume = 0
    operations = {}

    for index, row in filtered_nft_data.iterrows():
        if (row['from'] == actor) or (row['to'] == actor):

            hashes.append(row['txId'])
            timestamps.append(int(row['createOn']))
            nft_links.append(row['nftPicUrl'])
            volume += float(row['usdPrice'])

            if (row['from'] == actor):
                if (row['collectionName'] + '/' + row['contractAddress'] in operations.keys()):
                    if row['nftName']+row['tokenId'] in operations[row['collectionName'] + '/' + row['contractAddress']].keys():
                        operations[row['collectionName'] + '/' + row['contractAddress']][row['nftName']+row['tokenId']].append({
                            'hash': row['txId'],
                            'side': 'sell',
                            'price': float(row['usdPrice']),
                            'platformName': row['platformName'],
                            'timestamp': int(row['createOn'])
                        })
                    else:
                        operations[row['collectionName'] + '/' + row['contractAddress']][row['nftName']+row['tokenId']] = [{
                                'hash': row['txId'],
                                'side': 'sell',
                                'price': float(row['usdPrice']),
                                'platformName': row['platformName'],
                                'timestamp': int(row['createOn'])
                            }]
                else:
                    operations[row['collectionName'] + '/' + row['contractAddress']] = {}
                    operations[row['collectionName'] + '/' + row['contractAddress']][row['nftName']+row['tokenId']] = [{
                                'hash': row['txId'],
                                'side': 'sell',
                                'price': float(row['usdPrice']),
                                'platformName': row['platformName'],
                                'timestamp': int(row['createOn'])
                            }]
                        
            else:
                if (row['collectionName'] + '/' + row['contractAddress'] in operations.keys()):
                    if row['nftName']+row['tokenId'] in operations[row['collectionName'] + '/' + row['contractAddress']].keys():
                        operations[row['collectionName'] + '/' + row['contractAddress']][row['nftName']+row['tokenId']].append({
                            'hash': row['txId'],
                            'side': 'buy',
                            'price': float(row['usdPrice']),
                            'platformName': row['platformName'],
                            'timestamp': int(row['createOn'])
                        })
                    else:
                        operations[row['collectionName'] + '/' + row['contractAddress']][row['nftName']+row['tokenId']] = [{
                                'hash': row['txId'],
                                'side': 'buy',
                                'price': float(row['usdPrice']),
                                'platformName': row['platformName'],
                                'timestamp': int(row['createOn'])
                            }]
                else:
                    operations[row['collectionName'] + '/' + row['contractAddress']] = {}
                    operations[row['collectionName'] + '/' + row['contractAddress']][row['nftName']+row['tokenId']] = [{
                                'hash': row['txId'],
                                'side': 'buy',
                                'price': float(row['usdPrice']),
                                'platformName': row['platformName'],
                                'timestamp': int(row['createOn'])
                            }]

    analysed_data[actor] = {
        'hashes': list(set(hashes)),
        'nb_txs': len(hashes),
        'nft_links': list(set(nft_links)),
        'last_operations': unique(sort_list(hashes, timestamps)),
        'operations': operations,
        'volume': volume,
    }


with open('./analysed_data.pkl', 'wb') as fp:
  pickle.dump(analysed_data, fp)

def get_favorite_color(nft_links):
    colors = []
    R = 0
    G = 0
    B = 0
    for nft_link in nft_links:
        response = requests.get(nft_link)
        img = Image.open(BytesIO(response.content))
        if img.mode == 'RGB':
            colors.extend(list(img.getdata()))
            R += sum([x[0] for x in colors]) / len(colors)
            G += sum([x[1] for x in colors]) / len(colors)
            B += sum([x[2] for x in colors]) / len(colors)

    return get_color_name((R/len(nft_links), G/len(nft_links), B/len(nft_links)))

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

for i, actor in enumerate(actors):
    print(i)
    analysed_data[actor]['favorite_color'] = get_favorite_color((analysed_data[actor]['nft_links']))
    add_per_user_per_collection_volume(analysed_data[actor]['operations'])
    analysed_data[actor]['pnl'] = get_actor_pnl(analysed_data[actor]['operations'])

with open('./final_analysed_data.pkl', 'wb') as fp:
  pickle.dump(analysed_data, fp)