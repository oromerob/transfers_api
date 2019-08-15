const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27019';
const dbName = 'TransferAPI';
const client = new MongoClient(url);


module.exports = {
    getOne: (id, callback) => {
        client.connect(function (err, client) {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("accounts").findOne({_id: id}, function (err, item) {
                if (err) return callback(err);
                client.close();
                callback(null, item)
            })
        })
    },
    updateAmount: (id, amount, callback) => {
        client.connect(function (err, client) {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("accounts").updateOne({_id: id}, {$set: {amount: amount}}, function (err, result) {
                if (err) return callback(err);
                client.close();
                callback(null)
            })
        })
    }
};