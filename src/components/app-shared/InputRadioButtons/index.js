import React, { Component } from "react";
import { connect } from "react-redux";
import InputRadio from "../InputRadio";
import { answerByFieldNameAndAnswerGroup } from "redux/selectors"
import Tooltip from "../Tooltip";

class InputRadioButtons extends Component {

  filterOptions = (options) => {
    const { field, claimsAnswer } = this.props;

    if (field.typeOptions && field.typeOptions.filter === 'driverClaims') {
      return options.filter(option => Number(option.value.charAt(0)) <= claimsAnswer.value.charAt(0));
    } else {
      return options;
    }

  }

  render() {
    const { field } = this.props;

    const options = field.values.map(value => {
      return typeof value == 'object' ? value : {
        label: value,
        value: value
      }
    });

    const Button = (props) => (
      <span style={props.helpText ? {"padding": "7px 28px 7px 10px"} : {}}>
        {props.label}
        {
          props.helpText ?
          <Tooltip uniqueId={props.id} helpText={props.helpText}/> :
          null
        }
      </span>
    );

    let direction;
    if (window.matchMedia('(max-width: 400px)').matches) {
      // If mobile view, show vertical options
      direction = "vertical";
    } else if (field.typeOptions && field.typeOptions.direction) {
      // Use direction in question set payload if exists
      direction = field.typeOptions.direction;
    } else {
      // Default is vertical
      direction = "vertical";
    }

    const outerClassName = ["InputRadioButtons", direction].filter(className => className).join(' ');
    const innerClassName = ["Button", direction].filter(className => className).join(' ');

    return (
      // outerClassName goes on <ul>, innerClassName goes on <li>
      // Selected options will have class name 'selected' on <li>
      <InputRadio outerClassName={outerClassName} innerClassName={innerClassName} options={options} filterOptions={this.filterOptions} {...this.props}>
        <Button />
      </InputRadio>
    );
  }
}

answerByFieldNameAndAnswerGroup

function stateToProps(state, props) {
  return {
    claimsAnswer: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverClaims", answerGroup: props.answerGroupId}),
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputRadioButtons);
