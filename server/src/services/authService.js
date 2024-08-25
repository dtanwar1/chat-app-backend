const { Errors } = require('../utils/errors');
const bcrypt = require('bcrypt');
const { query } = require('express');
const STATUS_CODE = require('http-status-codes').StatusCodes;
const DEFAULT_BCRYPT_ROUNDS = 10;
const jwt = require('jsonwebtoken');

async function makeAuthServices(dao, config) {
  return new AuthServices(dao, config);
}

class AuthServices {
  constructor(dao, config) {
    this.dao = dao;
    this.config = config;
  }

  async register(body) {
    try{
        const{email} = body;
        const emailResult = await this.dao.getByEmail(email);
        if(!emailResult.isOk){
              const passwordHash = await bcrypt.hash(body.password, DEFAULT_BCRYPT_ROUNDS);
              const {firstName, lastName} = body;
              const fullName = `${firstName} ${lastName}`;
              const u = { fullName,passwordHash, ...body };
              delete u.password; delete u.confirmPassword;
              return await this.dao.add(u);
            
        }else{
          return Errors.errResult('User already exist',STATUS_CODE.CONFLICT);
        }
    }catch(error){
      return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async login(body) {
    try{
      const {email,password} = body;
      const emailResult = await this.dao.getByEmail(email);
      if(!emailResult.isOk || !(await bcrypt.compare(password, emailResult.val.passwordHash))){
        return Errors.errResult(`Invalid login`,  STATUS_CODE.UNAUTHORIZED);
      }else{
        const {userId, firstName,lastName, email, fullName} = emailResult.val;
        const data = {userId, firstName,lastName, email};
        const accessToken = this.generateAccessToken(data, this.config.ACCESS_TOKEN_EXPIRY);
        const refreshToken = this.generateAccessToken(data, this.config.REFRESH_TOKEN_EXPIRY);
        return Errors.okResult({userId, fullName,accessToken, refreshToken});
      }

    }catch(error){
      return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
   
  }

  async getByEmail(params) {
    try{
      const email = params;
      const result = await this.dao.getByEmail(email);
      if(result.isOk){
        const response = result.val;
        delete response.passwordHash;
        return Errors.okResult(response);
      }else{
        return Errors.errResult("Cannot find User",STATUS_CODE.NOT_FOUND);
      }
    }catch(error){
      return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async query(params) {
    try{
      return await this.dao.query(params);
    }catch(error){
      return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }    
  }

  
  async getAllRegisteredUsers(params){
    try{
      const {userId} = params;
      const dbResult = await this.dao.query({},false);
      if(dbResult.isOk){
        const filterResult = dbResult.val.map(x => {
          const { passwordHash, ...newObj } = x;
          return newObj;
      }).filter(x => x.userId !== userId);

        return Errors.okResult(filterResult);
      }else{
        throw dbResult;
      }
    }catch(error){
      return Errors.errResult(error.message ,STATUS_CODE.INTERNAL_SERVER_ERROR);
    } 

  }

 

  generateAccessToken(data, expiry) {    
    return jwt.sign(data, this.config.TOKEN_SECRET, { algorithm: "HS256", expiresIn: expiry});
  }

}


module.exports = { AuthServices, makeAuthServices,query };