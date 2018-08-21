const Sequelize = require('sequelize');
const sequelize = new Sequelize('fitbee', 'fitbee', 'fitbee',  
    {
        'host': '',
        'dialect': 'mysql'
    });

const Users = sequelize.define('Users', {
   userId : { type : Sequelize.INTEGER(11), primaryKey:true, autoIncrement:true },
   userName : { type : Sequelize.STRING(50), allowNull : false },
   gender : { type : Sequelize.INTEGER(1), allowNull : false },
   ph_number : { type : Sequelize.INTEGER(20), allowNull : false },
   weak_part : { type : Sequelize.STRING(45), allowNull : false },
   concent_part : {  type : Sequelize.STRING(45), allowNull : false },
   goal_weight : {  type : Sequelize.FLOAT, allowNull : false },
   goal_fat : { type : Sequelize.FLOAT, allowNull : false },
   goal_muscle : { type : Sequelize.FLOAT, allowNull : false }
}, {timestamps:false});


const Inbody_data = sequelize.define('Inbody_data', {
    userId : { type : Sequelize.INTEGER(11), primaryKey:true, references: {model: Users, key: 'userId'}},
    weight : {  type : Sequelize.FLOAT, allowNull : false },
    muscle : { type : Sequelize.FLOAT, allowNull : false },
    fat : { type : Sequelize.FLOAT, allowNull : false },
    bmi : { type : Sequelize.FLOAT, allowNull : false },
    fat_percent : { type : Sequelize.FLOAT, allowNull : false }
 }, {timestamps:false});

 const Change_inbody = sequelize.define('Change_inbody', {
    userId : { type : Sequelize.INTEGER(11), primaryKey:true, references: {model: Users, key: 'userId'}},
    weight : {  type : Sequelize.FLOAT, allowNull : false },
    muscle : { type : Sequelize.FLOAT, allowNull : false },
    fat : { type : Sequelize.FLOAT, allowNull : false },
    date : { type : Sequelize.DATE, allowNull : false }
 }, {timestamps:false});


 
module.exports.Users = Users;
module.exports.Inbody_data = Inbody_data;
module.exports.Change_inbody = Change_inbody;