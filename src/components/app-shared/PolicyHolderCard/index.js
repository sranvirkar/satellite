import React, { Component } from "react";
import { connect } from "react-redux";
import FormCard from "components/app-shared/FormCard";
import { Male, SelectedTick, Calendar, Mail, Place } from "helpers/svgIcons";
import { answerByFieldNameAndAnswerGroup } from "redux/selectors";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import moment from 'moment';

class PolicyholderCard extends Component {

  render() {
    const {
      answerGroupId,
      firstNameAnswerModel,
      lastNameAnswerModel,
      dobAnswerModel,
      emailAnswerModel,
      addressAnswerModel,
      isSelected = true,
      children,
      viewPolicyPage
    } = this.props;

    {/*
      viewPolicyPage is a prop coming from PolicyDetails component - there are no answer groups created at this point so actual data is being passed in
      viewPolicyPage is a policyholder in this component - (data object e.g. { phFirstName: 'Bob', phLastName: 'Builder' })
    */}

    const captions = () => {
      return <ul>
        <li>
          <Calendar />
          <span className="poncho-body grey short">{
            viewPolicyPage ?
            moment(viewPolicyPage.phDob).format("DD MMMM YYYY") :
            dobAnswerModel && moment(dobAnswerModel.value).format("DD MMMM YYYY")}
          </span>
        </li>
        <li>
          <Mail />
          <span className="poncho-body grey short">{
            viewPolicyPage ?
            viewPolicyPage.phEmail :
            emailAnswerModel && emailAnswerModel.value}
          </span>
        </li>
        <li>
          <Place />
          <span className="poncho-body grey short">{
            viewPolicyPage ?
            viewPolicyPage.phPostalAddress :
            addressAnswerModel && addressAnswerModel.value}
          </span>
        </li>
      </ul>
    }

    return (
      <div
        className="shared-PolicyholderCard"
        onTouchEnd={e => e.preventDefault()} >

        <FormCard
          isSelected={isSelected}
          svgIcon={Male}
          title={viewPolicyPage ? `${viewPolicyPage.phFirstName} ${viewPolicyPage.phLastName}` : `${firstNameAnswerModel && firstNameAnswerModel.value} ${lastNameAnswerModel && lastNameAnswerModel.value}`}
          captionsComponents={captions()}
          isCompact="false"
          styles="pay-section-policyholder no-compact" >
            {
              isSelected && !children ?
              <SelectedTick styles={{marginTop: "12px"}} /> :
              children
            }
          </FormCard>
      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
    dobAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "phDob", answerGroup: props.answerGroupId}),
    firstNameAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "phFirstName", answerGroup: props.answerGroupId}),
    lastNameAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "phLastName", answerGroup: props.answerGroupId}),
    emailAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "phEmail", answerGroup: props.answerGroupId}),
    addressAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "phPostalAddress", answerGroup: props.answerGroupId}),
  };
}

const dispatchToProps = {
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(PolicyholderCard);
