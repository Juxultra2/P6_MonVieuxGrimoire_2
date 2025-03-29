// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Authorization header missing');

    const token = authHeader.split(' ')[1]; // format : Bearer <token>
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentification invalide', error: error.message });
  }
};
