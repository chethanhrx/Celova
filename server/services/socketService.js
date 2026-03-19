/**
 * Socket.io Service
 * Manages all real-time features:
 * - Notification delivery
 * - Watch Party sync
 * - Admin activity feed
 */

let ioInstance = null;

// Map of userId → socket.id[] for targeted notifications
const userSockets = new Map();

// Watch party rooms: roomId → { host, members[], videoState }
const watchPartyRooms = new Map();

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── User Authentication ────────────────────────────────────────────
    socket.on('authenticate', (userId) => {
      if (!userId) return;
      socket.userId = userId;

      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId).push(socket.id);

      socket.join(`user:${userId}`);
      console.log(`✅ User ${userId} authenticated on socket ${socket.id}`);
    });

    // ─── Watch Party ─────────────────────────────────────────────────────
    socket.on('watch-party:create', (data) => {
      const { roomId, userId, seriesTitle, episodeTitle } = data;

      watchPartyRooms.set(roomId, {
        host: userId,
        members: [{ userId, socketId: socket.id }],
        videoState: { isPlaying: false, currentTime: 0, episodeId: data.episodeId },
        seriesTitle,
        episodeTitle,
        createdAt: new Date(),
      });

      socket.join(`room:${roomId}`);
      socket.emit('watch-party:created', { roomId, success: true });
    });

    socket.on('watch-party:join', (data) => {
      const { roomId, userId, userName } = data;
      const room = watchPartyRooms.get(roomId);

      if (!room) {
        socket.emit('watch-party:error', { message: 'Room not found or has ended.' });
        return;
      }

      if (room.members.length >= 8) {
        socket.emit('watch-party:error', { message: 'Room is full (max 8 users).' });
        return;
      }

      room.members.push({ userId, socketId: socket.id, userName });
      socket.join(`room:${roomId}`);

      // Send current video state to new joiner
      socket.emit('watch-party:synced', room.videoState);

      // Notify everyone else
      socket.to(`room:${roomId}`).emit('watch-party:user-joined', {
        userId,
        userName,
        memberCount: room.members.length,
      });
    });

    socket.on('watch-party:sync', (data) => {
      const { roomId, videoState, userId } = data;
      const room = watchPartyRooms.get(roomId);

      if (!room || room.host !== userId) return; // Only host can sync

      room.videoState = videoState;
      socket.to(`room:${roomId}`).emit('watch-party:synced', videoState);
    });

    socket.on('watch-party:chat', (data) => {
      const { roomId, message, userId, userName } = data;
      io.to(`room:${roomId}`).emit('watch-party:message', {
        userId,
        userName,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('watch-party:leave', (data) => {
      const { roomId, userId } = data;
      const room = watchPartyRooms.get(roomId);

      if (room) {
        room.members = room.members.filter((m) => m.userId !== userId);
        if (room.members.length === 0) {
          watchPartyRooms.delete(roomId);
        } else if (room.host === userId && room.members.length > 0) {
          // Transfer host to next member
          room.host = room.members[0].userId;
          io.to(`room:${roomId}`).emit('watch-party:host-changed', { newHost: room.host });
        }
        socket.to(`room:${roomId}`).emit('watch-party:user-left', { userId });
      }

      socket.leave(`room:${roomId}`);
    });

    // ─── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        const sockets = userSockets.get(socket.userId) || [];
        const updated = sockets.filter((id) => id !== socket.id);
        if (updated.length === 0) {
          userSockets.delete(socket.userId);
        } else {
          userSockets.set(socket.userId, updated);
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Send a real-time notification to a specific user
 * @param {string} userId
 * @param {Object} notification - Notification object from DB
 */
const sendNotificationToUser = (userId, notification) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit('notification', notification);
};

/**
 * Broadcast admin activity event (for admin panel live feed)
 * @param {Object} event
 */
const broadcastAdminActivity = (event) => {
  if (!ioInstance) return;
  ioInstance.emit('admin:activity', {
    ...event,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get socket io instance for use in other modules
 */
const getIO = () => ioInstance;

module.exports = { initSocket, sendNotificationToUser, broadcastAdminActivity, getIO };
