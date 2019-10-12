import React, { Component } from "react";
import { connect } from "react-redux";
import { answerGroups } from "../../../redux/selectors";
import InputCheckbox from "../InputCheckbox";

class InputAnswerGroupsCheckbox extends Component {

  handleChange = (event) => {
    const { answer, updateAnswer } = this.props;
    const value = parseInt(event.target.value);
    const currentValue = answer.value;
    let newValue;
    if (event.target.checked && !currentValue.includes(value)) {
      newValue = [...currentValue, value];
    } else {
      newValue = [...currentValue];
      newValue.splice(newValue.indexOf(value), 1);
    }
    updateAnswer(newValue);
  }

  render() {
    const { answerGroups } = this.props;

    const options = answerGroups.map(answerGroup => { 
      return { 
        label: answerGroup, 
        value: answerGroup.id 
      } 
    });

    return (
      <InputCheckbox options={options} handleChange={this.handleChange} {...this.props} />
    );
  }
}

function stateToProps(state, props) {
  return {
    answerGroups: answerGroups(state, props.field.repeatableGroup)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputAnswerGroupsCheckbox);
