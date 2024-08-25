const express = require('express');
const router = express.Router();
const {validateRequest} = require('../middlewares/requestValidator');

const {doCreateUser,doGetAllUser,doLoginUser,doGetUser} = require('../controllers/authController')

function setUpAuthRoutes(app, authService, tokenSecret) {
    router.post('/signup',doCreateUser(authService));
    router.post('/login', doLoginUser(authService));
    router.get('/allUser', doGetAllUser(authService));
    router.get('/user/:emailId', doGetUser(authService));
    app.use('/api/auth', validateRequest(tokenSecret),router);
}

module.exports = setUpAuthRoutes;
