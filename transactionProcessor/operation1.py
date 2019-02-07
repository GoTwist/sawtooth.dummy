import logging
from sawtooth_sdk.processor.exceptions import InvalidTransaction
import addressing as Addressing


LOGGER = logging.getLogger(__name__)

def add_operation(payloadobj,signer,context):
    LOGGER.debug("Add Operation")
    write_sets = {}
    # create address
    address=Addressing.get_operation_address("ADD_OPERATION",signer,payloadobj['user_id'])

    #perform Subtract operation
    
    result = payloadobj['value1'] + payloadobj['value2']

    write_sets[address] = (""+str(payloadobj['value1'])+" + "+str(payloadobj['value2'])+" = "+str(result)).encode('utf-8')
    context.set_state(write_sets)




































    
    