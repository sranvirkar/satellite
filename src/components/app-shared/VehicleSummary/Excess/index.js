import React, { Component } from "react";

export default class Excess extends Component {

  render() {
    const {
      excess
    } = this.props;

    const roundedPrice = (number) => `$${Number(number).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

    return (
      <div className="shared-VehicleSummary-Excess">
        <h5 className="poncho-body bold short">Excess</h5>
        <span className="price-number-rhs poncho-h4">{roundedPrice(excess || 0)}</span>
      </div>
    );
  }
}
