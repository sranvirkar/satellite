import React, { Component } from "react";
import { connect } from "react-redux";
import { answerGroups } from "../../../redux/selectors";
import InputRadio from "../InputRadio";

class InputAnswerGroupsRadio extends Component {

  handleChange = (event) => {
    const { updateAnswer } = this.props;
    const value = parseInt(event.target.value);
    updateAnswer(value);
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
      <InputRadio options={options} handleChange={this.handleChange} {...this.props} />
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
)(InputAnswerGroupsRadio);
