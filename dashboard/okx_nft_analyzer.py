import pickle
import requests
import pandas as pd
from PIL import Image
from io import BytesIO

def unique(sequence):
    """
    return unique values keeping order of a list
    @params:
        sequence        - Required  : sequence with duplicates ([str])
    """

    # Init empty set
    seen = set()
    # return ordered set from list
    return [x for x in sequence if not (x in seen or seen.add(x))]

def initialize_data(actors):
    """
    Build an Empty dictionnary to store actors information
    @params:
        actors          - Required  : user having bought/sold NFTs ([str])
    """
    # Init Empty dictionnary
    analysed_data = {}

    # For each actor, init a dictionnary with the relevant fields
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

def get_color_name(RGB):
    """
    get closest color name from RGB values
    @params:
        RGB             - Required  : RGB triple (int, int, int)
    """
    # Defining the color palette
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
    # Init variable to define the closest color
    min_distance = float("inf")
    closest_color = None
    # Define min distance to pick closest color
    for color, value in colors.items():
        distance = sum([(i - j) ** 2 for i, j in zip(RGB, value)])
        if distance < min_distance:
            min_distance = distance
            closest_color = color
    return closest_color

def get_favorite_color(nft_links, url_to_ref):
    """
    Defining the favorite color of an actor from its list of NFTs
    @params:
        nft_links           - Required  : list of urls of NFTs ([str])
        url_to_ref          - Required  : mapping from NFT url to local address (dict)
    """
    # Init variables to get RGB values
    colors = []
    R = 0
    G = 0
    B = 0
    # Iterate over NFT links
    for nft_link in nft_links:
        # Check If NFT already downloaded locally
        if nft_link in url_to_ref.keys():
            # Use local image if already downloaded
            img = Image.open(url_to_ref[nft_link])
        else:
            # Request image if not already downloaded
            response = requests.get(nft_link)
            img = Image.open(BytesIO(response.content))

            # Update mapping url to ref and Save Image
            if url_to_ref:
                url_to_ref[nft_link] = f"./img/img_{len(url_to_ref.keys())-1}.png"
                img.save(f"./img/img_{len(url_to_ref.keys())-1}.png")
            else:
                url_to_ref[nft_link] = "./img/img_0.png"
                img.save("./img/img_0.png")
        
        # Get RGB values from RGB images
        if img.mode == 'RGB':
            colors.extend(list(img.getdata()))
            R += sum([x[0] for x in colors]) / len(colors)
            G += sum([x[1] for x in colors]) / len(colors)
            B += sum([x[2] for x in colors]) / len(colors)

    return get_color_name((R/len(nft_links), G/len(nft_links), B/len(nft_links))), url_to_ref

def add_per_user_per_collection_volume(operations):
    """
    Add volume for each collection per user
    @params:
        operations             - Required  : user operation on NFT marketplace (dict)
    """
    # Iterate over collections
    for collection in operations:
        volume_per_collection = 0
        # Iterate over NFTs in collections
        for nft_id in operations[collection]:
            nft_orders = operations[collection][nft_id]
            # Iterate over orders for a given NFT in the collection
            for order in nft_orders:
                volume_per_collection += order['price']
        # Add volume for the given collection
        operations[collection]['collection_volume'] = volume_per_collection

def get_actor_pnl(operations):
    """
    Construct actor PNL from its operations on the NFT market place
    @params:
        operations             - Required  : user operation on NFT marketplace (dict)
    """
    # Initialize user PNL to 0
    pnl = 0
    # Iterate over the collections the actor interacted with
    for collection in operations:
        collection_data = operations[collection]
        # Iterate over the NFTs the actor interacted with
        for NFT in collection_data:
            if NFT != 'collection_volume':
                NFT_data = collection_data[NFT]
                NFT_data.sort(key = lambda x:x['timestamp']) # sort data to have NFT in chronological order
                # If actor has only 1 operation with an NFT, PNL is 0
                if (len(NFT_data) == 1):
                    pnl += 0
                # If actor has even number of interactions 
                elif (len(NFT_data) % 2 == 0):
                    buy = 0
                    sell = 0
                    for operation in NFT_data:
                        if operation['side'] == 'buy':
                            buy += operation['price']
                        else:
                            sell += operation['price']
                    pnl += sell - buy
                # If actor has even number of interactions with a given NFT
                elif (len(NFT_data) % 2 == 1):
                    buy = 0
                    sell = 0
                    # PNL only calculated on pairs of interactions with the NFT
                    for operation in NFT_data[:-1]:
                        if operation['side'] == 'buy':
                            buy += operation['price']
                        else:
                            sell += operation['price']
                    pnl += sell - buy            
    return pnl

def analyse_NFT_maketplace ():
    nft_data = pd.read_csv('temp_save_nft_data.csv', low_memory=False)
    nft_data = nft_data.drop_duplicates(subset=nft_data.columns.difference(['usdPrice', 'Unnamed: 0']))

    # Defining relevant DF fields for NFT analysis
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

analyse_NFT_maketplace()