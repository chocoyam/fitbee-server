var pythonShell = require('python-shell');
var async = require('async');

const Users = require('../models/userSchema.js').Users;
const Inbody_data = require('../models/userSchema.js').Inbody_data;
const Change_inbody = require('../models/userSchema.js').Change_inbody;

exports.getUserId = function(req, res){
    console.log('>>>>>user.js/getUserId');
    //execute python module
    pythonShell.run('./pyFiles/classification.py', function (err, results) {
        if (err) throw err;
        //db work & send res
        console.log('login : ' + results[0]);
        Users.findAll({
            where: { userId : results[0] }
        })
        .then(data => {
            res.send(data[0]);
        }, error => {
            console.log(error);
            res.status(500).json({msg : 'db fail'});
        });
    });
};


exports.getInbody = function(req, res){
    console.log('>>>>>user.js/getInbody, params.id : ' + req.params.id);

    Inbody_data.findAll({
        where : { userId : req.params.id }
    })
    .then(data => {
        res.send(data[0]);
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};

exports.getChange = async function(req, res){
    console.log('>>>>>user.js/getChange, params.id : ' + req.params.id);
    
    Change_inbody.findAll({
        where : { userId : req.params.id }
    })
    .then(data => {
        res.send(data[0]);
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
    
}

exports.getBodyPic = async function(req, res){
    console.log('>>>>>user.js/getBodyPic');
    
}
