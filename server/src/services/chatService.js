const { Errors } = require('../utils/errors');
const STATUS_CODE = require('http-status-codes').StatusCodes;


async function makeChatServices(dao) {
  return new ChatServices(dao);
}

class ChatServices {
  constructor(dao) {
    this.dao = dao;
  }

  async createFriend(body) {
    const{userId, friendId, friendName, userName} = body;
    try{
        const result = await this.findFriend({userId:userId,friendId:friendId});
        if(!result.isOk){
            const roomId = userId+"_"+friendId;
            const friendAdded = await this.dao.addFriend({userId, friendId,roomId,friendName});
            if(friendAdded.isOk){
                const isUserFriend = await this.findFriend({userId:friendId,friendId:userId});
                if(!isUserFriend.isOk){
                    const userAdded = await this.dao.addFriend({userId:friendId,friendId:userId,roomId,friendName:userName});
                    if(userAdded.isOk){
                        return Errors.okResult(friendAdded.val);
                    }
                }
            }else{
                return Errors.errResult('Friend Addition Failed',STATUS_CODE.INTERNAL_SERVER_ERROR);
            }
            
        }else{
            return Errors.errResult('Friend already exist',STATUS_CODE.CONFLICT);
        }

    }catch(error){
        return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    
  }

 

  async findFriend(params) {    
    try{
        const result = await this.dao.queryOnFriends(params);
        if(result.isOk && result.val.length>0){
            return Errors.okResult(result.val);
        }else{
            return Errors.errResult('Friend doesnt exist',STATUS_CODE.NOT_FOUND);
        }
    }
    catch(error){
        return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }    
  }

  async findAllFriend(params) {
    try{
        const result = await this.dao.queryOnFriends({userId:params});
        if(result.isOk && result.val.length>0){
            return Errors.okResult(result.val);
        }else{
            return Errors.errResult('Friend doesnt exist',STATUS_CODE.NOT_FOUND);
        }
    }
    catch(error){
        return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }   
  }

  
  async createChat(body){
    try{
        return await this.dao.addMessage(body);
    }catch(error){
        return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async findChats(params){
    try{
        const roomId = params;
        const result = await this.dao.queryOnMessages({roomId:roomId}, false);
        if(result.isOk){
            return Errors.okResult(result.val);
        }
    }catch(error){
        return Errors.errResult(error.message,STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }



 



 
}


module.exports = { ChatServices, makeChatServices };