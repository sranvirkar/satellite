import React, { Component } from "react";
import { connect } from "react-redux";
import InputAnswerGroupsRadio from "components/app-shared/InputAnswerGroupsRadio";
import { clearAnswer } from "redux/actions/orm/Answer";

class InputPolicyholderAddress extends Component {
  // Show distinct addresses only - if two or more vehicles have the same address, only want to show the address once only
  filterOptions = (options) => {
    const distinctOptions = [];
    const map = new Map();
    for (const option of options) {
      if (!map.has(option.label.answers.vehicleAddress)) {
        map.set(option.label.answers.vehicleAddress, true);
        distinctOptions.push(option);
      }
    }
    return distinctOptions;
  }

  // Clears the answer for the field "phAddressSelection", which will also clear the rest of the address fields
  handleClear = (event) => {
    const { answer, clearAnswer } = this.props;
    clearAnswer(answer.id);
  }

  render() {
    const { answer } = this.props;
    
    const Option = (props) => (
      <React.Fragment>
        <div className="customRadio" />
        <span>{props.label.answers.vehicleAddress}</span>
      </React.Fragment>
    )
    const outerClassName = "InputPolicyHolderAddress";
    const innerClassName = "Option";
    return (
      <div className="InputPolicyholderAddress-container">
        <InputAnswerGroupsRadio filterOptions={this.filterOptions} outerClassName={outerClassName} innerClassName={innerClassName} {...this.props}>
          <Option />
        </InputAnswerGroupsRadio>
        <button
          className="clearButton"
          onClick={this.handleClear}
          disabled={answer.disabled}>
          Clear
        </button>
      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
  }
}

const dispatchToProps = {
  clearAnswer
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputPolicyholderAddress);
