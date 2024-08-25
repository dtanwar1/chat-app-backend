
const Joi = require('joi');
const STATUS_CODE = require('http-status-codes').StatusCodes;
const { Errors } = require('../utils/errors');

const schemas = {
    '/signup': Joi.object({
        firstName: Joi.string().required().messages({
            'string.empty': 'First name is required'
        }),
        lastName: Joi.string().required().messages({
            'string.empty': 'Last name is required'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required'
        }),
        password: Joi.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.empty': 'Password is required'
        }),
        confirmPassword: Joi.string().min(8).required().valid(Joi.ref('password'))
            .messages({
                'any.only': 'Passwords do not match',
                'string.min': 'Confirm password must be at least 8 characters long',
                'string.empty': 'Confirm password is required'
            })
    }).options({ abortEarly: false }),

    '/login': Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required'
        })
    }).options({ abortEarly: false }),

    '/allUser': Joi.object({
        userId: Joi.string().required().messages({
            'string.empty': 'userId is required'
        })
    }).options({ abortEarly: false })
};




function validateAuthSchema(req) {
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
    validateAuthSchema
};
