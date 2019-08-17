const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27019';
const dbName = 'TransferAPI';
const client = new MongoClient(url);

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
                // client.close();
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
                // client.close();
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
                // client.close();
                if (items.length > 0) return callback(null, false);
                callback(null, true)
            })
        })
    }
};
