import React, { Component } from "react";
import "../css/style_game.css";

export default class GameScreen extends Component {
  render() {
    return (
      <>
        <div id="board">
          <div id="player_self" className="players">
            <h1 className="header">YOU</h1>
            <input type="text" id="word_input" placeholder="Type Here" />
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="total_score">
              <h3>{}</h3>
            </div>
            <div className="word_history">
              <div className="words">
                <h2>WORDS</h2>
              </div>
              <div className="points">
                <h2>POINTS</h2>
              </div>
            </div>
          </div>

          <div id="filter"></div>
          <div id="player_opponent" className="players">
            <h1 className="header">OPPONENT</h1>
            <p id="typing">Opponent is typing...</p>
            <div className="total_score">
              <h3>{}</h3>
            </div>
            <div className="word_history">
              <div className="words">
                <h2>WORDS</h2>
              </div>
              <div className="points">
                <h2>POINTS</h2>
              </div>
            </div>
          </div>
        </div>

        <div id="winning_score">
          <p>TO WIN</p>
          <input type="number" value="50" id="winning_score_input" readonly />
        </div>
      </>
    );
  }
}
