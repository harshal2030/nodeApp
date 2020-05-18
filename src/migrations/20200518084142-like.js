/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addConstraint('likes', ['postId'], {
      type: 'foreign key',
      name: 'likes_postId_fkey',
      references: {
        table: 'posts',
        field: 'postId',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeConstraint('likes', 'likes_postId_fkey');
  },
};
