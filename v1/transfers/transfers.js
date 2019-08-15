var ObjectID = require('mongodb').ObjectID;

var transfersDb = require('./transfersDb');
var lock = require('../lock/lock');
var accounts = require('../accounts/accounts');

module.exports = {
    getOne: function (id, callback) {
        // get transfer from database
        transfersDb.getOne(id, callback);
    },
    getList: function (callback) {
        transfersDb.getList(callback);
    },
    new: function (form, callback) {
        const transfer = {
            _id: new ObjectID(),
            from: form.from,
            to: form.to,
            amount: form.amount,
            status: 'pending'
        };

        //0. insert new transfer to the database with status pending
        transfersDb.new(transfer, (err) => {
            if (err) return this._setErrored(transfer, err, false, callback);

            //1. check that the accounts are available
            lock.check([{_id: transfer.from}, {_id: transfer.to}], (err, cont) => {
                if (err) return this._setErrored(transfer, err, false, callback);
                if (!cont) return this._setUnsuccessful(transfer, 'Accounts locked', callback);

                //2. lock the "from" & "to" accounts
                lock.lock([{_id: transfer.from}, {_id: transfer.to}], (err) => {
                    if (err) return this._setErrored(transfer, err, true, callback);

                    //3. check that it has enough money
                    accounts.getOne(transfer.from, (err, from_account) => {
                        if (err) return this._setErrored(transfer, err, true, callback);
                        if (from_account === null) return this._setUnsuccessful(transfer, 'Account from does not exist!', callback);
                        if (from_account.amount < transfer.amount) return this._setUnsuccessful(transfer, 'Account from does not have enough money!', callback);

                        //4. substract the transfer amount from the "from" account
                        accounts.updateAmount(transfer.from, -transfer.amount, (err) => {
                            if (err) return this._setErrored(transfer, err, true, callback);

                            //5. add the transfer amount to the "to" account
                            accounts.updateAmount(transfer.to, transfer.amount, (err) => {
                                if (err) return this._setErrored(transfer, err, true, callback);

                                //6. set transfer as successful && unlock the "from" & "to" accounts
                                this._setSuccessful(transfer, callback);
                            })
                        })
                    })
                })
            })
        })
    },
    _setSuccessful: function (transfer, callback) {
        transfersDb.updateStatus(transfer._id, {status: 'successful'}, (err) => {
            if (err) return callback(err);

            lock.unlock([{_id: transfer.from}, {_id: transfer.to}], callback);
        })
    },
    _setErrored: function (transfer, err, unlock, callback) {
        const status = {
            status: 'errored',
            err: err
        };

        transfersDb.updateStatus(transfer._id, status, (err) => {
            if (err) return callback(err);
            if (!unlock) return callback();

            lock.unlock([{_id: transfer.from}, {_id: transfer.to}], callback);
        })
    },
    _setUnsuccessful: function (transfer, desc, callback) {
        const status = {
            status: 'unsuccessful',
            desc: desc
        };

        transfersDb.updateStatus(transfer._id, status, (err) => {
            if (err) return callback(err);
            if (!unlock) return callback();

            lock.unlock([{_id: transfer.from}, {_id: transfer.to}], callback);
        })
    }
};