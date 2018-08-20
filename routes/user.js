var pythonShell = require('python-shell');

const Users = require('../models/userSchema.js').Users;

exports.getUserId = function(req, res){
    console.log('>>>user.js/getUserId');
    console.log(req.files);

    // var pyOption = {
    //     mode : 'text',
    //     pythonPath: '',
    //     pythonOptions: ['-u'],
    //     scriptPath: './pyFiles',
    //     args: []
    // }
    pythonShell.run('./pyFiles/classification.py', function (err) {
        if (err) throw err;
        console.log('finished');
    });


    res.send(req.files);
};


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

