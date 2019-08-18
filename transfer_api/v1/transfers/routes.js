const Router = require('restify-router').Router;

const common = require('../common');
const transfers = require('./transfers');

const router = new Router();

// // list transfers
// router.get("", (req, res, next) => {
//     res.send({status: 'success', path: '/transfers'});
//     return next();
// });
//
// // return a transfer
// router.get("/:id", (req, res, next) => {
//     res.send({status: 'success', path: '/transfers/' + req.params.id});
//     return next();
// });

// create a transfer

/**
 * @swagger
 * definitions:
 *   Transfer:
 *     required:
 *       - from
 *       - to
 *       - amount
 *     properties:
 *       from:
 *         type: string
 *         description: phone number (userId)
 *       to:
 *         type: string
 *         description: phone number (userId)
 *       amount:
 *         type: number
 *         format: float
 *         description: an amount to be transferred
 */


/**
 * @swagger
 * /v1/transfers:
 *   post:
 *     summary: Creates a money transfer in between 2 users.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: transfer
 *         description: A JSON object containing transfer data
 *         schema:
 *           $ref: '#/definitions/Transfer'
 *     responses:
 *       200:
 *         description: a transfer object with its logs and final status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   format: utf-8
 *                   example: 5d59387af645655f5633838f
 *                 amount:
 *                   type: number
 *                   format: float
 *                   example: 200.00
 *                 dateCreated:
 *                   type: string
 *                   example: 2019-08-18T11:37:30Z
 *                 err:
 *                   type: string
 *                   example: ''
 *                   description: Filled with the error for errored transfers
 *                 from:
 *                   type: string
 *                   description: user phone (userId)
 *                   minLength: 9
 *                 to:
 *                   type: string
 *                   description: user phone (userId)
 *                   minLength: 9
 *                 initial:
 *                   type: array
 *                   items:
 *                     type: object
 *                 log:
 *                   type: array
 *                   items:
 *                     type: string
 *                 msg:
 *                   type: string
 *                   description: Filled with the reason for unsuccessful transfers
 *                 status:
 *                   type: string
 *                   enum: [successful, unsuccessful, errored]
 */
router.post("", (req, res, next) => {
    common.log(req.body);
    const form = req.body;
    const _amount = parseFloat(form.amount);

    let error_msg;
    if (!form) {
        error_msg = 'No transaction object in the request';
    }
    else if (!form.hasOwnProperty('from') ||
        !form.hasOwnProperty('to') ||
        !form.hasOwnProperty('amount')) {
        error_msg = 'Incorrect transaction object. Example of transaction object {"from": "", "to": "", "amount": 0}';
    }
    else if (isNaN(_amount)) {
        error_msg = 'Invalid value for transaction "amount": ' + form.amount;
    }
    else if (_amount <= 0) {
        error_msg = 'Transaction "amount" should be bigger than 0, you provided: ' + form.amount;
    }

    if (error_msg) {
        res.send({status: 'error', msg: error_msg});
        return next();
    }
    else {
        form.amount = parseFloat(form.amount);
        common.log(form);
        transfers.new(form, (err, transfer) => {
            if (err) {
                res.send(err);
                return next();
            }
            res.send(transfer);
            return next();
        })
    }
});

module.exports = router;