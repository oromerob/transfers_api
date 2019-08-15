const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27019';
const dbName = 'TransferAPI';
const client = new MongoClient(url);

module.exports = {
    lock: function (ids, callback) {
        client.connect(function (err, client) {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("lock").insertMany(ids, function (err) {
                if (err) return callback(err);
                client.close();
                callback()
            })
        })
    },
    unlock: function (ids, callback) {
        client.connect(function (err, client) {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("lock").deleteMany(ids, function (err) {
                if (err) return callback(err);
                client.close();
                callback()
            })
        })
    },
    check: function (ids, callback) {
        client.connect(function (err, client) {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("lock").find(ids).toArray(function (err, items) {
                if (err) return callback(err);
                client.close();
                if (items.length > 0) return callback(null, false);
                callback(null, true)
            })
        })
    }
};
