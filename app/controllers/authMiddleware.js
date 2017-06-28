// Baseado no tutorial em http://rcdevlabs.github.io/2015/02/12/como-criar-uma-api-restfull-em-nodejs-e-autenticar-usando-json-web-token-jwt/

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    jwt = require('jwt-simple'),
    segredo = 'aS56W38Kp5Qb';
module.exports = function (req, res, next) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    //1
    if (token) {
        try {
            var decoded = jwt.decode(token, segredo);
            console.log('decodando ' + decoded.toString());
            //2
            if (decoded.exp <= Date.now()) {
                res.json(400, {
                    error: 'Acesso Expirado, faça login novamente'
                });
            }
            //3
            User.findOne({
                _id: decoded.iss
            }, function (err, user) {
                if (err)
                    res.json(500, {
                        message: "erro ao procurar usuario do token."
                    })
                req.user = user;
                console.log('achei usuario ' + req.user)
                return next();
            });
            //4
        } catch (err) {
            console.error(err);
            return res.json(401, {
                message: 'Erro: Seu token é inválido'
            });
        }
    } else {
        res.json(401, {
            message: 'Token não encontrado ou informado'
        })
    }
};
