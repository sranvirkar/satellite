
import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./components/App";
import "./index.scss";

import { render } from "react-dom";
export const init = function(el) {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    el
  );
};
