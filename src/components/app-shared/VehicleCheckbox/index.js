import React, { Component } from "react";
import { connect } from "react-redux";
import InputCheckboxColumns from "../InputCheckboxColumns";
import { answerGroupRefByIdSelector } from "redux/selectors";

class VehicleCheckbox extends Component {
  getVehicleOptionValues = () => {
    const { vehicle } = this.props;
    return vehicle.options ? vehicle.options.map((option, index) => ({ 
      label: option.description,
      value: String(index)
    })) : [];
  }

  getVehicleModificationValues = () => {
    const { vehicle } = this.props;
    return vehicle.aftermarket ? vehicle.aftermarket.map((option, index) => ({ 
      label: option.description,
      value: String(index)
    })) : [];
  }

  render() {
    const { field } = this.props;
    let values;
    switch (field.name) {
      case "vehicleEquipment":
        values = this.getVehicleOptionValues();
        break;
      case "vehicleAccessories":
        values = this.getVehicleModificationValues();
        break;
    }

    return <InputCheckboxColumns options={values} {...this.props} />;
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
)(VehicleCheckbox);
