app.get("/", (req, res) => {
  res.render("index", req.flash());
});

app.post("/verify", async (req, res) => {
  const url =
    config.get("baseURL") + config.get("apiKey") + "&text=" + req.body.word;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const wordInfo = JSON.parse(body);
      const verifiedWord = wordInfo.def.length > 0;
      if (verifiedWord) res.status(200).send("VERIFIED WORD");
      else res.status(400).send("INVALID WORD");
    } else {
      console.log(error);
      res.status(400).send("SOMETHING WENT WRONG");
    }
  });
});

app.get("/room/create", (req, res) => {
  let unique = false;
  let roomID;
  while (!unique) {
    // Generating a random 6 digit number
    roomID = Math.floor(Math.random() * 900000) + 100000;
    if (rooms.size !== 0) {
      for (const [key, value] of rooms) {
        if (key === roomID) {
          unique = false;
          break;
        }
        unique = true;
      }
    } else unique = true;
  }
  rooms.set(
    roomID,
    setTimeout(() => {
      rooms.delete(roomID);
      // console.log(rooms);
    }, 300000)
  );
  // console.log(rooms);
  res.status(200).send(roomID.toString());
});

app.post("/room", (req, res) => {
  const roomID = req.body.roomID;
  res.redirect(`/room/${roomID}`);
});

app.get("/room/:id", auth, (req, res) => {
  res.render("game");
});
