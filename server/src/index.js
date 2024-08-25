require("dotenv").config();
const { AuthDao, makeAuthDao } = require('./daos/authDao');
const { ChatDao, makeChatDao } = require('./daos/chatDao');

const setUpAuthRoutes = require("./routes/authRoutes");
const setUpChatRoutes = require("./routes/chatRoutes");

const {AuthServices,makeAuthServices } = require('./services/authService');
const { ChatServices, makeChatServices }  = require('./services/chatService');
const express = require("express");
const app = express();
const cors = require("cors");
const {Server, Socket} = require('socket.io'); 




async function main() {  
  const config = process.env;
  let dao = null;

  try {
    const daoResult = await makeAuthDao(config.MONGO_URL_AUTH);
    if (!daoResult.isOk)
      process.exit(1);

    dao = daoResult.val;
    const authService = await makeAuthServices(dao, config);

    const daoChatResult = await makeChatDao(config.MONGO_URL_CHAT);
    if (!daoChatResult.isOk)
      process.exit(1);

    const daoChat = daoChatResult.val;
    const chatService = await makeChatServices(daoChat);

    app.use(cors());
    app.use(express.json());

    setUpAuthRoutes(app,authService, config.TOKEN_SECRET);
    setUpChatRoutes(app,chatService, config.TOKEN_SECRET);

    const server = app.listen(config.PORT, () =>
      console.log(`Server started on ${config.PORT}`)
    );

    const io = new Server(server,{
      cors: {
        origin: "http://localhost:3000",
        credentials: true,
      },
    });    
    
    let activeUsers = new Map();
    io.on("connection", (socket) =>{

      socket.on("add-user",(userId) => {
        if(userId){
          console.log(`${userId} connected`);
          activeUsers.set(userId, socket.id);
          const iterable = {
            [Symbol.iterator]() {
              return [...activeUsers?.keys()][Symbol.iterator]();
            },
          };
          const val = Array.from(iterable);
          console.log(val);
          io.emit("get-users",val);
        }
      });

      socket.on("send-msg", ({recieverId,data}) =>{
        console.log("Initiated send");
        const sendUserSocket = activeUsers.get(recieverId);
        if(sendUserSocket){
          console.log(`${data.senderId} sending message`);
          socket.to(sendUserSocket).emit("msg-recieve", data);
        }
      })

      // socket.on("typing-msg", ({senderId,recieverId,data}) =>{
      //   const sendUserSocket = activeUsers.get(recieverId);
      //   if(sendUserSocket){
      //     console.log(`${senderId} is typing message`);
      //     socket.to(sendUserSocket).emit("typing-recieve", data);
      //   }
      // })

      socket.on("disconnect",(userId)=>{
          activeUsers.delete(userId);
          console.log(`disconnected`);
          io.emit("get-users",activeUsers);
      })

    })
    
          
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {

  }
}



main().then(() => {
  console.log("Executed Main")
}).catch(error => {
  console.error(error);
  process.exit(1);
});;