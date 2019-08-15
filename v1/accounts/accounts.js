var accountsDb = require('./accountsDb');

module.exports = {
    getOne: accountsDb.getOne,
    updateAmount: (id, amount, callback) => {
        this.getOne(id, (err, account) => {
            if (err) return callback(err);

            let new_amount = account.amount + amount;
            accountsDb.updateAmount(id, new_amount, callback);
        })
    }
};
