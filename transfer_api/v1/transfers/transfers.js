var ObjectID = require('mongodb').ObjectID;

const common = require('../common');
const lock = require('../accounts/lock');
const accounts = require('../accounts/accounts');
const transfersDb = require('./transfersDb');
const Transfer = require('./Transfer');

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

        let transfer = new Transfer(form);
        transfer.log.push('0. insert new transfer to the database');

        transfersDb.save(transfer, (err) => {
            if (err) return module.exports._setErrored(transfer, err, false, callback);

            module.exports._checkLock(transfer, callback);
        })
    },
    //1. check that the accounts are available
    _checkLock: (transfer, callback) => {
        common.log(FNAME + '_checkLock');
        transfer.log.push('1. check that the accounts are available');

        lock.check([transfer.from, transfer.to], (err, cont) => {
            if (err) return module.exports._setErrored(transfer, err, false, callback);
            if (!cont) return module.exports._setUnsuccessful(transfer, 'Accounts locked', callback);

            module.exports._lockAccounts(transfer, callback);
        })
    },
    //2. lock the "from" & "to" accounts
    _lockAccounts: (transfer, callback) => {
        common.log(FNAME + '_lockAccounts');
        transfer.log.push('2. lock the "from" & "to" accounts');

        lock.lock([transfer.from, transfer.to], (err) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);

            module.exports._checkFromAccount(transfer, callback);
        })
    },
    //3. check from account
    _checkFromAccount: (transfer, callback) => {
        common.log(FNAME + '_checkFromAccount');
        transfer.log.push('3. check that it has enough money');

        accounts.getOne(transfer.from, (err, from_account) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);
            if (from_account === null) return module.exports._setUnsuccessful(transfer, 'Account from does not exist!', callback);
            if (from_account.amount < transfer.amount) return module.exports._setUnsuccessful(transfer, 'Account from does not have enough money!', callback);

            transfer.initial.push(from_account);
            module.exports._checkToAccount(transfer, callback);
        })
    },
    //4. check to account
    _checkToAccount: (transfer, callback) => {
        common.log(FNAME + '_checkToAccount');
        transfer.log.push('4. check to account');

        accounts.getOne(transfer.to, (err, to_account) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);
            if (!to_account) return module.exports._setUnsuccessful(transfer, 'Account "to" does not exist!', callback);

            transfer.initial.push(to_account);
            module.exports._updateFromAccount(transfer, callback);
        })
    },
    //5. substract the transfer amount from the "from" account
    _updateFromAccount: (transfer, callback) => {
        common.log(FNAME + '_updateFromAccount');
        transfer.log.push('5. substract the transfer amount from the "from" account');

        accounts.updateAmount(transfer.from, -transfer.amount, (err) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);

            module.exports._updateToAccount(transfer, callback);
        })
    },
    //6. add the transfer amount to the "to" account
    _updateToAccount: (transfer, callback) => {
        common.log(FNAME + '_updateToAccount');
        transfer.log.push('6. add the transfer amount to the "to" account');

        accounts.updateAmount(transfer.to, transfer.amount, (err) => {
            if (err) return module.exports._setErrored(transfer, err, true, callback);

            module.exports._setSuccessful(transfer, callback);
        })
    },
    //7. set transfer as successful && unlock the "from" & "to" accounts
    _setSuccessful: (transfer, callback) => {
        common.log(FNAME + '_setSuccessful');
        transfer.log.push('7. set transfer as successful && unlock the "from" & "to" accounts');
        transfer.status = 'successful';

        transfersDb.save(transfer, (err) => {
            if (err) return callback(err);

            lock.unlock([transfer.from, transfer.to], () => {
                callback(null, transfer);
            });
        })
    },
    _setErrored: (transfer, err, unlock, callback) => {
        common.log(FNAME + '_setErrored');
        transfer.log.push('ERROR! set transfer as errored && unlock if needed the "from" & "to" accounts');
        transfer.status = 'errored';
        transfer.err = err;
        transfer.msg = 'Please contact us. An error happened, your transaction couldn\'t be processed';

        transfersDb.save(transfer, (err) => {
            if (err) return callback(err);
            if (!unlock) return callback(null, transfer);

            lock.unlock([transfer.from, transfer.to], () => {
                callback(null, transfer);
            });
        })
    },
    _setUnsuccessful: (transfer, desc, callback) => {
        common.log(FNAME + '_setUnsuccessful');
        transfer.log.push('Unsuccessful! ' + desc);
        transfer.status = 'unsuccessful';
        transfer.msg = desc;

        transfersDb.save(transfer, (err) => {
            if (err) return callback(err);

            lock.unlock([transfer.from, transfer.to], () => {
                callback(null, transfer);
            });
        })
    }
};
