const express = require('express');
const router = express.Router();
const {validateRequest} = require('../middlewares/requestValidator');

const { doGetChats, doGetAllFriends, doCreateFriend,doClear,doCreateChat } = require('../controllers/chatController');
const {validateChatSchema} = require('../middlewares/chatSchemaValidators');

function setUpChatRoutes(app, chatService, tokenSecret) {
    router.post('/addfriend',doCreateFriend(chatService));
    router.post('/addchat', doCreateChat(chatService));
    router.get('/chats', doGetChats(chatService));
    router.get('/friends', doGetAllFriends(chatService));
    app.use('/api/chat',router);
}

module.exports = setUpChatRoutes;
