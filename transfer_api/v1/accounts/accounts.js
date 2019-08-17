const common = require('../../common');
const accountsDb = require('./accountsDb');

const FNAME = 'v1.accounts.accounts.';

module.exports = {
    getOne: (id, callback) => {
        common.log(FNAME + 'getOne');
        accountsDb.getOne(id, callback);
    },
    updateAmount: (id, amount, callback) => {
        common.log(FNAME + 'updateAmount');
        module.exports.getOne(id, (err, account) => {
            if (err) return callback(err);

            let new_amount = account.amount + amount;
            accountsDb.updateAmount(id, new_amount, callback);
        })
    }
};
