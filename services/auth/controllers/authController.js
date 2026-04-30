const AuthService = require('../services/authService');

const authService = new AuthService();

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await authService.login(email, password);

        return res.status(200).json({
            success: true,
            data: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                is_admin: result.user.is_admin || false,
                token: result.token
            },
            message: 'Login exitoso'
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error en login'
        });
    }
};

const verify = async (req, res) => {
    const authHeader = req.headers.authorization;

    try {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.substring(7);
        const decoded = authService.verify(token);

        res.status(200).json({
            success: true,
            data: decoded,
            message: 'Token válido'
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || 'Token inválido o expirado'
        });
    }
};

module.exports = { login, verify };