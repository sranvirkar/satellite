import React, { Component } from "react";
import { Car2, Place, Wheel, Road, Engine, Gauge, Door, Finance, Add } from "helpers/svgIcons";
import { renderVehicleEquipment, renderVehicleAccessories } from "helpers/vehicle";

{/* 
  viewPolicyPage is a prop coming from PolicyDetails component - there are no answer groups created at this point so actual data is being passed in 
  viewPolicyPage is a true/false in this component - if true, then vehicleEquipment/vehicleAccessories is NOT an index but a JSON string of an array of selected equipment/accessories
  else, it is an array of indexes as usual (indexes into the equipment/accessory list coming from RedBook and stored on the vehicle answer group)
*/}
export default class Details extends Component {
  displayVehicleEquipment = () => {
    const { answerGroup, viewPolicyPage } = this.props;
    if (viewPolicyPage) {
      return JSON.parse(answerGroup.answers.vehicleEquipment).map(obj => obj.description).join(', ');
    } else {
      return renderVehicleEquipment(answerGroup, answerGroup.answers.vehicleEquipment);
    }
  }

  displayVehicleAccessories = () => {
    const { answerGroup, viewPolicyPage } = this.props;
    if (viewPolicyPage) {
      return JSON.parse(answerGroup.answers.vehicleAccessories).map(obj => obj.description).join(', ');
    } else {
      return renderVehicleAccessories(answerGroup, answerGroup.answers.vehicleAccessories);
    }

  }

  render() {
    const {
      answerGroup
    } = this.props;
    const answers = answerGroup.answers;

    return (
      <div className="shared-VehicleSummary-Details">
        <h5 className="poncho-body bold short">Vehicle details</h5>
        <ul>
          <li className="poncho-body light-grey"><Car2 /> {`${answers.vehicleStyle} - ${answers.vehicleDriven} kms`}</li>
          <li className="poncho-body light-grey"><Place /> {`${answers.vehicleAddress}`}</li>
          <li className="poncho-body light-grey"><Wheel /> {`${answers.vehicleUse}`}</li>
          <li className="poncho-body light-grey"><Road /> {`Driven ${answers.vehicleUsagePerWeek} times per week`}</li>
          <li className="poncho-body light-grey"><Engine /> {answers.vehicleHasEquipment == "No" ? "No modifications by original manufacturer" : this.displayVehicleEquipment()}</li>
          <li className="poncho-body light-grey"><Gauge /> {answers.vehicleHasAccessories == "No" ? "No additional modifications" : this.displayVehicleAccessories()}</li>
          <li className="poncho-body light-grey"><Door /> {`${answers.vehicleDamage}`}</li>
          <li className="poncho-body light-grey"><Finance /> {`${answers.vehicleLoanType}`}</li>
          <li className="poncho-body light-grey"><Add /> {`${answers.vehicleDamage}`}</li>
        </ul>
      </div>
    );
  }
}
