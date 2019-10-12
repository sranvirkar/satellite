import React, { Component } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import DriverCardField from "components/app-shared/DriverCardField";
import FormFieldGroup from "components/app-shared/FormFieldGroup";
import { fieldByName, answerByMatchSelector } from "redux/selectors";
import { answerByFieldNameAndAnswerGroup } from "redux/selectors";
import { getSubFields } from "redux/selectors/Field";
import FormCard from "components/app-shared/FormCard";
import { Female, Male, SelectedTick } from "helpers/svgIcons";
import moment from 'moment';

class DriverPolicyholderCard extends Component {
  // constructor(props) {
  //   super(props);
  //
  //   this.state = {
  //     preSelected: props.isSelected
  //   }
  // }
  render() {
    const {
      label,
      isSelected,
      policyholderField,
      driverPolicyholderAnswer,
      driverDobAnswerModel,
      driverFirstNameAnswerModel,
      driverLastNameAnswerModel,
      driverGenderAnswerModel,
      policyholderAddressModel,
      repeatableIndex,
      labelHtmlFor
    } = this.props;

    // const { preSelected } = this.state;

    const captions = () => {
      return <ul>
        <li>
          <i className="material-icons">calendar_today</i>
          <span className="poncho-body grey short">{driverDobAnswerModel && moment(driverDobAnswerModel.value).format("DD MMMM YYYY")}</span>
        </li>
        {
          policyholderAddressModel &&
          <li>
            <i className="material-icons">calendar_today</i>
            <span className="poncho-body grey short">{policyholderAddressModel.value}</span>
          </li>
        }
      </ul>
    }

    return (
      <React.Fragment>
        <label htmlFor={labelHtmlFor}>
          <FormCard
            isSelected={isSelected}
            svgIcon={driverGenderAnswerModel && driverGenderAnswerModel.value == "Female" ? Female : Male}
            title={`${driverFirstNameAnswerModel && driverFirstNameAnswerModel.value} ${driverLastNameAnswerModel && driverLastNameAnswerModel.value}`}
            captionsComponents={captions()}
            isCompact="false"
            styles={`mobile-compact shared-DriverPolicyholderCard ${isSelected && driverPolicyholderAnswer ? 'has-footer' : ""}`}>
            {
              isSelected ? <SelectedTick styles={{ marginTop: "12px" }} /> : null
            }
          </FormCard>
        </label>
        {
          isSelected &&
          driverPolicyholderAnswer &&
          <div className="driver-to-ph-questions">
            <div className="border">
              <FormFieldGroup
                field={getSubFields(policyholderField)}
                answerGroupId={driverPolicyholderAnswer.answerGroup}
                repeatableIndex={repeatableIndex} />
            </div>
          </div>
        }
      </React.Fragment>
    );
  }
}

function stateToProps(state, props) {
  return {
    policyholderField: fieldByName(state, 'policyHolder'),
    driverPolicyholderAnswer: answerByMatchSelector(state, { fieldName: "driverPolicyholder", value: props.label.id }),
    policyholderAddressModel: null,

    driverDobAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverDob", answerGroup: props.label.id}),
    driverFirstNameAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverFirstName", answerGroup: props.label.id}),
    driverLastNameAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverLastName", answerGroup: props.label.id}),
    driverGenderAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverGender", answerGroup: props.label.id}),
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(DriverPolicyholderCard);
