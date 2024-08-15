const jwt = require('jsonwebtoken');

const CheckLogin = (req, res, next) => {
    const { authorization } = req.headers;

    try {
        // Extract token from authorization header
        const token = authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.userName = decoded.userName;
        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.error('JWT verification error:', error);

        // Handle verification errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Authentication error', error: error.message });
    }
}

module.exports = CheckLogin;
