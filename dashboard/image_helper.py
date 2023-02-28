import cairosvg
import pickle
import requests
import threading

import pandas as pd
from PIL import Image
from io import BytesIO

from config import NFT_MARKETPLACE_RAW_DATA

raw_data = NFT_MARKETPLACE_RAW_DATA

nft_data = pd.read_csv(raw_data, low_memory=False)
nft_data = nft_data.drop_duplicates(subset=nft_data.columns.difference(['usdPrice', 'Unnamed: 0']))

# Load mapping if stored locally
try:
    with open('./url_to_ref.pkl', 'rb') as fp:
        url_to_ref = pickle.load(fp)
except:
    url_to_ref = {}

# Function to split the images into an iterator of chunks
def split(a, n):
    k, m = divmod(len(a), n)
    return (a[i*k+min(i, m):(i+1)*k+min(i+1, m)] for i in range(n))

col = 'nftPicUrl'
images = list(set(nft_data[col].tolist()))
images = split(images, 8)

# Construct the chunks for the multithreading
thread_images = []
for chunck in images:
    thread_images.append(chunck)

def get_images(images, thread):

    """
    Image saver for NFT analysis
    @params:
        images             - Required  : list of chunks of url ([[str]])
        thread             - Required  : thread number (int)
    """

    images = images[thread]
    # Iterate over the images for a given thread
    for i, x in enumerate(images):
        print(i, '/', len(images))
        try:
            if x in url_to_ref.keys():
                continue
            elif x.endswith('svg'):
                if url_to_ref:
                    try:
                        cairosvg.svg2png(url=x, write_to=f"./img/img_{len(url_to_ref.keys())-1}.png")
                        img = Image.open(f"./img/img_{len(url_to_ref.keys())-1}.png")
                        url_to_ref[x] = f"./img/img_{len(url_to_ref.keys())-1}.png"
                    except:
                        print('Can t get this image')
                        continue
                else:
                    try:
                        cairosvg.svg2png(url=x, write_to="./img/img_0.png")
                        img = Image.open("./img/img_0.png")
                        url_to_ref[x] = "./img/img_0.png"
                    except:
                        print('Can t get this image')
                        continue
            else:
                try:
                    response = requests.get(x)
                    img = Image.open(BytesIO(response.content))
                except:
                    print('Can t get this image')
                    continue
                if url_to_ref:
                    img.save(f"./img/img_{len(url_to_ref.keys())-1}.png")
                    url_to_ref[x] = f"./img/img_{len(url_to_ref.keys())-1}.png"                
                else:
                    img.save("./img/img_0.png")
                    url_to_ref[x] = "./img/img_0.png"

        except:
            continue

# Define the threading operations
t1 = threading.Thread(target=get_images, args=(thread_images, 0,))
t2 = threading.Thread(target=get_images, args=(thread_images, 1,))
t3 = threading.Thread(target=get_images, args=(thread_images, 2,))
t4 = threading.Thread(target=get_images, args=(thread_images, 3,))
t5 = threading.Thread(target=get_images, args=(thread_images, 4,))
t6 = threading.Thread(target=get_images, args=(thread_images, 5,))
t7 = threading.Thread(target=get_images, args=(thread_images, 6,))
t8 = threading.Thread(target=get_images, args=(thread_images, 7,))

t1.start()
t2.start()
t3.start()
t4.start()
t5.start()
t6.start()
t7.start()
t8.start()

t1.join()
t2.join()
t3.join()
t4.join()
t5.join()
t6.join()
t7.join()
t8.join()


# Save the mapping
with open('./url_to_ref.pkl', 'wb') as fp:
    pickle.dump(url_to_ref, fp)