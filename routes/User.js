require('date-utils');
var now = new Date().toFormat('YYYY-MM-DD');
var pythonShell = require('python-shell');
var imgUpload = require('./s3/imgUpload');
var fs = require('fs');
var shell = require('shelljs');

const Users = require('../models/userSchema.js').Users;
const Inbody_data = require('../models/userSchema.js').Inbody_data;
const Change_inbody = require('../models/userSchema.js').Change_inbody;
const Body_pic = require('../models/userSchema.js').Body_pic;
const Result = require('../models/ExerciseSchema.js').Result;
const Exercise = require('../models/ExerciseSchema.js').Exercise;


exports.getUserInfo = function(req, res){
    console.log('>>>>>User.js/getUserId');
    console.log(req);
    //execute python module
    pythonShell.run('./classification.py', function (err, results){
        if (err) throw err;
        //db work & send res
        console.log('login : ' + results[0]);

        var sendData = {};
        Users.findAll({
            where: { userId : results[0] }
        })
        .then(data => {
            data = data[0];
            //weak part code change to string
            var weak_parts = data['weak_part'].toString();
            var weakList = [];  
            for(var numWeak = 0; numWeak < weak_parts.length; numWeak++){
                var weak_part = weak_parts.charAt(numWeak);
                //0.knee 1.ankle 2.wrist 3.waist 4.neck
                switch(weak_part) {
                    case '0':
                        weakList.push('knee');
                        break;
                    case '1':
                        weakList.push('ankle');
                        break;
                    case '2':
                        weakList.push('wrist');
                        break;
                    case '3':
                        weakList.push('waist');
                        break;
                    case '4':
                        weakList.push('neck');
                        break;
                    default:
                        weakList.push('none');
                }   
            }
            //concent part code change to string
            var concent_parts = data['concent_part'].toString();
            var concentList = [];  
            for(var numConcent = 0; numConcent < concent_parts.length; numConcent++){
                var concent_part = concent_parts.charAt(numConcent);
                //1.arm 2.thigh 3.abs 4.butt 5.side 6.chest
                switch(concent_part) {
                    case '1':
                        concentList.push('arm');
                        break;
                    case '2':
                        concentList.push('thigh');
                        break;
                    case '3':
                        concentList.push('abs');
                        break;
                    case '4':
                        concentList.push('butt');
                        break;
                    case '5':
                        concentList.push('side');
                        break;
                    case '6':
                        concentList.push('chest');
                        break;
                    default:
                        concentList.push('none');
                }   
            }
            sendData['userId'] = data['userId'];
            sendData['userName'] = data['userName'];
            sendData['weak_part'] = weakList;
            sendData['concent_part'] = concentList;
            sendData['goal_weight'] = data['goal_weight'];
            sendData['goal_fat'] = data['goal_fat'];
            sendData['goal_muscle'] = data['goal_muscle'];
            sendData['init_weight'] = data['init_weight'];
            sendData['init_fat'] = data['init_fat'];
            sendData['init_muscle'] = data['init_muscle'];

            Inbody_data.findAll({
                where : { userId : results[0] }
            })
            .then(inbodyData => {
                sendData['now_weight'] = inbodyData[0]['weight'],
                sendData['now_fat'] = inbodyData[0]['fat'],
                sendData['now_muscle'] = inbodyData[0]['muscle']
                res.send(sendData);
            });
        }, error => {
            console.log(error);
            res.status(500).json({msg : 'db fail'});
        });
    });
};


