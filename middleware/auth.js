const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if(authHeader){
        const token = req.headers.authorization

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;

            next();
        } catch (error) {
            return res.status(401).json({ status: false, error: 'Invalid token' });
        }
    }else{
        return res.status(401).json({ status: false, error: 'Authorization header missing or invalid' });
    }
}




module.exports = auth;