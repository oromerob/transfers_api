var Router = require('restify-router').Router;

var accounts = require('./accounts');

const router = new Router();

// // list accounts
// router.get("", function (req, res, next) {
//     res.send({status: 'success', path: '/accounts'});
//     return next();
// });

// return account balance
router.get("/:id", function (req, res, next) {
    accounts.getOne(req.params.id, (err, account) => {
        if (err) {
            res.send({status: 'error', err: err});
            return next();
        }
        res.send({status: 'success', account: account});
        return next();
    });
});

module.exports = router;
