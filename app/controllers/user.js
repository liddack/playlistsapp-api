var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    User = mongoose.model("User"),
    ObjectId = mongoose.Types.ObjectId;

exports.createUser = function (req, res, next) {
    // Verificando se existe username e password na requisição
    if (!req.body.username || !req.body.password) {
        res.status(400);
        res.json({
            error: {
                status: 400,
                message: "Solicitação inválida."
            }
        });
    } else {
        // Verificando se o username já existe
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) return next(err);
            if (user) {
                res.status(409);
                res.json({
                    error: {
                        status: 409,
                        message: "O usuário " + req.body.username + " já existe."
                    }
                });
            } else {
                var UserModel = new User(req.body);
                UserModel.save(function (err) {
                    if (err) {
                        res.status(500);
                        res.json({
                            error: {
                                status: 500,
                                message: "Ocorreu um erro: " + err
                            }
                        });
                    }
                    res.status(201);
                    res.json({
                        status: 201,
                        message: "O usuário foi criado com sucesso.",
                        user: {
                            username: req.body.username,
                            password: req.body.password
                        }
                    });
                });
            }
        });
    }
}

exports.updateUser = function (req, res, next) {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(400);
        return res.json({
            error: {
                status: 400,
                message: "Solicitação inválida."
            }
        });
    }
    var updUserModel = new User(req.body);
    console.info('senha nova: ' + req.body.password);
    User.findOne({ username: req.body.username }, function (err, foundUser) {
        if (err || !foundUser) {
            console.error(err);
            res.status(404);
            return res.json({
                error: {
                    status: 404,
                    message: "Usuário " + req.body.username + " não encontrado"
                }
            });
        }
        console.info('senha antiga: ' + foundUser.password);
        console.info('id de ' + foundUser.username + ': ' + foundUser.id);
        // Eu pego o usuário já registrado no BD e mudo a senha para a nova
        foundUser.password = req.body.password;

        foundUser.save(function (err, updatedUser) {
            if (err) {
                console.error(err);
                res.status(500);
                return res.json({
                    error: {
                        status: 500,
                        message: "Erro interno no servidor."
                    }
                });
            } else if (updatedUser) {
                res.json({
                    status: 200,
                    message: "Usuário modificado com sucesso",
                    user: {
                        username: req.body.username,
                        password: req.body.password
                    }
                });
            }
        });
    });
}

exports.deleteUser = function (req, res) {
    var username = req.params.username;
    if (!username) {
        res.status(400);
        res.json({
            error: {
                status: 400,
                message: "Solicitação inválida."
            }
        });
    } else {
        User.findOneAndRemove({ username: username }, function (err, User) {
            if (err) {
                res.status(500);
                res.json({
                    error: {
                        status: 500,
                        message: "Erro interno no servidor."
                    }
                });
                console.error(err);
            } else {
                if (User) {
                    res.json({
                        status: 200,
                        message: "Usuário " + username + " deletado com sucesso",
                    });
                } else {
                    res.status(404);
                    res.json({
                        error: {
                            status: 404,
                            message: "Usuário " + username + " não foi encontrado"
                        }
                    })
                }
            }
        });
    }
}
