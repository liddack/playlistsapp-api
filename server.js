var express = require('express');
	users = require('./routes/users');
	playlists = require('./routes/playlists');
	tracks = require('./routes/tracks');

var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

app.get('/', function(req, res) {
	res.send('<a href="./users">Entrar na API</a>');
});

app.get('/users', users.buscarTodos);
app.post('/users', users.inserir);
app.get('/users/:username', users.buscarPorId);
app.put('/users/:username', users.modificar);
app.delete('/users/:username', users.excluir);

app.get('/users/:username/playlists', playlists.buscarTodos);
app.post('/users/:username/playlists', playlists.inserir);
app.get('/users/:username/playlists/:id', playlists.buscarPorId);
app.put('/users/:username/playlists/:id', playlists.modificar);
app.delete('/users/:username/playlists/:id', playlists.excluir);

app.get('/users/:username/playlists/:id/tracks', tracks.buscarTodos);
app.post('/users/:username/playlists/:id/tracks', tracks.inserir);
app.get('/users/:username/playlists/:id/tracks/:trackid', tracks.buscarPorId);
app.delete('/users/:username/playlists/:id/tracks/:trackid', tracks.excluir);


app.listen(3000);
console.log('Rodando em http://127.0.0.1:3000');