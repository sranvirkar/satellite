import React, { Component } from "react";
import { connect } from "react-redux";
import { getVehicleDetails } from "redux/actions/vehicle";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";

class InputVehicleSelectButton extends Component {

  sendAction() {
    const { answerGroupId, getVehicleDetails, updateAnswer, upsertAnswerForFieldName } = this.props;
    updateAnswer(true);
    // upsertAnswerForFieldName("vehicleIsShowingDetailsFields", answerGroupId, { value: true });
  }

  render() {
    const { field, answer } = this.props;

    return (
      <button
        className={`shared-InputVehicleSelectButton poncho-btn-primary-reg`}
        type="button"
        tabIndex="0"
        onMouseUp={e => this.sendAction()}
        onTouchStart={e => this.sendAction()}
        onTouchEnd={e => e.preventDefault()}
        onKeyPress={e => { if (e.key == "Enter" || e.keyCode == 32) { this.sendAction(); }}}>

        <span>Yes, this is my car</span>
      </button>
    );
  }
}

function stateToProps(state, props) {
  return {
  };
}

const dispatchToProps = {
  getVehicleDetails,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputVehicleSelectButton);
