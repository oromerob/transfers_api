const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27019';
const dbName = 'TransferAPI';
const client = new MongoClient(url);

module.exports = {
    getOne: (id, callback) => {
        // get transfer from database
        client.connect(function (err, client) {
            if(err) return callback(err);

            const db = client.db(dbName);
            db.collection("transfers").findOne({ _id: id }, function(err, item) {
                if (err) return callback(err);
                client.close();
                callback(null, item)
            })
        })
    },
    getList: (callback) => {
        // get transfers from database
        client.connect(function (err, client) {
            if(err) return callback(err);

            const db = client.db(dbName);
            db.collection("transfers").find({}).limit(10).toArray(function(err, docs) {
                if (err) return callback(err);
                client.close();
                callback(null, docs)
            })
        })
    },
    new: (transfer, callback) => {
        // add transfer to database
        client.connect(function (err, client) {
            if(err) return callback(err);

            const db = client.db(dbName);
            db.collection("transfers").insertOne(transfer, function(err, result) {
                if (err) return callback(err);
                client.close();
            })
        })
    },
    updateStatus: (id, status, callback) => {
        client.connect(function (err, client) {
            if(err) return callback(err);

            const db = client.db(dbName);
            db.collection("transfers").updateOne({_id: id}, {$set: status}, function(err, result) {
                if (err) return callback(err);
                client.close();
            })
        })
    }
};