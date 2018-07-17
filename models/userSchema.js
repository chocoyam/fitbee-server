const Sequelize = require('sequelize');
const sequelize = new Sequelize('fitbee', 'fitbee', 'fitbee',  
    {
        'host': 'localhost',
        'dialect': 'mysql'
    });

const Users = sequelize.define('Users', {
   userId : { type : Sequelize.INTEGER, primaryKey:true, autoIncrement:true },
   userName : { type : Sequelize.STRING(50), allowNull : false },
}, {timestamps:false});




module.exports.Users = Users;