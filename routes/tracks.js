var mongo = require('mongodb');
var playlists = require('./playlists');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('playlistsapp', server);

db.open(function(err, db) {
	/*if (!err) {
		//console.log("Conectado ao banco de dados 'playlistsapp'");
		/*db.collection('playlists', {strict: true}, function(err, collection) {
			if (err) {
				console.log("A coleção 'playlists' não existe. Criando...");
				populateDB();
			}
		});
	}*/
});

var findTrackById = function(track) {
	return track._id == this;
}

exports.buscarTodos = function (req, res) {
	var id = req.params.id;
	console.log('Buscando todas as faixas da playlist ('+ id +')...');
	db.collection('playlists', function(err, collection) {
		collection.findOne({'_id': id}, function(err, item) {
			if (err) {
				console.log(err);
				res.send(404, {error: 'A playlist solicitada não foi encontrada'});
			} else {
				jsonRes = {tracks: item.tracks}
				res.send(jsonRes);
			}
		});
	});
}

exports.buscarPorId = function(req, res) {
	var id = req.params.id;
	var trackId = req.params.trackid;
	var track = undefined;
	console.log('Buscando faixa '+trackId+' da playlist ' + id);
	db.collection('playlists', function(err, collection) {
		if (err) {
			console.log(err);
			res.send(404, {error: 'A faixa solicitada não foi encontrada'});
		} else {
			collection.findOne({'_id': id}, function(err, playlist) {
				if (err) {
					console.log(err);
					res.send(400, {error: 'Erro ao encontrar playlist'});
				} else {
					if (playlist == null) {
						res.send(404, {error: 'A playlist solicitada não foi encontrada'});
					} else {
						track = playlist.tracks.find(findTrackById, trackId);
						if (track == undefined) {
							console.log('A faixa não foi encontrada na playlist');
							res.send(404, {error: 'A faixa solicitada não foi encontrada na playlist'});
						} else {
							res.send({'track': track});
						}
					}
				}
			});
		}
    });
};

exports.inserir = function(req, res) {
	var playlistId = req.params.id;
	var newTrack = req.body;
	var trackId = newTrack._id;

	console.log('Inserindo faixa ' + trackId + ' na playlist '+playlistId);
	db.collection('playlists', function(err, collection) {
		collection.findOne({'_id': playlistId}, function(err, playlist) {
			if (err) {
				console.log(err);
				res.send(400, {error: 'Erro ao encontrar playlist'});
			} else {
				if (playlist == null) {
					res.send(404, {error: 'A playlist solicitada não foi encontrada'});
				} else {
					track = playlist.tracks.find(findTrackById, trackId);
					console.log(track);
					if (track != undefined) {
						console.log('A faixa já existe na playlist');
						res.send(404, {error: 'A faixa já existe na playlist'});
					} else {
						playlist.tracks.push(newTrack);
						collection.update({'_id': playlistId}, playlist, {safe:true}, function(err, result) {
							if (err) {
								console.log('Erro ao inserir faixa: ' + err);
								res.send(400, {error: 'Erro ao inserir faixa'});
							} else {
								console.log('Faixa inserida!');
								res.send(201, {
									'success': 'A faixa '+ newTrack.name +' ('+trackId+') foi inserida',
									'tracks': playlist.tracks
								});
							}
						});
					}
				}
			}
		});
	});
};



exports.excluir = function(req, res) {
	var playlistId = req.params.id;
	var trackId = req.params.trackid;

	console.log('Excluindo faixa ' + trackId + ' da playlist '+playlistId);
	db.collection('playlists', function(err, collection) {
		collection.findOne({'_id': playlistId}, function(err, playlist) {
			if (err) {
				console.log(err);
				res.send(400, {error: 'Erro ao encontrar playlist'});
			} else {
				if (playlist == null) {
					res.send(404, {error: 'A playlist solicitada não foi encontrada'});
				} else {
					track = playlist.tracks.find(findTrackById, trackId);
					if (track == undefined) {
						console.log('A faixa não foi encontrada na playlist');
						res.send(404, {error: 'A faixa solicitada não foi encontrada na playlist'});
					} else {
						playlist.tracks.pop(track);
						collection.update({'_id': playlistId}, playlist, {safe:true}, function(err, result) {
							if (err) {
								console.log('Erro ao excluir faixa: ' + err);
								res.send(400, {error: 'Erro ao excluir faixa'});
							} else {
								console.log('Faixa excluída!');
								res.send({
									'success': 'A faixa '+ track.name +' ('+trackId+') foi excluída',
									'tracks': playlist.tracks
								});
							}
						});
					}
				}
			}
		});
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
