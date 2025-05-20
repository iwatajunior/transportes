module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'senac2025',
      database: 'transportes_db',
      port: 5432
    },
    migrations: {
      directory: './src/database/migrations'
    }
  }
}; 