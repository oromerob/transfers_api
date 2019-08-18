const MongoClient = require('mongodb').MongoClient;

const config = require('../config');

const dbName = 'TransferAPI';
const client = new MongoClient(config.mongoUrl);

module.exports = {
    getOne: (id, callback) => {
        // get transfer from database
        client.connect((err, client) => {
            if(err) return callback(err);

            const db = client.db(dbName);
            db.collection("transfers").findOne({ _id: id }, (err, item) => {
                if (err) return callback(err);
                callback(null, item)
            })
        })
    },
    getList: (callback) => {
        // get transfers from database
        client.connect((err, client) => {
            if(err) return callback(err);

            const db = client.db(dbName);
            db.collection("transfers").find({}).limit(10).toArray((err, docs) => {
                if (err) return callback(err);
                callback(null, docs)
            })
        })
    },
    save: (transfer, callback) => {
        client.connect((err, client) => {
            if(err) return callback(err);

            const db = client.db(dbName);
            db.collection("transfers").replaceOne({_id: transfer._id}, transfer, {upsert: true}, (err, result) => {
                if (err) return callback(err);
                callback();
            })
        })
    }
};