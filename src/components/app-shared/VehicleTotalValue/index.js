import React, { Component } from "react";
import ToggleList from "components/app-shared/ToggleList";

class VehicleTotalValue extends Component {
  render() {
    const { field, answer } = this.props;
    // console.log('answer', answer.value);
    return (
      <div className="shared-VehicleTotalValue">
        <div className="body">
          <div className="body-text">
            <p className="poncho-h5">This Car Value</p>
            <p className="single-car-value poncho-body light-grey">Single Car Value is the amount that we agree to insure your car for. Unlike ‘market value’ (which is the amount your car is assessed to be worth immediately before it was damaged or lost), you'll know how much your car is insured for now. It will be printed on your Certificate of Insurance.</p>
          </div>
          <div className="value-container">
            <div className="value">{`$${Number(answer.value).toLocaleString()}`}</div>
            {/*<div className="poncho-caption grey">Estimated vehicle value</div>*/}
            <div className="redbook-logo">
              <img src={`${reactRoute}/resource/poncho/assets/img/powered-by-redbook.png`}/>
            </div>
          </div>
        </div>

        <ToggleList title="How's it calculated?" className="explanation">
          <div className="explanation-text poncho-body short">How’s it calculated you say? Before you take out a policy, the Single Car Value will be worked out based on the make, model, the number of kilometres your car has driven, the number of kilometres you are expecting to drive and the age of your car. This will be checked in the event of a claim. This value is calculated using RedBook.
It's worth noting that there may be deductions at payout time (like any outstanding debt on your car owed to a creditor, your unexpired registration, your contribution to the claim and CTP insurance).</div>
        </ToggleList>
      </div>
    );
  }
}

export default VehicleTotalValue;
