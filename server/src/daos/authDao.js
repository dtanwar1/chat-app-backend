const mongo = require('mongodb');
const { Errors } = require('../utils/errors');
//const User = require('./user.js');

async function makeAuthDao(dbUrl) {
  return await AuthDao.make(dbUrl);
}

class AuthDao {
  constructor(client, users, nextId) {
    this.client = client;
    this.users = users;
    this.nextId = nextId;
  }

  static async make(dbUrl) {
    try {
      const client = await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();
      const users = db.collection(USERS_COLLECTION);
      const nextId = db.collection(NEXT_ID_COLLECTION);
      await users.createIndex('email');
      return Errors.okResult(new AuthDao(client, users, nextId));
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

  async add(user) {
    const userId = await this.nextUserId();
    const registeredUser = { userId, ...user };
    const dbObj = { ...registeredUser, _id: userId };
    try {
      const collection = this.users;
      await collection.insertOne(dbObj);
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
    return Errors.okResult(registeredUser);
  }

  async getByUserId(userId) {
    try {
      const collection = this.users;
      const projection = { _id: false };
      const user = await collection.findOne({ _id: userId }, { projection });
      if (user) {
        return Errors.okResult(user);
      } else {
        return Errors.errResult(`no user for id '${userId}'`, { code: 'NOT_FOUND' });
      }
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  async getByEmail(email) {
    try {
      const collection = this.users;
      const projection = { _id: false };
      const user = await collection.findOne({ email }, { projection });
      if (user) {
        return Errors.okResult(user);
      } else {
        return Errors.errResult(`no user for id '${email}'`, { code: 'NOT_FOUND' });
      }
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  async query(filter,isLimited =true) {
    try {
      const index = filter.index ?? 0;
      const count = filter.count ?? DEFAULT_COUNT;
      const collection = this.users;
      const q = { ...filter };
      if (q.index !== undefined) delete q.index;
      if (q.count !== undefined) delete q.count;
      if (q.userId) q._id = q.userId;
      const projection = { _id: false };
      const cursor = await collection.find(q, { projection });
      let entries;
      if(isLimited){
        entries = await cursor.sort({ email: 1 }).skip(index).limit(count).toArray();
      }else{
        entries = await cursor.sort({ email: 1 }).skip(index).toArray();
      }
      return Errors.okResult(entries);
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  

  async remove(userId) {
    try {
      const collection = this.users;
      const delResult = await collection.deleteOne({ _id: userId });
      if (!delResult || delResult.deletedCount === 0) {
        const msg = `no user for userId ${userId}`;
        return Errors.errResult(msg, { code: 'NOT_FOUND' });
      }
      if (delResult.deletedCount !== 1) {
        const msg = `expected 1 deletion; got ${delResult.deletedCount}`;
        return Errors.errResult(msg, 'DB');
      } else {
        return Errors.VOID_RESULT;
      }
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  async update(userId, updates) {
    try {
      const collection = this.users;
      const updateOp = { $set: updates };
      const updateOpts = {
        projection: { _id: false },
        returnDocument: mongo.ReturnDocument.AFTER
      };
      const updateResult = await collection.findOneAndUpdate({ _id: userId }, updateOp, updateOpts);
      if (!updateResult) {
        return Errors.errResult(`no user for ${userId}`, { code: 'NOT_FOUND' });
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
      await this.users.deleteMany({});
      return Errors.VOID_RESULT;
    } catch (err) {
      return Errors.errResult(err.message, 'DB');
    }
  }

  async nextUserId() {
    const query = { _id: NEXT_ID_KEY };
    const update = { $inc: { [NEXT_ID_KEY]: 1 } };
    const options = { upsert: true, returnDocument: mongo.ReturnDocument.AFTER };
    const ret = await this.nextId.findOneAndUpdate(query, update, options);
    const seq = ret[NEXT_ID_KEY];
    return String(seq) + Math.random().toFixed(RAND_LEN).replace(/^0\./, '_');
  }
}

const USERS_COLLECTION = 'users';
const DEFAULT_COUNT = 5;
const NEXT_ID_COLLECTION = 'nextId';
const NEXT_ID_KEY = 'count';
const RAND_LEN = 2;
const MONGO_OPTIONS = {
  ignoreUndefined: true
};

module.exports = { AuthDao, makeAuthDao };