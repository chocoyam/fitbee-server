var pythonShell = require('python-shell');

const Users = require('../models/userSchema.js').Users;

exports.getUserId = function(req, res){
    console.log('>>>>>user.js/getUserId');
    pythonShell.run('./pyFiles/classification.py', function (err, results) {
        if (err) throw err;
        userId = parseInt(results[0])

        console.log('login : ' + userId);
        Users.findAll({
            where: { userId : userId }
        })
        .then((data) => {
            res.send(data[0]);
        }, error => {
            console.log(error)
            res.send({ msg : 'fail' });
        });
    });
};
