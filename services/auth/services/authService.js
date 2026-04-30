const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const UserRepository = require('../repositories/userRepository');

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'novalink-secret';
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async login(email, password) {
        if (!email || !password) {
            throw {
                status: 400,
                message: 'Email y password requeridos'
            };
        }

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw {
                status: 401,
                message: 'Email o password incorrectos'
            };
        }

        // Comparar contraseña con bcryptjs
        const validPassword = await bcryptjs.compare(password, user.password_hash);

        if (!validPassword) {
            throw {
                status: 401,
                message: 'Email o password incorrectos'
            };
        }

        const payload = {
            user_id: user.id,
            username: user.name,
            email: user.email,
            is_admin: user.is_admin || false,
            issued_by: 'auth-service'
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin || false
            },
            token
        };
    }

    verify(token) {
        return jwt.verify(token, SECRET_KEY);
    }
}

module.exports = AuthService;