## @package handler
#  Handler for all available tp operations.
#
#  handler module calls necessary action to be applied.
import hashlib
import logging
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction
import operation1 as operation1
import operation2 as operation2
import json
import os
import cbor


current_dir=os.path.dirname(__file__)

#Enable logging
LOGGER = logging.getLogger(__name__)
with open(os.path.join(current_dir, './config.json')) as json_config:
    config = json.load(json_config)
LOGGER.debug("CONFIG FILE-"+config["FAMILY_NAME"])

# transaction family name imported from config
FAMILY_NAME = config["FAMILY_NAME"]

# Transaction family address prefix generated
TF_ADDRESS_PREFIX = hashlib.sha512(
    FAMILY_NAME.encode('utf-8')).hexdigest()[0:6]

## TXHandler class (inherits TransactionHandler)
#
#  responsible for handling tp operations.
class ExampleTXHandler(TransactionHandler):
    LOGGER.debug("In Example handler")
    ## family_name .
    # @param self    
    @property
    def family_name(self):
        return FAMILY_NAME
    ## family_name 
    # @param self   
    @property
    def family_versions(self):
        return [config["VERSION"]]
    ## namespaces 
    # @param self   
    @property
    def namespaces(self):
        return [TF_ADDRESS_PREFIX]
    ## apply 
    # @param self
    # @param transaction The transaction object 
    # @param context
    def apply(self, transaction, context):

        payloadobj = cbor.loads(transaction.payload)

        LOGGER.debug(payloadobj)

        signer = transaction.header.signer_public_key

        actionSwitcher= {
            'ADD':operation1.add_operation,
            'SUBTRACT':operation2.subtract_operation,
        }
        if not (payloadobj['action'] in actionSwitcher):
            raise InvalidTransaction("No action taken")

        command=actionSwitcher[payloadobj['action']]
        command(payloadobj,signer,context)

        LOGGER.debug("Action Performed")

