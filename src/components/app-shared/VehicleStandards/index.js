import React, { Component } from "react";
import { connect } from "react-redux";
import ToggleList from "../ToggleList";
import { answerGroupRefByIdSelector } from "redux/selectors";

class VehicleStandards extends Component {
  render() {
    const { vehicle } = this.props;
    const vehicleStandards = vehicle.standards ? vehicle.standards.map(standard => standard.description) : [];
    return (
      <ToggleList title="Your vehicle's fitted standard parts" className="VehicleStandards">
        <ul>
          {vehicleStandards.map(vehicleStandard => <li key={vehicleStandard}>{vehicleStandard}</li>)}
        </ul>
      </ToggleList>
    );
  }
}

function stateToProps(state, props) {
  return {
    vehicle: answerGroupRefByIdSelector(state, props.answerGroupId)
  };
}

const dispatchToProps = {};

export default connect(
  stateToProps,
  dispatchToProps
)(VehicleStandards);
