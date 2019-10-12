import React, { Component } from "react";

class MonthlyPremium extends Component {
  render() {
    // By default, colour is teal but can also be orange
    const { price, colour, hideCaption, notMonthly } = this.props;

    let className = "total-premium";
    if (colour) className += ` ${colour}`;

    return (
      <div className="MonthlyPremium">
        <div className={`${className} ${price ? "" : "invalid"}`}>
          {
            price ?
            <p>
              ${price}
              {
                !notMonthly && <span>/mo</span>
              }
            </p> :
            <p><span>null</span></p>
          }
        </div>

        { !hideCaption && <p className="poncho-caption grey monthly-incl-gst-title">Monthly incl GST & Gov charges</p> }
      </div>
    );
  }
}

export default MonthlyPremium;
