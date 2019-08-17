var Router = require('restify-router').Router;

const router = new Router();

// list users
router.get("", (req, res, next) => {
    res.send({status: 'success', path: '/users'});
    return next();
});

// return a user
router.get("/:id", (req, res, next) => {
    res.send({status: 'success', path: '/users/' + req.params.id});
    return next();
});

// update a user
router.post("/:id", (req, res, next) => {
    // do something with req.body
    res.send({status: 'success', path: '/users/' + req.params.name, form: req.body});
    return next();
});

// create user
router.put("/", (req, res, next) => {
    // do something with req.body
    res.send({status: 'success', path: 'users', form: req.body});
    return next();
});

module.exports = router;