var restify = require('restify')
  , fs = require('fs');

var controllers = {},
    controllers_path = process.cwd() + '/app/controllers';
fs.readdirSync(controllers_path).forEach(function (file) {
    if (file.indexOf('.js') != -1)
        controllers[file.split('.')[0]] = require(controllers_path + '/' + file);
});

var server = restify.createServer();

server
    .use(restify.bodyParser())
    .use(restify.fullResponse());

// Root (testes)
server.get('/', function(req, res, next) {
    res.send('O server funciona!');
})

// User 
//server.get('/users', controllers.user.getUsers);
server.post('/users', controllers.authMiddleware, controllers.user.createUser);
server.put('/users/:username', controllers.authMiddleware, controllers.user.updateUser);
server.del('/users/:username', controllers.authMiddleware, controllers.user.deleteUser);
//server.get("/users/:username", controllers.user.getUser);

//Login
server.post('/login', controllers.login);


var port = process.env.port || 8080;
server.listen(port, function (err) {
    if (err) console.error(err);
    else console.log('App pronto na porta ' + port);
});

if (process.env.environment == 'production') {
    proccess.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    });
}
