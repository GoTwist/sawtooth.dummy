
import hashlib
import json
import os
from sawtooth_sdk.processor.exceptions import InvalidTransaction
current_dir=os.path.dirname(__file__)
with open(os.path.join(current_dir, './config.json')) as json_config:
    config = json.load(json_config)

TF_ADDRESS_PREFIX = hashlib.sha512(config["FAMILY_NAME"].encode('utf-8')).hexdigest()[0:6]


"""
get_operation_address- creates addresses for each element being stored on blockchain
addressing scheme- | family prefix namespace(6 characters)    |   +   | user namespace(10 characters)  |     +     | asset type namespace(6 characters)   |   +   |  asset ID(58 characters)        |
                   |              sha512(family_name)[0:6]    |       |             signer[0:10]       |           |         sha512(asset_type)[0:6]      |       |   sha512(asset_address)[0:48]   |
"""

def get_operation_address(operationType,signer,user_ids):
    return TF_ADDRESS_PREFIX + signer[0:10] + hashlib.sha256(operationType.encode('utf-8')).hexdigest()[:6]  +  hashlib.sha512(user_ids.encode('utf-8')).hexdigest()[0:48]


