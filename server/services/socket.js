module.exports = io => {
  io.on("connection", socket => {
    const roomID = socket.handshake.query.roomID;
    if (!Array.isArray(rooms.get(Number(roomID)))) {
      clearTimeout(rooms.get(Number(roomID)));
      rooms.set(Number(roomID), []);
    }
    const roomArr = rooms.get(Number(roomID));
    roomArr.push(socket.id);

    // console.log(rooms);

    socket.join(roomID);

    socket.on("newGameTurn", () => {
      if (roomArr.length === 2) {
        turn = roomArr[Math.floor(Math.random() * 2)];
        io.to(roomID).emit("activeTurn", turn);
      }
    });

    socket.on("activeTurn", turnID => {
      turnIndex = roomArr.indexOf(turnID) === 0 ? 1 : 0;
      turn = roomArr[turnIndex];
      io.to(roomID).emit("activeTurn", turn);
    });

    socket.on("wordPlayed", wordInfo => {
      socket.to(roomID).emit("playedWord", {
        word: wordInfo.word,
        point: wordInfo.point
      });
    });

    socket.on("typing", () => {
      socket.to(roomID).emit("typing");
    });

    socket.on("typingStopped", () => {
      socket.to(roomID).emit("typingStopped");
    });

    socket.on("disconnect", () => {
      roomArr.splice(roomArr.indexOf(socket.id), 1);
      if (roomArr.length === 0) rooms.delete(Number(roomID));
      socket.to(roomID).emit("disconnected");
      // console.log(rooms);
    });
  });
};
