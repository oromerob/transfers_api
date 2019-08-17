const MongoClient = require('mongodb').MongoClient;

const config = require('../../config');

const dbName = 'TransferAPI';
const client = new MongoClient(config.mongoUrl);


module.exports = {
    getOne: (id, callback) => {
        client.connect( (err, client) => {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("accounts").findOne({_id: id}, (err, item) => {
                if (err) return callback(err);
                callback(null, item)
            })
        })
    },
    updateAmount: (id, amount, callback) => {
        client.connect((err, client) => {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("accounts").updateOne({_id: id}, {$set: {amount: amount}}, (err, result) => {
                if (err) return callback(err);
                callback(null)
            })
        })
    }
};
