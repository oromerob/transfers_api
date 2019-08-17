const common = require('../../common');
const lockDb = require('./lockDb');

const FNAME = 'v1.accounts.lock.';

module.exports = {
    lock: (ids, callback) => {
        common.log(FNAME + 'lock');
        lockDb.lock(ids, callback);
    },
    unlock: (ids, callback) => {
        common.log(FNAME + 'unlock');
        lockDb.unlock(ids, callback);
    },
    check: (ids, callback) => {
        common.log(FNAME + 'check');
        lockDb.check(ids, callback);
    }
};
