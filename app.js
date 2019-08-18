const Router = require('restify-router').Router;
const restify = require('restify');
const restifySwaggerJsdoc = require('restify-swagger-jsdoc');


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

restifySwaggerJsdoc.createSwaggerPage({
    title: 'API documentation', // Page title
    version: '1.0.0', // Server version
    server: server, // Restify server instance created with restify.createServer()
    apis: ['./transfer_api/v1/accounts/routes.js', './transfer_api/v1/transfers/routes.js'],
    path: '/docs/swagger' // Public url where the swagger page will be available
});

server.listen(8080);