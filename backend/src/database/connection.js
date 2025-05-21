const knex = require('knex');
const knexfile = require('../../knexfile');

// Usar a configuração de desenvolvimento do knexfile
const connection = knex(knexfile.development);
 
module.exports = connection; 