import logging
from sawtooth_sdk.processor.exceptions import InvalidTransaction
import addressing as Addressing


LOGGER = logging.getLogger(__name__)


def subtract_operation(payloadobj,signer,context):
    LOGGER.debug("Subtract Operation")
    write_sets = {}

    # create address
    address=Addressing.get_operation_address("SUBTRACT_OPERATION",signer,payloadobj['user_id'])
    
    #perform Subtraction operation
    result = payloadobj['value1'] - payloadobj['value2']

    write_sets[address] = (""+str(payloadobj['value1'])+" - "+str(payloadobj['value2'])+" = "+str(result)).encode('utf-8')
    context.set_state(write_sets)