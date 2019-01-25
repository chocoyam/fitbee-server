const Exercise = require('../models/ExerciseSchema.js').Exercise;
const Result = require('../models/ExerciseSchema.js').Result;
const Users = require('../models/userSchema.js').Users;

const kNN = require('./fitbeeKnn.js');
const knnList = [];
const knnLabel = [];
const numRelatedPart = 6;
const numExPerRout = 5;

// make train data
Exercise.findAll().then(data => {
    for(var i in data){
        var relatedPart = data[i]['relatedPart'].toString();
        var knnDict = {'avoid' : data[i]['avoidPart']};
        for (var num = 1; num <= numRelatedPart; num++){
            for(var numRelated = 0; numRelated < relatedPart.length; numRelated++){
                if(num == relatedPart.charAt(numRelated)){
                    knnDict[num] = data[i]['grade'];
                    break;
                }
                else{ knnDict[num] = 0; }
            }
        }
        knnList.push(knnDict);
        knnLabel.push(data[i]['exerName']);
    }
    //console.log('knn : ', knnList);
});



exports.getRoutine = function(req, res){
    console.log('>>>>>exercise.js/getRoutine');
    Users.findAll({ where : { userId : req.params.id } })
    .then(userData => {
        userData = userData[0];
        var concentPart = userData['concent_part'].toString();
        var weakPart = userData['weak_part'].toString();
        var concentset = {};
        // user's concentset dictionary
        for (var num = 1; num <= numRelatedPart; num++){
            for(var numConcent = 0; numConcent < concentPart.length; numConcent++){
                if(num == concentPart.charAt(numConcent)){
                    concentset[num] = userData['grade'];
                    break;
                }
                else{ concentset[num] = 0; }
            }
        }

        // remove weakPart exercise
        var refinedList = [];
        var refinedLabel = [];
        var isInsert = 1;
        for(var item in knnList){
            for(var numWeak = 0; numWeak < weakPart.length; numWeak++){
                if(weakPart.charAt(numWeak) == 5){ break; } // 5는 none
                if(knnList[item]['avoid'] == weakPart.charAt(numWeak)){ isInsert = 0; }
                else{ isInsert = 1; }
            }
            if(isInsert == 1){
                refinedList.push(knnList[item]);
                refinedLabel.push(knnLabel[item]); 
            }
        }

        // recommendation algorithm
        let knn = new kNN();
        knn.train(refinedList, refinedLabel);
        result = knn.test(concentset, numExPerRout);

        Exercise.findAll({
            where : { exerName : result[0] }
        })
        .then(exData => {
            //concent part code change to string
            for(var data in exData){
                var concentList = [];
                var concent_parts = exData[data]['relatedPart'].toString();
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
                exData[data]['relatedPart'] = concentList;
            }
            res.send({data : exData});

        });
    }, error => {
        console.log(error);
        res.status(500).json({msg : 'db fail'});
    });
};



exports.getSetCnt = function(req, res){
    console.log('>>>>>exercise.js/getSetCnt');
    Result.findAll({
        where : {
            userId : req.params.id,
            exerId : req.params.exerId
        }
    })
    .then(resData => {
        var nowCnt = resData[0]['nowCnt'];
        res.send([nowCnt]);
    })
};



exports.getDemoRoutine = function(req, res){
    Exercise.findAll({
        where : { exerId : [14, 15] }
    })
    .then(exData => {
        //concent part code change to string
        for(var data in exData){
            var concentList = [];
            var concent_parts = exData[data]['relatedPart'].toString();
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
            exData[data]['relatedPart'] = concentList;
        }
        res.send({data : exData});
    })
};



exports.getDemoCnt = function(req, res){
    console.log('>>>>>exercise.js/getDemoCnt');
    res.send([1]);
}