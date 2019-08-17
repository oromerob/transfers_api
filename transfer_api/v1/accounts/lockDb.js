const MongoClient = require('mongodb').MongoClient;

const config = require('../../config');

const dbName = 'TransferAPI';
const client = new MongoClient(config.mongoUrl);

module.exports = {
    lock: (ids, callback) => {
        client.connect((err, client) => {
            if (err) return callback(err);

            const db = client.db(dbName);

            let items = ids.map((item) => {
                return {_id: item};
            });
            db.collection("lock").insertMany(items, (err) => {
                if (err) return callback(err);
                callback()
            })
        })
    },
    unlock: (ids, callback) => {
        client.connect((err, client) => {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("lock").deleteMany({_id: {$in: ids}}, (err) => {
                if (err) return callback(err);
                callback()
            })
        })
    },
    check: (ids, callback) => {
        client.connect((err, client) => {
            if (err) return callback(err);

            const db = client.db(dbName);
            db.collection("lock").find({_id: {$in: ids}}).toArray((err, items) => {
                if (err) return callback(err);
                if (items.length > 0) return callback(null, false);
                callback(null, true)
            })
        })
    }
};
