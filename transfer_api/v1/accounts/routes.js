var Router = require('restify-router').Router;

var accounts = require('./accounts');

const router = new Router();

// // list accounts
// router.get("", (req, res, next) => {
//     res.send({status: 'success', path: '/accounts'});
//     return next();
// });

// return account balance


/**
 * @swagger
 * /v1/accounts/{userId}:
 *   get:
 *     description: Returns a user account
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: user phone number
 *         schema:
 *           type: string
 *           format: utf-8
 *           minLength: 9
 *     responses:
 *       200:
 *         description: a user account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   format: utf-8
 *                   example: success
 *                 account:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       format: utf-8
 *                       example: 123123123
 *                     amount:
 *                       type: number
 *                       format: float
 *                       example: 200.00
 */
router.get("/:id", (req, res, next) => {
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
