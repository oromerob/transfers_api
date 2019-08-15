var Router = require('restify-router').Router;

const router = new Router();

// router.add("/users", require("./users/routes"));
router.add("/accounts", require("./accounts/routes"));
router.add("/transfers", require("./transfers/routes"));

module.exports = router;