const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const txContext = require('sawtooth-sdk/processor/context')
var protoObj = require("protobufjs");
const keyOps = require("./keyOps");
const context = createContext('secp256k1')
var readlineSync = require('readline-sync');
const restapiURL = 'http://rest-api:8008'

const request = require('request')
var signer;
var userPublicKey;

//actions which we are performed
const Action = {
    ADD: 'ADD',
    SUBTRACT: 'SUBTRACT'
}
const cbor = require('cbor')

//payload
var payload = {}

// process
option = readlineSync.question('options?' + "\n" + '0 = Create Private key' + "\n" + '1 = Doing Transaction' + "\n" + '2 = Show Results' + "\n" + 'Enter your choice' + "\n");
if (option == '0') {
    PrivateKey();
    return;
}
else if (option == '1') {
    DoingTransaction().then((data) => {

    }).catch((e) => {
        console.log("eror in DoingTransaction promise", e)
    });
}
else if (option == '2') {
    getResult().then((data) => {
        let option1 = data.success
        if (option1) {
            console.log("here in suiccess")
        }
    }).catch((e) => {
        console.log("eror in opromise", e)
    });
}






/**
 * Creates a nonce for transaction
 * @returns {string} Nonce
 */


function getNonce() {
    var dateString = Date.now().toString(36).slice(-5);
    var randomString = Math.floor(Math.random() * 46655).toString(36);
    return dateString + ('00' + randomString).slice(-3);
}


//create private key
function PrivateKey() {

    // creation operation for private key
    console.log("Creation of private key")
    username = readlineSync.question('username  ');
    PrivateKey = keyOps.createPrivateKeyForUser(username);//user Private Key
    console.log("private key", PrivateKey);
    return PrivateKey

}


// doing transaction
function DoingTransaction() {
    // doing transaction
    console.log("doing transaction");
    username = readlineSync.question('username: ');
    PrivateKey = keyOps.getPrivateKey(username);//user Private Key
    payload.user_id = username;
    choice = readlineSync.question('oprations choice?' + "\n" + '1. = Add' + "\n" + '2. = Subtraction' + "\n" + 'Enter your choices' + "\n");
    payload.action = (choice == 1) ? Action.ADD : Action.SUBTRACT;
    payload.value1 = parseInt(readlineSync.question('value1 '));
    payload.value2 = parseInt(readlineSync.question('value2 '));
    // decoding PrivateKey
    var decodedPriv = Buffer.from(PrivateKey, 'hex')
    var privateBuffer = {
        privateKeyBytes: decodedPriv
    }
    return new Promise((resolve, reject) => {
        console.log("after decoding hexadecimal- ", privateBuffer)
        var signer = new CryptoFactory(context).newSigner(privateBuffer);



        // Encoding of Payload
        const payloadBytes = cbor.encode(payload)
        console.log("payload Bytes-", payloadBytes)



        const { createHash } = require('crypto')
        const { protobuf } = require('sawtooth-sdk')

        /**
         * Creates a signed transaction
         * @param {string} payloadBytes Payload of transaction 
         * @param {object} signer Secp256k1 signer object
         * @param {[string]} inputs Transaction inputs
         * @param {[string]} outputs Transaction outputs 
         * @param {[string]} dependencies Transaction dependencies
         * @param {string} familyName Family Name
         * @param {string} familyVersion Family version
         * @param {string} batchSignerPublicKey Batch signer's hex encoded public key
         */

        const transactionHeaderBytes = protobuf.TransactionHeader.encode({
            batcherPublicKey: signer.getPublicKey().asHex(),
            dependencies: [],
            familyName: 'python_tp',
            familyVersion: '1.0',
            inputs: [],
            nonce: getNonce(),
            outputs: ['dc21fb'],
            payloadSha512: createHash('sha512').update(payloadBytes).digest('hex'),
            signerPublicKey: signer.getPublicKey().asHex()
            // In this example, we're signing the batch with the same private key,
            // but the batch can be signed by another party, in which case, the
            // public key will need to be associated with that key.
        }).finish()

        console.log("Transaction header- ", transactionHeaderBytes)



        const signature = signer.sign(transactionHeaderBytes)

        const transaction = protobuf.Transaction.create({
            header: transactionHeaderBytes,
            headerSignature: signature,
            payload: payloadBytes
        })


        console.log("Transaction- ", transaction);



        const transactions = [transaction]

        const batchHeaderBytes = protobuf.BatchHeader.encode({
            signerPublicKey: signer.getPublicKey().asHex(),
            transactionIds: transactions.map((txn) => txn.headerSignature),
        }).finish()

        console.log("batch header bytes- ", batchHeaderBytes);

        // creation of batch

        const batchSignature = signer.sign(batchHeaderBytes)

        const batch = protobuf.Batch.create({
            header: batchHeaderBytes,
            headerSignature: batchSignature,
            transactions: transactions,
            trace: true

        });

        const batchListBytes = protobuf.BatchList.encode({
            batches: [batch]
        }).finish()

        console.log("BatchListAsbytes- ", batchListBytes)


        request.post({
            url: restapiURL + '/batches',
            body: batchListBytes,
            headers: { 'Content-Type': 'application/octet-stream' }
        }, (err, response) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            console.log(response.body)
            resolve(response.body);

        })
    })




}

// get Results
function getResult() {
    return new Promise((resolve, reject) => {
        request.get({
            url: restapiURL + '/state'
        }, (err, response) => {
            if (err) {
                console.log("error in getResult", err)
                reject(err)
            }
            var data = JSON.parse(response.body);
            console.log("views the Results")
            for (var i = 0; i < (data.data.length); i++) {
                console.log("Addresses :-" + data.data[i].address + "  :" + "Result ", Buffer.from(data.data[i].data, "base64").toString());
            }

            resolve({ success: true })
        })

    })
}




