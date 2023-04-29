import setupSocket from './setupSocket';
const colors = require('colors');

/**
 * @description Socket connection, this file is called from server.js and is used to handle socket connections and disconnections
 *              We can import other socket files here to handle socket events and emit socket events from here
 * @param {Object} io - Socket.io instance
 * @returns {void}
 * 
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 */
export default (io: any) => {
  try {
    io.on('connection', (socket: any) => {
      socket.on('setup', (userData: object) => {
        console.log('Socket connected');
        setupSocket(socket, userData);
      });
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      socket.on('join', async (room: {
        roomId: string;
        user: string;
      }) => {
        if (!room.roomId) return;
        console.log(
          colors.green(`${room.user} has joined the video space in room`) +
            colors.blue(` ${room.roomId}`)
        );
        socket.join(room.roomId);
        // emit to the socket that joined the amount of connections to this room
        socket.emit(
          'connections',
          Array.from(await socket.in(room.roomId).allSockets()).length
        );
        // now emit to each user in the room that a new user has joined
        socket.broadcast
          .to(room.roomId)
          .emit(
            'newUserJoin',
            Array.from(await socket.in(room.roomId).allSockets()).length
          );
      });
      socket.on('leave', async (room: {
        roomId: string;
        user: string;
      }) => {
        console.log(
          colors.yellow(`${room.user} has left the room`) +
            colors.blue(` ${room.roomId}`)
        );
        socket.leave(room.roomId);
        // emit to the socket that left the amount of connections to this room
        socket.broadcast
          .to(room.roomId)
          .emit(
            'newUserJoin',
            Array.from(await socket.in(room.roomId).allSockets()).length
          );
      });
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
