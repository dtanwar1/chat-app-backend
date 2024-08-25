const mongo = require('mongodb');
const { Errors } = require('../utils/errors');
//const User = require('./user.js');

async function makeChatDao(dbUrl) {
  return await ChatDao.make(dbUrl);
}

class ChatDao {
  constructor(client, friends, messages,latestRoomStates) {
    this.client = client;
    this.friends = friends;
    this.messages = messages;
    this.latestRoomStates = latestRoomStates;
  }

  static async make(dbUrl) {
    try {
      const client = await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();
      const friends = db.collection(FRIENDS_COLLECTION);
      const messages = db.collection(MESSAGES_COLLECTION);
      const latestRoomStates = db.collection(LATESTROOMSTATE_COLLECTION);

      await friends.createIndex('userId');
      await friends.createIndex('friendId');
      await messages.createIndex('roomId');
      await latestRoomStates.createIndex('roomId');
      return Errors.okResult(new ChatDao(client, friends, messages,latestRoomStates));
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  async close() {
    try {
      await this.client.close();
      return Errors.VOID_RESULT;
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  async addFriend(details) { 
    const friendDetails = details;   
    const dbObj = friendDetails;
    try {
      const collection = this.friends;
      await collection.insertOne(dbObj);
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
    return Errors.okResult(friendDetails);
  }

  async addMessage(chat) {    
    const dbObj = chat;
    try {
      const collection = this.messages;
      await collection.insertOne(dbObj);
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
    return Errors.okResult(chat);
  }

  


  async queryOnFriends(filter,isLimited =true) {
    try {
      const index = filter.index ?? 0;
      const count = filter.count ?? DEFAULT_COUNT;
      const collection = this.friends;
      const q = { ...filter };
      if (q.index !== undefined) delete q.index;
      if (q.count !== undefined) delete q.count;
      const projection = { _id: false };
      const cursor = await collection.find(q, { projection });
      let entries;
      if(isLimited){
        entries = await cursor.sort({ timeStamp: 1 }).skip(index).limit(count).toArray();
      }else{
        entries = await cursor.sort({ timeStamp: 1 }).skip(index).toArray();
      }
      return Errors.okResult(entries);
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  async queryOnMessages(filter,isLimited =true) {
    try {
      const index = filter.index ?? 0;
      const count = filter.count ?? DEFAULT_COUNT;
      const collection = this.messages;
      const q = { ...filter };
      if (q.index !== undefined) delete q.index;
      if (q.count !== undefined) delete q.count;
      const projection = { _id: false };
      const cursor = await collection.find(q, { projection });
      let entries;
      if(isLimited){
        entries = await cursor.sort({ timeStamp: 1 }).skip(index).limit(count).toArray();
      }else{
        entries = await cursor.sort({ timeStamp: 1 }).skip(index).toArray();
      }
      return Errors.okResult(entries);
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }


  async update(roomId, updates) {
    try {
      const collection = this.latestRoomStates;
      const updateOp = { $set: updates };
      const updateOpts = {
        projection: { _id: false },
        returnDocument: mongo.ReturnDocument.AFTER
      };
      const updateResult = await collection.findOneAndUpdate({ _id: roomId }, updateOp, updateOpts);
      if (!updateResult) {
        return Errors.errResult(`no user for ${roomId}`, { code: 'NOT_FOUND' });
      } else {
        return Errors.okResult(updateResult);
      }
    } catch (err) {
      console.error(err);
      return Errors.errResult(err.message, 'DB');
    }
  }

  async clear() {
    try {
      await this.friends.deleteMany({});
      await this.messages.deleteMany({});
      await this.latestRoomStates.deleteMany({});
      return Errors.VOID_RESULT;
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  
}

const FRIENDS_COLLECTION = 'friends';
const MESSAGES_COLLECTION = 'messages';
const LATESTROOMSTATE_COLLECTION = 'latestRoomStates';
const DEFAULT_COUNT = 5;
const RAND_LEN = 2;
const MONGO_OPTIONS = {
  ignoreUndefined: true
};

module.exports = { ChatDao, makeChatDao };