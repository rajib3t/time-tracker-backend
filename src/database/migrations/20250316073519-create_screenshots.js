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
    await queryInterface.createTable('screenshots', 
      { 
        id: {
          type:Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true
        },
        timestamp:{
          type:Sequelize.STRING,
          allowNull:true
        },
        user_id:{
          type:Sequelize.BIGINT
        },
        screenshot:{
          type:Sequelize.TEXT
        },
        created_at: {
          type:Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW
        },
        updated_at:{
          type:Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW
        }

      });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('screenshots');
  }
};
