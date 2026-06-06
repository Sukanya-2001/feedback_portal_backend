import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        const authheaders = req.headers.authorization;

        if(!authheaders || !authheaders.startsWith('Bearer ')){
            return res.status(401).json({message:'Access denied or no token provided.'})
        }

        let token = authheaders.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);

        req.user = decode;
        next();

    } catch (err)  {
        return res.status(401).json({message: 'Invalid or expired token.'})
    }
}