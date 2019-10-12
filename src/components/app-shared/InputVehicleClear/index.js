import React, { Component } from "react";
import { connect } from "react-redux";
import { clearVehicleData } from "redux/actions/vehicle";

class InputVehicleClear extends Component {
// Component for Field where: "name": "vehicleIsExpanded"
// Used as a placeholder so we can store the vehicleIsExpanded state in the qsp
// This is the lesser of two evils because we can have all the field.conditions 'hosted' in the same way
// The answer attached to this field will also be controlled in the app-shared/VehicleCardField component

  sendAction() {
    const { answerGroupId, clearVehicleData } = this.props;

    clearVehicleData(answerGroupId);
  }

  render() {
    const { field, answer } = this.props;

    return (
      <button
        className="shared-InputVehicleClear poncho-btn-primary-reg transparent"
        type="button"
        tabIndex="0"
        onMouseUp={e => this.sendAction()}
        onTouchStart={e => this.sendAction()}
        onTouchEnd={e => e.preventDefault()}
        onKeyPress={e => { if (e.key == "Enter" || e.keyCode == 32) { this.sendAction(); }}}>
        <span>This is not my car. Try again.</span>
        {
          answer.verificationStatus &&
            <i className={`material-icons ${answer.verificationStatus}`}>{answer.verificationStatus}</i>
        }
      </button>
    );
  }
}

function stateToProps(state, props) {
  return {
  };
}

const dispatchToProps = {
  clearVehicleData
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputVehicleClear);
