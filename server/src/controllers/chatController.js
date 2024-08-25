const { Errors } = require('../utils/errors');
const STATUS_CODE = require('http-status-codes').StatusCodes;



function doCreateFriend(service) {
    return async (req, res) => {
      try {
        const result = await service.createFriend(req.body);
        if (!result.isOk) throw result;
        const friend = result.val;
        const response = Errors.okResult(friend);
        res.status(STATUS_CODE.CREATED).json(response);
      }
      catch(err) {
        const { error: { message, code } } = err || { error: {} };
        res.status(code).json(message);
      }
    };
}
function doCreateChat(service) {
    return async (req, res) => {
      try {
        const result = await service.createChat(req.body);
        if (!result.isOk) throw result;
        const chat = result.val;
        const response = Errors.okResult(chat);
        res.status(STATUS_CODE.CREATED).json(response);
      }
      catch(err) {
        const { error: { message, code } } = err || { error: {} };
        res.status(code).json(message);
      }
    };
}  
function doGetAllFriends(service) {
    return async (req, res) => {
      try {
        const { userId } = req.query;
        const result = await service.findAllFriend(userId);
        if (!result.isOk) throw result;
        const friends = result.val;
        const response = Errors.okResult(friends);
        res.status(STATUS_CODE.OK).json(response);
      }
      catch(err) {
        const { error: { message, code } } = err || { error: {message: err.message, code:STATUS_CODE.INTERNAL_SERVER_ERROR} };
        res.status(code).json(message);
      }
    };
}

function doGetChats(service) {
    return async (req, res) => {
      try {
        const { roomId } = req.query;
        const result = await service.findChats(roomId);
        if (!result.isOk) throw result;
        const chats = result.val;
        const response = Errors.okResult(chats);
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

module.exports = { doGetChats, doGetAllFriends, doCreateFriend,doClear,doCreateChat };