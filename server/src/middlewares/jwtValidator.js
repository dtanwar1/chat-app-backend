const jwt = require('jsonwebtoken');
const STATUS_CODE = require('http-status-codes').StatusCodes;
const { Errors } = require('../utils/errors');

function validateJWT(secretKey,req) {

    try{
    
        
        const bearerToken = req.headers.authorization;

        if (!bearerToken) {
            return Errors.errResult('No token provided',STATUS_CODE.UNAUTHORIZED );
        }

        const bearer = bearerToken.split(' ');
        const token = bearer[1];

        const decoded = jwt.verify(token, secretKey)

        return Errors.VOID_RESULT;
    }
    catch(error){
        return Errors.errResult('Failed to authenticate token',STATUS_CODE.FORBIDDEN )
    }
    
}

module.exports = {validateJWT};
