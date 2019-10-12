import React, { Component } from "react";

class PriceBreakdown extends Component {
  render() {
    const { breakdownObject } = this.props;

    return (
      <ul className="PriceBreakdown">
        {
          Object.keys(breakdownObject).map((key, index) => (
            <li key={index} className="poncho-body">
              <p>{key}</p>
              <span>{breakdownObject[key]}</span>
            </li>
          ))
        }
      </ul>
    );
  }
}

export default PriceBreakdown;
