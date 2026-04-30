const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'users-db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432
});

class UserRepository {
    async findByEmail(email) {
    const result = await pool.query(
        'SELECT id, name, email, password_hash, is_admin FROM users WHERE email = $1',
        [email]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
    }
}

module.exports = UserRepository;