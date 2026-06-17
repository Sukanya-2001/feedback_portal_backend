import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

export const authMiddleware = (req, res, next) => {
    try {
        const authheaders = req.headers.authorization;

        if(!authheaders || !authheaders.startsWith('Bearer ')){
            return sendError(res, 'Access denied or no token provided.', null, 401);
        }

        let token = authheaders.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);

        req.user = decode;
        next();

    } catch (err)  {
        return sendError(res, 'Invalid or expired token.', null, 401);
    }
}