import React, { Component } from "react";

export default class Value extends Component {

  render() {
    const {
      value
    } = this.props;

    const roundedPrice = (number) => `$${Number(number).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

    return (
      <div className="shared-VehicleSummary-Value">
        <h5 className="poncho-body bold short">Car value</h5>
        <p className="poncho-body grey">Powered by Redbook</p>
        <span className="price-number-rhs poncho-h4">{roundedPrice(value || 0)}</span>
      </div>
    );
  }
}