exports.getInbody = function(req, res){
    console.log('>>>>>User.js/getInbody, params.id : ' + req.params.id);
    var sendData = {};
    //inbody data
    Inbody_data.findAll({
        where : { userId : req.params.id }
    })
    .then(inbodyData => {
        inbodyData = inbodyData[0];
        //change data
        Change_inbody.findAll({
            where : { userId : req.params.id },
            order: [['date', 'DESC']]
        })
        .then(changeData => {
            var inbodyDict = {
                'weight' : inbodyData['weight'],
                'muscle' : inbodyData['muscle'],
                'fat' : inbodyData['fat'],
                'bmi' : inbodyData['bmi'],
                'fat_percent' : inbodyData['fat_percent'],
                'inbody_date' : inbodyData['date']
            };
            
            var changeList = [];
            for(var i in changeData){
                changeList.push({
                    'ch_weight' : changeData[i]['weight'],
                    'ch_muscle' : changeData[i]['muscle'],
                    'ch_fat' : changeData[i]['fat'],
                    'ch_date' : changeData[i]['date']
                });
            }
            sendData['inbody_data'] = inbodyDict;
            sendData['change_data'] = changeList;
            res.send(sendData);
        });
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


// exports.getChange = function(req, res){
//     console.log('>>>>>User.js/getChange, params.id : ' + req.params.id);
    
//     Change_inbody.findAll({
//         where : { userId : req.params.id },
//         order: [['date', 'DESC']]
//     })
//     .then(data => {
//         res.send(data);
//     }, error => {
//         console.log(error);
//         res.status(500).json({msg : 'db fail'});
//     });
// };


exports.getBodyPic = function(req, res){
    console.log('>>>>>User.js/getBodyPic, params.id : ' + req.params.id);
    
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
    console.log('>>>>>User.js/addBodyPic, params.id : ' + req.params.id);
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
        res.send(url[0]);
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};


exports.addUser = function(req, res){
    console.log('>>>>>User.js/addUser');

    var images = req.files;
    console.log(images);

    Users.create({
        userName : req.body.userName,
        gender : req.body.gender,
        ph_number : req.body.ph_number,
        weak_part : req.body.weak_part,
        concent_part : req.body.concent_part,
        goal_weight : req.body.goal_weight,
        goal_fat : req.body.goal_fat,
        goal_muscle : req.body.goal_muscle
    })
    .then(data => {
        Inbody_data.create({
            userId : data['dataValues']['userId'],
            weight : 0,
            muscle : 0,
            fat : 0,
            bmi : 0,
            fat_percent : 0,
            date : now
        });

        Change_inbody.create({
            userId : data['dataValues']['userId'],
            weight : 0,
            muscle : 0,
            fat : 0,
            date : now
        });

        var numExer = 6;

        Exercise.findAll()
        .then(data => {
            res.send(data);
        }, error => {
            console.log(error);
            res.status(500).json({msg : 'db fail'});
        });


        for(var i=0; i<6; i++){
            Result.create({
                userId : data['dataValues']['userId'],
                exerId : i,

            });
        }

        //create member directory & move face images
        dir = './members/' + req.params.id + '/';
        fs.mkdir(dir, function (err) {
            if(err){ console.error(err) }
            else{
                //rename(move) images file
                for(var i=0 ; i < images.length ; i++) {
                    fs.rename(images[i].path, dir + 'face' + i + '.png', function (err) {
                        if (err) throw err
                    })
                }
            }
        });

        //model train
        shell.exec('sh ./train.sh', function() { });

        res.status(200).json({msg : 'success', userId : data['dataValues']['userId']});
        console.log(data['dataValues']['userId']);
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};


exports.test = function(req, res){
     Users.findAll({
            where : { userId : req.params.id }
        })
        .then(data => {
            data = data[0];

            var weakset = [];
            var concentset = {};
            var numRelated = 6;
            var numAvoid = 5;
            var concentPart = data['concent_part'].toString();
            var weakPart = data['weak_part'].toString();
            var knnDict = {};

            console.log(concentPart);
            console.log(weakPart);

            for (var num = 1; num <= numRelated; num++){
                for(var numConcent = 0; numConcent < concentPart.length; numConcent++){
                    if(num == concentPart.charAt(numConcent)){
                        concentset[num] = data['grade'];
                        break;
                    }
                    else{ concentset[num] = 0; }
                }
            }
            console.log(concentset);

            for(var numWeak = 0; numWeak < weakPart.length; numWeak++){
                weakset.push(weakPart.charAt(numWeak));
            }
            console.log(weakset);
            
            
            // let knn = new kNN();
            // knn.train(knnList, knnLabel, avoidset);
            // result = knn.test([{ '1': 0, '2': 9, '3': 0, '4': 0, '5': 0, '6': 0 }], 5);
            // console.log(result);

        }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
}
