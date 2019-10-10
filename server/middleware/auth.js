module.exports = (req, res, next) => {
  roomID = Number(req.params.id);
  let isValidRoom = rooms.has(roomID);
  if (!isValidRoom) {
    req.flash("error_msg", "Room Doesn't exist");
    res.redirect("/");
  } else if (rooms.get(roomID).length >= 2) {
    req.flash("error_msg", "Access Denied! Room Full");
    res.redirect("/");
  } else next();
};
