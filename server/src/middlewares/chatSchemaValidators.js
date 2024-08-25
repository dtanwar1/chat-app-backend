
const Joi = require('joi');
const STATUS_CODE = require('http-status-codes').StatusCodes;
const { Errors } = require('../utils/errors');

const schemas = {
    '/addfriend': Joi.object({
        userId: Joi.string().required().messages({
            'string.empty': 'userId is required'
        }),
        friendId: Joi.string().required().messages({
            'string.empty': 'friendId is required'
        }),
        friendName:Joi.string().required().messages({
            'string.empty': 'friendId is required'
        })
    }).options({ abortEarly: false }),

    '/friends': Joi.object({
        userId: Joi.string().required().messages({
            'string.empty': 'userId is required'
        })
    }).options({ abortEarly: false }),

    '/addchat': Joi.object({
        senderId: Joi.string().required().messages({
            'string.empty': 'senderId is required'
        }),
        roomId: Joi.string().required().messages({
            'string.empty': 'roomId is required'
        }),
        message: Joi.string().required().messages({
            'string.empty': 'message is required'
        }),
        createdAt: Joi.string().required().messages({
            'string.empty': 'createdAt is required'
        }),
    }).options({ abortEarly: false }),

    '/chats': Joi.object({
        roomId: Joi.string().required().messages({
            'string.empty': 'userId is required'
        })
    }).options({ abortEarly: false })
};




function validateChatSchema(req) {
    const method = req.method;
    const path = req.path;
    const schema = schemas[path];
    if (!schema) {
        return Errors.VOID_RESULT;
    }
    let validationInput;
    if (method === 'GET') {
        validationInput = req.query;
    } else {
        validationInput = req.body;
    }
    const { error } = schema.validate(validationInput);
    if (error) {
        return Errors.errResult(error.message,STATUS_CODE.BAD_REQUEST );
    }
    return Errors.VOID_RESULT;    
}


module.exports = {
    validateChatSchema
};
