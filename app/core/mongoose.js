var mongoose = require('mongoose')
  , fs = require('fs')
  , models_path = process.cwd() + '/app/models'
  , mongoUris = require('./db.json');

mongoose.connect(
	mongoUris.fullUri, 
	{server: {auto_reconnect: true}}
);
var db = mongoose.connection;

db.on('error', function(err) {
	console.error('Erro de conexão mongodb');
});

db.on('once', function callback() {
	console.info('Conexão mongodb estabelecida');
});

db.on('disconnected', function() {
	console.error('Desconectado do mongodb.');
	mongoose.connect(
		mongoUris.fullUri, 
		{server: {auto_reconnect: true}}
	);
});

db.on('reconnected', function() {
	console.info('Reconectado ao mongodb');
});

fs.readdirSync(models_path).forEach(function(file) {
	if (file.indexOf('.js'))
		require(models_path + '/' + file);
});
