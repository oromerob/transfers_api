var Router = require('restify-router').Router;

var transfers = require('./transfers');

const router = new Router();

// // list transfers
// router.get("", function (req, res, next) {
//     res.send({status: 'success', path: '/transfers'});
//     return next();
// });
//
// // return a transfer
// router.get("/:id", function (req, res, next) {
//     res.send({status: 'success', path: '/transfers/' + req.params.id});
//     return next();
// });

// create a transfer
router.put("", function (req, res, next) {
    transfers.new(req.body.form, (err) => {
        if (err) {
            res.send({status: 'error', err: err});
            return next();
        }
        res.send({status: 'success'});
        return next();
    })
});

module.exports = router;