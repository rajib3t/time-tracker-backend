'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // Create table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      firstName: {
        type:Sequelize.STRING,
        allowNull: true,
      },
      lastName: {
        type:Sequelize.STRING,
        allowNull: true,
      },
      email: Sequelize.STRING,
      mobile:{
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: Sequelize.STRING,
      is_admin:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });

    // Add unique constraint
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'users_email_unique'
    }, {
      fields: ['mobile'],
      type: 'unique',
      name: 'users_mobile_unique'
    },{
      fields: ['email'],
      type: 'index',
      name: 'users_email_index'
    },{
      fields: ['mobile'],
      type: 'index',
      name: 'users_mobile_index'
    },{
      fields:['firstName','lastName'],
      type:'index',
      name:'users_name_index'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove table
    await queryInterface.dropTable('users');
  }
};
