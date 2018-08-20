const Sequelize = require('sequelize');
const sequelize = new Sequelize('fitbee', 'fitbee', 'fitbee',  
    {
        'host': '13.124.65.48',
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




module.exports.Users = Users;
