'use strict';
const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const { Server } = require("socket.io");

    let io = new Server(strapi.server.httpServer, {
      cors: { // cors setup
        origin: "http://localhost:4173",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });

    // Handle socket connection
    io.on('connection', (socket) => {
      const token = socket.handshake.auth.token
      if (!token) {
        console.log('No token provided');
        return socket.disconnect(true);
      }

      jwt.verify(token, strapi.config.get('plugin::users-permissions.jwtSecret'), (err, decoded) => {
        if (err) {
          console.log('Invalid token');
          return socket.disconnect(true);
        }

        console.log(`User connected: ${decoded.id}`);

        socket.on('send-message', (message) => {
          // Add 360ms delay
          setTimeout(()=>{
            console.log(`Message received: ${message}`);
            socket.emit('receive-message', message)
          }, 360);
        });

        // Handle socket disconnection
        socket.on('disconnect', () => {
          console.log(`Socket disconnected: ${socket.id}`);
        });
      });
    });
  },
};
