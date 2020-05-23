/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addConstraint('bookmarks', ['postId'], {
      type: 'foreign key',
      name: 'bookmarks_postId_fkey',
      references: {
        table: 'posts',
        field: 'postId',
      },
      onDelete: 'cascade',
      onUpdate: 'NO ACTION',
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeConstraint('bookmarks', 'bookmarks_postId_fkey');
  },
};
