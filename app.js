var Router = require('restify-router').Router;
var restify = require('restify');

const router = new Router();
router.add("/v1", require("./transfer_api/v1/routes"));

let server = restify.createServer();

server.use(restify.plugins.queryParser({
    mapParams: true
}));
server.use(restify.plugins.bodyParser({
    mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

router.applyRoutes(server);

server.listen(8080);