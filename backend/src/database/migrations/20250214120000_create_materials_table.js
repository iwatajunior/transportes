exports.up = function(knex) {
  return knex.schema.createTable('materials', function(table) {
    table.increments('id').primary();
    table.integer('rota_id').notNullable();
    table.integer('cidade_origem_id').notNullable();
    table.integer('cidade_destino_id').notNullable();
    table.string('tipo').notNullable();
    table.decimal('quantidade', 10, 2).notNullable();
    table.text('observacoes');
    table.string('status').notNullable().defaultTo('pendente');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('materials');
}; 