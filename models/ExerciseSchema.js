const Sequelize = require('sequelize');
const sequelize = new Sequelize('', '', '',  
    {
        'host': '',
        'dialect': ''
    });
const Users = require('../models/userSchema.js').Users;

const Exercise = sequelize.define('Exercise', {
   exerId : { type : Sequelize.INTEGER(11), primaryKey:true, autoIncrement:true },
   exerName : { type : Sequelize.STRING(30), allowNull : false },
   relatedPart : { type : Sequelize.INTEGER(11) },
   avoidPart : { type : Sequelize.STRING(11) },
   defaultCnt : { type : Sequelize.STRING(11) },
   tutorialUrl : {  type : Sequelize.STRING(80) },
   guideUrl : {  type : Sequelize.STRING(80) },
   photo1Url : { type : Sequelize.STRING(80) },
   photo2Url : { type : Sequelize.STRING(80) },
   grade : { type : Sequelize.INTEGER(5) }
}, {freezeTableName: true, timestamps:false});


const Result = sequelize.define('Result', {
   resId : { type : Sequelize.INTEGER(11), primaryKey:true, autoIncrement:true },
   userId : { type : Sequelize.STRING(30), references : {model: Users, key: 'userId'} },
   exerId : { type : Sequelize.INTEGER(11),  references : {model: Exercise, key: 'exerId'}},
   achieveCnt : { type : Sequelize.STRING(11), defaultValue : 0 },
   totalCnt : { type : Sequelize.STRING(11), defaultValue : 0 },
   nowCnt : {  type : Sequelize.STRING(80), defaultValue : 0 },
   achieveRate : {  type : Sequelize.STRING(80), defaultValue : 0 }
}, {freezeTableName: true, timestamps:false});



module.exports.Exercise = Exercise;
module.exports.Result = Result;
