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
    await queryInterface.createTable('time_counters',
      {
        id:{
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true
        },
        user_id:{
            type: Sequelize.BIGINT,
            allowNull: false
        },
        start_time:{
            type: Sequelize.DATE,
            allowNull: false
        },
       time_counter:{
          type: Sequelize.STRING,
          allowNull: false
        },


        end_time:{
          type: Sequelize.DATE,
          allowNull: true
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
        
      }


    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('time_counters')
  }
};
