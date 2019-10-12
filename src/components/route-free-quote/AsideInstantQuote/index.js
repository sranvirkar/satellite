import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class AsideInstantQuote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight - 128
    }
  }

  render() {
    return (
      <div
        className="free-quote-AsideInstantQuote"
        style={{"height": `${this.state.height}px`}}>
        {/*<label className="poncho-h4">Instant quote for free</label>
        <ul>
          <li>
            <span className="poncho-caption grey">1</span>
            <p className="poncho-lead grey">Monthly rolling subscription</p>
          </li>
          <li>
            <span className="poncho-caption grey">2</span>
            <p className="poncho-lead grey">Realtime car valuation by Redbook</p>
          </li>
          <li>
            <span className="poncho-caption grey">3</span>
            <p className="poncho-lead grey">Cover multiple vehicles & drivers</p>
          </li>
          <li>
            <span className="poncho-caption grey">4</span>
            <p className="poncho-lead grey">Instant quotation</p>
          </li>
        </ul>*/}
      </div>
    )
  }
}

export default AsideInstantQuote;
