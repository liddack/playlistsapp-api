var mongo = require('mongodb');
var utils = require('../utils/utils');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('playlistsapp', server);

db.open(function(err, db) {
	if (!err) {
		//console.log("Conectado ao banco de dados 'playlistsapp'");
		db.collection('playlists', {strict: true}, function(err, collection) {
			if (err) {
				console.log("A coleção 'playlists' não existe. Criando...");
				populateDB();
			}
		});
	}
});

exports.buscarTodos = function (req, res) {
	var username = req.params.username;
	console.log('Buscando todas as playlists de "'+ username +'"...');
	db.collection('playlists', function(err, collection) {
		collection.find({'username': username}).toArray(function(err, items) {
			res.send({'playlists': items});
		});
	});
}

exports.buscarPorId = function(req, res) {
	var username = req.params.username;
	var id = req.params.id;
	console.log('Buscando playlist ' + id + ' de ' + username);
	db.collection('playlists', function(err, collection) {
		if (err) {
			console.log(err);
			res.send(404, {error: 'A playlist solicitada não foi encontrada'});
		} else {
			collection.findOne({'_id': id}, function(err, item) {
				if (err) {
					console.log(err);
					res.send(400, {error: 'Erro ao encontrar playlist'});
				} else {
					if (item == null) {
						res.send(404, {error: 'A playlist solicitada não foi encontrada'});
					} else {
						res.send({'playlist': item});
					}
				}
			});
		}
    });
};

exports.inserir = function(req, res) {
	var playlist = req.body;
	var username = req.params.username;
	var unavailableId = false;
	playlist.username = username;
	
	db.collection('playlists', function(err, collection) {
		collection.findOne({'timestamp': playlist.timestamp}, function(err, item) {
			if (err) {
				console.log('Erro ao buscar usuário: '+ err);
			} else {
				if (item != null) {
					console.log('A playlist '+playlist.name+' já existe');
					res.send(409, {error: 'A playlist '+playlist.name+' já existe'});
				} else {
					playlist._id = utils.generateId(6);
					console.log('ID gerada: ' + playlist._id);
					do {
						console.log('fds');
						collection.findOne({'_id': playlist._id}, function(err, item) {
							if (err) {
								console.log('Erro ao buscar usuário: '+ err);
							} else {
								if (item != null) {
									console.log('A ID '+playlist._id+' não está disponível.');
									unavailableId = true;
									playlist._id = utils.generateId(6);
								} else {
									console.log('A ID '+playlist._id+' foi atribuída à nova playlist.');
									console.log('Inserindo playlist "' + playlist.name + '" do usuário "' + username + '"');
									collection.insert(playlist, {safe:true}, function(err, result) {
										if (err) {
											console.log('Erro ao inserir playlist');
											res.send(400, {error: 'Erro ao inserir playlist'});
										} else {
											console.log('Playlist ' + playlist.name + ' inserida com sucesso');
											res.send(201, 
												{
													'success': 'A playlist ' + playlist.name + ' foi inserida',
													'playlist': playlist
												}
											);
										}
									});
								}
							}
						});
					} while (unavailableId);
				}
			}
		});
	});
};

exports.modificar = function(req, res) {
	var id = req.params.id;
	var playlist = req.body;
	console.log('Modificando playlist '+ playlist.name + ' ('+id+')');
	db.collection('playlists', function(err, collection) {
		collection.update({'_id': id}, playlist, {safe:true}, function(err, result) {
			if (err) {
				console.log('Erro ao modificar playlist: ' + err);
				res.send(400, {error: 'Erro ao modificar playlist'});
			} else {
				console.log('' + result + ' atualizado');
				var jsonRes = {
					'success': 'A playlist '+ playlist.name +' ('+id+') foi modificada',
					'playlist': playlist
				};
				res.send(jsonRes);
			}
		});
	})
};

exports.excluir = function(req, res) {
	var id = req.params.id;
	console.log('Excluindo playlist ' + id);
	db.collection('playlists', function(err, collection) {
		if (err) {
			console.log('Erro: id não encontrado\n' + err);
			res.send(404, {error: 'A playlist solicitada não foi encontrada'});
		} else {
			collection.remove({'_id': id}, {safe:true}, function(err, result) {
				if (err) {
					console.log('Erro ao excluir playlist');
					res.send(400, {error: 'Erro ao excluir playlist'});
				} else {
					if (result.result.n == 0) {
						console.log('Playlist '+id+' não encontrado');
						res.send(404, {error: 'A playlist '+id+' não foi encontrada'});
					} else {
						console.log(result);
						res.send({success: 'A playlist ' + id + ' foi excluída'});
					}
				}
			});
		}
	});
};

// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
    var playlists = [
    {
    	"_id": "Kp05yJ",
    	"username": "testuser",
    	"name": "Playlist 1",
    	"timestamp": 1491511543000,
    	"tracks": [
    		{
    			"_id": "4zkzkEQGjfzmq0tVzpsMdM",
    			"name": "Under The Bridge",
    			"artist": "Red Hot Chili Peppers",
    			"album": "Blood Sugar Sex Magik (Deluxe Version)",
    			"duration": 265506,
    			"album_image": "https://i.scdn.co/image/7c78a85f2f039cc4b9f2ad4c1d3c0b1bde83eac1",
    			"preview": "https://p.scdn.co/mp3-preview/8b7e0b33a15c9b7498595b1657e2d04c1b6524f5?cid=null"
    		},
    		{
    			"_id": "2DQ11fiHhS2436z7Odek4o",
    			"name": "Behind Blue Eyes",
    			"artist": "Limp Bizkit",
    			"album": "Results May Vary",
    			"duration": 269973,
    			"album_image": "https://i.scdn.co/image/e1548fb82c8acf4264d5097ea8447a67da738460",
    			"preview": "https://p.scdn.co/mp3-preview/4888ed5a5bd03be76fdd2370c8e43b6233ec20d4?cid=null"
    		}
    	]
    }];
    db.collection('playlists', function(err, collection) {
        collection.insert(playlists, {safe:true}, function(err, result) {});
    });
};
