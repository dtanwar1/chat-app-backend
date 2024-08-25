const { Errors } = require('../utils/errors');
const STATUS_CODE = require('http-status-codes').StatusCodes;



function doCreateUser(service) {
    return async (req, res) => {
      try {
        const result = await service.register(req.body);
        if (!result.isOk) throw result;
        const registeredUser = result.val;
        const response = Errors.okResult(registeredUser);
        res.status(STATUS_CODE.CREATED).json(response);
      }
      catch(err) {
        const { error: { message, code } } = err || { error: {} };
        res.status(code).json(message);
      }
    };
}
function doLoginUser(service) {
    return async (req, res) => {
      try {
        const result = await service.login(req.body);
        if (!result.isOk) throw result;
        const registeredUser = result.val;
        const response = Errors.okResult(registeredUser);
        res.status(STATUS_CODE.OK).json(response);
      }
      catch(err) {
        const { error: { message, code } } = err || { error: {} };
        res.status(code).json(message);
      }
    };
}  
function doGetAllUser(service) {
    return async (req, res) => {
      try {
        const { userId } = req.query;
        const result = await service.getAllRegisteredUsers(userId);
        if (!result.isOk) throw result;
        const users = result.val;
        const response = Errors.okResult(users);
        res.status(STATUS_CODE.OK).json(response);
      }
      catch(err) {
        const { error: { message, code } } = err || { error: {message: err.message, code:STATUS_CODE.INTERNAL_SERVER_ERROR} };
        res.status(code).json(message);
      }
    };
} 
function doGetUser(service) {
  return async (req, res) => {
    try {
      const  {emailId}  = req.params;
      const result = await service.getByEmail(emailId);
      if (!result.isOk) throw result;
      const user = result.val;
      const response = Errors.okResult(user);
      res.status(STATUS_CODE.OK).json(response);
    }
    catch(err) {
      const { error: { message, code } } = err || { error: {message: err.message, code:STATUS_CODE.INTERNAL_SERVER_ERROR} };
      res.status(code).json(message);
    }
  };
}  
function doClear(app) {
  return async (req, res) => {
    try {
      const result = await app.locals.model.clear();
      if (!result.isOk) throw result;
      res.json(result);
    }
    catch(err) {
      const { error: { message, code } } = err || { error: {} };
      res.status(code).json(message);
    }
  };
}

module.exports = { doCreateUser, doGetAllUser, doLoginUser,doClear,doGetUser };