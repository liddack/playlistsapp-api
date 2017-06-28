var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    User = mongoose.model('User'),
    segredo = 'aS56W38Kp5Qb';

module.exports = function (req, res) {
    var username = req.body.username || '';
    var password = req.body.password || '';
    if (username == '' || password == '') {
        return res.send(401);
    }

    User.findOne({ username: username }, function (err, foundUser) {
        if (err) {
            res.status(500);
            return res.json({
                error: {
                    status: 500,
                    message: "Erro interno do servidor"
                }
            });
        } if (!foundUser) {
            res.status(401);
            return res.json({
                error: {
                    status: 401,
                    message: "Não autorizado"
                }
            });
        }
        foundUser.verificaSenha(password, function (isMatch) {
            if (!isMatch) {
                res.status(401);
                return res.json({
                    error: {
                        status: 401,
                        message: "Não autorizado"
                    }
                });
            }
            var expires = moment().add(30, 'minutes').valueOf();
            var token = jwt.encode({
                iss: foundUser.id,
                exp: expires
            }, segredo);

            return res.json({
                token: token,
                expires: expires,
                user: foundUser.toJSON()
            });
        });
    }); 
}
