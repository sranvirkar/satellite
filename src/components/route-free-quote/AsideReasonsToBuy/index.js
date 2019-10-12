import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class AsideReasonsToBuy extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <aside
        className="free-quote-AsideReasonsToBuy">
       
        <label className="poncho-lead bold">Why Poncho?</label>
        <ul>
          <li>
            <p className="poncho-body">No lock ins or cancellation fees</p>
          </li>
          <li>
            <p className="poncho-body">Multi-car monthly subscription policy</p>
          </li>
          <li>
            <p className="poncho-body">Redbook guaranteed car value</p>
          </li>
          <li>
            <p className="poncho-body">Windscreen and transport cover as standard</p>
          </li>
          <li>
            <p className="poncho-body">24/7 claims help</p>
          </li>
        </ul>
      </aside>
    )
  }
}

export default AsideReasonsToBuy;
