var ObjectID = require('mongodb').ObjectID;

const common = require('../../common');
const lock = require('../accounts/lock');
const accounts = require('../accounts/accounts');
const transfersDb = require('./transfersDb');

const FNAME = 'v1.transfers.transfers.';

module.exports = {
    getOne: (id, callback) => {
        common.log(FNAME + 'getOne');
        // get transfer from database
        transfersDb.getOne(id, callback);
    },
    getList: (callback) => {
        common.log(FNAME + 'getList');
        transfersDb.getList(callback);
    },
    //0. insert new transfer to the database with status pending
    new: (form, callback) => {
        common.log(FNAME + 'new');

        const transfer = {
            _id: new ObjectID(),
            from: form.from,
            to: form.to,
            amount: form.amount,
            status: 'pending'
        };

        transfersDb.new(transfer, (err) => {
            if (err) return module.exports._setErrored(transfer, err, false, callback);

            module.exports._checkLock(transfer, callback);
        })
    },
    //1. check that the accounts are available
    _checkLock: (transfer, callback) => {
        common.log(FNAME + '_checkLock');

        lock.check([transfer.from, transfer.to], (err, cont) => {
            if (err) return module.exports._setErrored(transfer, err, false, callback);
            if (!cont) return module.exports._setUnsuccessful(transfer, 'Accounts locked', callback);

            module.exports._lockAccounts(transfer, callback);
        })
    },
    //2. lock the "from" & "to" accounts
    _lockAccounts: (transfer, callback) => {
        common.log(FNAME + '_lockAccounts');

        lock.lock([transfer.from, transfer.to], (err) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);

            module.exports._checkAccount(transfer, callback);
        })
    },
    //3. check that it has enough money
    _checkAccount: (transfer, callback) => {
        common.log(FNAME + '_checkAccount');

        accounts.getOne(transfer.from, (err, from_account) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);
            if (from_account === null) return module.exports._setUnsuccessful(transfer, 'Account from does not exist!', callback);
            if (from_account.amount < transfer.amount) return module.exports._setUnsuccessful(transfer, 'Account from does not have enough money!', callback);

            module.exports._updateFromAccount(transfer, callback);
        })
    },
    //4. substract the transfer amount from the "from" account
    _updateFromAccount: (transfer, callback) => {
        common.log(FNAME + '_updateFromAccount');

        accounts.updateAmount(transfer.from, -transfer.amount, (err) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);

            module.exports._updateToAccount(transfer, callback);
        })
    },
    //5. add the transfer amount to the "to" account
    _updateToAccount: (transfer, callback) => {
        common.log(FNAME + '_updateToAccount');

        accounts.updateAmount(transfer.to, transfer.amount, (err) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);

            module.exports._setSuccessful(transfer, callback);
        })
    },
    //6. set transfer as successful && unlock the "from" & "to" accounts
    _setSuccessful: (transfer, callback) => {
        common.log(FNAME + '_setSuccessful');

        transfersDb.updateStatus(transfer._id, {status: 'successful'}, (err) => {
            if (err) return callback(err);

            lock.unlock([transfer.from, transfer.to], callback);
        })
    },
    _setErrored: (transfer, err, unlock, callback) => {
        common.log(FNAME + '_setErrored');

        const status = {
            status: 'errored',
            err: err
        };

        transfersDb.updateStatus(transfer._id, status, (err) => {
            if (err) return callback(err);
            if (!unlock) return callback();

            lock.unlock([transfer.from, transfer.to], () => {
                callback({status: 'error', msg: 'Please contact us. An error happened, your transaction couldn\'t be processed'});
            });
        })
    },
    _setUnsuccessful: (transfer, desc, callback) => {
        common.log(FNAME + '_setUnsuccessful');

        const status = {
            status: 'unsuccessful',
            msg: desc
        };

        transfersDb.updateStatus(transfer._id, status, (err) => {
            if (err) return callback(err);

            lock.unlock([transfer.from, transfer.to], () => {
                callback(status);
            });
        })
    }
};
