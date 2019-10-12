import React, { Component } from "react";
import MonthlyPremium from "components/app-shared/MonthlyPremium";

class YourPolicy extends Component {
  render() {
    const { price, startCoverageDate, endCoverageDate, nextPaymentDate } = this.props;

    return (
      <div className="YourPolicy">
        <div className="left">
          <h3 className="poncho-lead bold">Next payment amount</h3>
          <MonthlyPremium price={price} />
        </div>
        <div className="right">
          <div>
            <p className="poncho-body light-grey">Coverage period:</p>
            <p className="poncho-body">{`${startCoverageDate} - ${endCoverageDate}`}</p>
          </div>
          <div>
            <p className="poncho-body light-grey">Next payment:</p>
            <p className="poncho-body">{nextPaymentDate}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default YourPolicy;
