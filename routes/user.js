require('date-utils');
var now = new Date().toFormat('YYYY-MM-DD');
var pythonShell = require('python-shell');
var imgUpload = require('./s3/imgUpload');

const Users = require('../models/userSchema.js').Users;
const Inbody_data = require('../models/userSchema.js').Inbody_data;
const Change_inbody = require('../models/userSchema.js').Change_inbody;
const Body_pic = require('../models/userSchema.js').Body_pic;



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


/*
*** updateInbody 모듈 ***
1. (DB에 저장된 변화량 데이터 + 새로운 인바디 데이터 - DB에 저장된 인바디 데이터)
    구해서 Change_inbody에 추가
2. Inbody_data 테이블 업데이트
*/
exports.updateInbody = function(req, res){
    var updateData;
    //get old inbody data from Inbody_data
    Inbody_data.findAll({
        where : { userId : req.params.id }
    })
    .then(data => {
        var old = data[0]['dataValues'];
        //get standard data from Change_inbody
        Change_inbody.findAll({
            where : { userId : req.params.id },
            order: [['date', 'DESC']]
        })
        .then(data => {
            var standard = data[0];
            //add data to Change_inbody
            Change_inbody.create({
                userId : req.params.id,
                weight : standard['weight'] + req.body.weight - old['weight'],
                muscle : standard['muscle'] + req.body.muscle - old['muscle'],
                fat : standard['fat'] + req.body.fat - old['fat'],
                date : now
            })
        })

        //update Inbody_data
        Inbody_data.update({
            weight : req.body.weight,
            muscle : req.body.muscle,
            fat : req.body.muscle,
            bmi : req.body.bmi,
            fat_percent : req.body.fat_percent,
            date : now
        },{
            where : { userId : req.params.id }
        })

        res.status(200).json({msg : 'success'});

    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};


exports.getChange = function(req, res){
    console.log('>>>>>user.js/getChange, params.id : ' + req.params.id);
    
    Change_inbody.findAll({
        where : { userId : req.params.id },
        order: [['date', 'DESC']]
    })
    .then(data => {
        res.send(data);
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};


exports.getBodyPic = function(req, res){
    console.log('>>>>>user.js/getBodyPic, params.id : ' + req.params.id);
    
    Body_pic.findAll({
        attributes : ['pic', 'date'],
        where : { userId : req.params.id },
        order: [['date', 'DESC']]
    })
    .then(data => {
        res.send(data);
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};


exports.addBodyPic = async function(req, res){
    console.log('>>>>>user.js/addBodyPic, params.id : ' + req.params.id);
    var image = req.files;

    var url = await imgUpload.upload(image, 'Body_pic', req.params.id);
    console.log(url);

    //add Body_pic
    Body_pic.create({
        userId : req.params.id,
        pic : url[0],
        date : now,
    })
    .then(data => {
        res.status(200).json({msg : 'success'});
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};

exports.addUser = function(req, res){
    console.log('>>>>>user.js/addUser');
};
