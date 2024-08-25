const { bool } = require("joi");

const STATUS_CODE = require('http-status-codes').StatusCodes;
const {validateAuthSchema} = require('./authSchemaValidator');
const {validateChatSchema} = require('./chatSchemaValidators');
const {validateJWT} = require('../middlewares/jwtValidator');
const { Errors } = require('../utils/errors');


const unprotectedPath = ['/signup','/login'];

function validateRequest(secretKey) {
    return function(req, res, next) {
    
        const path = req.path;
        const isProtected = unprotectedPath.every(x=>x!=path);
    
        // if(isProtected){
        //     const validateJWTResult = validateJWT(secretKey,req);
        //     if(!validateJWTResult.isOk){
        //         const error = validateJWTResult.error;
        //         return res.status(error.code).json({ error: error.message });
        //     }
        // }

        // const validateAuthSchemaResult = validateAuthSchema(req);
        // if(!validateAuthSchemaResult.isOk){
        //     const error = validateAuthSchemaResult.error;
        //     return res.status(error.code).json({ error: error.message });
        // }

         const validateChatSchemaResult = validateChatSchema(req);
        if(!validateChatSchemaResult.isOk){
            const error = validateChatSchemaResult.error;
            return res.status(error.code).json({ error: error.message });
        }
    
        next();
    };
   
}

module.exports = {
    validateRequest
};

