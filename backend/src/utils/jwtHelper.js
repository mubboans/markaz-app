import { sendResponse } from './ReqResHelperFn';

const jwt = require('jsonwebtoken');

export const createToken = (payload) => jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1h' });

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
        return null;
    }
}

export const checkHeaderToken = async (req,res,next)=>{
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            const error = new Error("Authorization token missing");
            error.code = 401;
            error.status = "fail";
            throw error;
        }
        const token = authorization.split(' ')[1]; 

        const checkToken = verifyToken(token);
        if (!checkToken) {
            const error = new Error("Token is not valid");
            error.code = 401;
            error.status = "Invalid token";
            throw error;
        }
        req.user = checkToken;
        next(); 
    } catch (error) {
        const err = new Error(error?.message || "Token is not valid");
        err.code = 401;
        err.status = error?.message ?? "Invalid token";
        throw err;
    }
}



