
const Users = require('../models/userSchema.js').Users;

exports.getMain = function(req, res){
    console.log('user.js/getMain');
    console.log(req.params);
    Users.findOne({ where : {userId : parseInt(req.params.userId)}})
    .then( results => {
        res.send({
            userId : results.userId,
            userName : results.userName
        });
    }, error => {
        next(error);
    });
};

exports.getUserId = function(req, res){
    console.log('user.js/getUserId');
    console.log(req.files);
};