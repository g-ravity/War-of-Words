import React, { Component } from "react";
import axios from "axios";
import "../css/style_index.css";

export default class HomeScreen extends Component {
  state = {
    room: ""
  };

  handleSubmit = async () => {
    // await axios.post("/room");
    this.props.history.push(`/room/${this.state.room}`);
  };

  render() {
    return (
      <div id="home_page">
        <div id="showcase">
          <h1>Welcome to War of Words!</h1>
          <p>
            Play the most intense text battle game online with your friends
            right now
          </p>
          <button id="create_room">CREATE ROOM</button>
          <p>or</p>
          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              className="form_field"
              placeholder="Enter Room ID"
              name="roomID"
              autoComplete="off"
              value={this.state.room}
              onChange={event => this.setState({ room: event.target.value })}
            />
            <input type="submit" id="join_room" value="JOIN ROOM" />
          </form>
        </div>
      </div>
    );
  }
}
