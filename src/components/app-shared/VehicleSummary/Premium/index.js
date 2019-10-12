import React, { Component } from "react";

export default class Premium extends Component {
  render() {
    const {
      premium
    } = this.props;

    const roundedPrice = (number) => `${number.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
      <div className="shared-VehicleSummary-Premium">
        <h4 className="poncho-lead bold">Monthly premium</h4>
        <p className="poncho-body grey">Including GST & Gov charges</p>
        <span className={`monthly ${premium ? "" : "invalid"}`}>{premium ? `$${roundedPrice(premium)}/mo` : "invalid config."}</span>
      </div>
    );
  }
}
