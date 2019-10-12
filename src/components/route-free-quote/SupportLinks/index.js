import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class SupportLinks extends Component {
  render() {
    return (
      <div className="free-quote-SupportLinks">
        <img src={`${reactRoute}/resource/poncho/assets/img/contact-wave.png`} />
        <div>
          <p className="poncho-h5">We’re here to help!</p>
          <a className="poncho-body short" href="https://poncho.floatplane.dev/contact/" target="_blank">
            Contact Us
          </a>
        </div>
      </div>
    )
  }
}

export default SupportLinks;
