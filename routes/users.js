var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('playlistsapp', server);

db.open(function(err, db) {
	if (!err) {
		console.log("Conectado ao banco de dados 'playlistsapp'");
		db.collection('users', {strict: true}, function(err, collection) {
			if (err) {
				console.log("A coleção 'users' não existe. Criando...");
				populateDB();
			}
		});
	}
});

exports.buscarTodos = function (req, res) {
	console.log('Buscando todos os usuários...');
	db.collection('users', function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send({'users': items});
		});
	});
}

exports.buscarPorId = function(req, res) {
	var username = req.params.username;
	console.log('Buscando usuário: ' + username);
	db.collection('users', function(err, collection) {
		if (err) {
			console.log(err);
			res.send({error: 'Ocorreu um erro'});
		} else {
			collection.findOne({'username':username}, function(err, item) {
				if (err) {
					console.log(err);
					res.send(400, {error: 'Erro ao encontrar usuário'});
				} else {
					if (item == null) {
						res.send(404, {error: 'O usuário solicitado não foi encontrado'});
					} else {
						res.send({'user': item});
					}
				}
			});
		}
    });
};

exports.inserir = function(req, res) {
	var user = req.body;
	var username = user.username;
	console.log('Inserindo usuário: ' + JSON.stringify(user));
	db.collection('users', function(err, collection) {
		collection.findOne({'username': username}, function(err, item) {
			if (err) {
				console.log('Erro ao buscar usuário: '+ err);
				res.send({error: 'Erro ao consultar usuário'});
			} else {
				if (item != null) {
					console.log('O usuário '+username+' já existe.');
					res.send(409, {error: 'O usuário '+username+' já existe'})
				} else {
					collection.insert(user, {safe:true}, function(err, result) {
						if (err) {
							console.log('Erro ao inserir usuário');
							res.send(400, {error: 'Erro ao inserir usuário'});
						} else {
							console.log('Sucesso: ' + JSON.stringify(result[0]));
							res.send(201, {
								'success': 'O usuário ' + username + ' foi inserido',
								'user': user
							});
						}
					});
				}
			}
		});
	});
};

exports.modificar = function(req, res) {
	var username = req.params.username;
	var user = req.body;
	console.log('Modificando usuário: '+ username);
	db.collection('users', function(err, collection) {
		collection.update({'username': username}, user, {safe:true}, function(err, result) {
			if (err) {
				console.log('Erro ao atualizar usuário: ' + err);
				res.send(400, {error: 'Erro ao atualizar usuário'});
			} else {
				console.log('' + result + 'atualizado');
				var jsonRes = {
								'success': 'O usuário '+ username +' foi modificado',
								'user': user
							};
				res.send(jsonRes);
			}
		});
	})
};

exports.excluir = function(req, res) {
	var username = req.params.username;
	console.log('Excluindo usuário: ' + username);
	db.collection('users', function(err, collection) {
		if (err) {
			console.log('Erro ao acessar banco de dados: \n' + err);
			res.send({error: 'Erro ao acessar o banco de dados'});
		} else {
			collection.remove({'username': username}, {safe:true}, function(err, result) {
				if (err) {
					console.log('Erro ao excluir usuário');
					res.send(400, {error: 'Erro ao excluir usuário'});
				} else {
					if (result.result.n == 0) {
						console.log('Usuário '+username+' não encontrado');
						res.send(404, {error: 'O usuário '+username+' não foi encontrado'});
					} else {
						console.log(result);
						res.send({success: 'O usuário ' + username + ' foi excluído'});
					}
				}
			});
		}
	});
};

// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
    var users = [
    {
        username: 'testuser',
        password: 'bababa'
    },
    {
        username: 'liddack',
        password: 'manico'
    }];
    db.collection('users', function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {});
    });
};
