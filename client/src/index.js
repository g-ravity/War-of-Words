import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";

import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import "./css/style_global.css";

ReactDOM.render(
  <>
    <BrowserRouter>
      <Route path="/" exact component={HomeScreen} />
      <Route path="/room" component={GameScreen} />
    </BrowserRouter>
  </>,
  document.querySelector("#root")
);
