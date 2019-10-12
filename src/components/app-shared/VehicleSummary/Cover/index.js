import React, { Component } from "react";
import FormCard from "components/app-shared/FormCard";
import { Shield } from "helpers/svgIcons";

export default class Cover extends Component {

  render() {
    const captions = () => {
      return <ul>
        <li>
          <span className="poncho-body light-grey short">Covers you for damage to your car, plus damage you cause to other peoples vehicles and property.</span>
        </li>
        <li>
          <h5 className="poncho-body bold short">Your Contribution</h5>
        </li>
        <li>
          <span className="poncho-body light-grey short">In the event of a claim, you may need to pay a contribution. See our PDS for when a contribution applies.</span>
        </li>
        <li>
          <h5 className="poncho-body bold short">Basic Contribution ($800)</h5>
        </li>
        <li>
          <span className="poncho-body light-grey short">This applies to all claims.</span>
        </li>
        <li>
          <h5 className="poncho-body bold short">Unlisted Driver Contribution ($3000)</h5>
        </li>
        <li>
          <span className="poncho-body light-grey short">This applies if an unlisted driver is driving the car at the time of the incident. If you pay the unlisted driver contribution, you won’t need to pay the basic contribution too.</span>
        </li>


        <li style={{"paddingTop": "18px"}}>
          <a className="poncho-body short teal">View Product Disclosure Statement (PDS)</a>
        </li>
      </ul>
    }

    return (
      <div className="shared-VehicleSummary-Cover">
        <h5 className="poncho-body bold short">Cover</h5>
        <FormCard
          title={`Comprehensive cover`}
          svgIcon={Shield}
          isSelected="true"
          captionsComponents={captions()}
          styles="pay-section-cover"/>
      </div>
    );
  }
}
