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
    await queryInterface.createTable('daily_time_records',
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
        date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        total_seconds:{
          type:Sequelize.BIGINT,
          default:0
        },
        first_start_time:{
            type: Sequelize.TIME,
            allowNull: false
        },
      


        last_end_time:{
          type: Sequelize.TIME,
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


    );
    await queryInterface.addConstraint('daily_time_records', {
      fields: ['user_id', 'date'],
      type: 'unique',
      name: 'daily_time_records_user_id_date_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('daily_time_records')
  }
};
