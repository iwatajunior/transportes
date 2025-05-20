exports.up = function(knex) {
  return knex.schema.alterTable('materials', function(table) {
    table.integer('user_id').references('userid').inTable('usuarios').nullable();
  })
  .then(() => {
    return knex('materials').update({ user_id: 4 });
  })
  .then(() => {
    return knex.schema.alterTable('materials', function(table) {
      table.integer('user_id').notNullable().alter();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('materials', function(table) {
    table.dropColumn('user_id');
  });
}; 