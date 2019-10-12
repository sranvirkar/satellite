import React, { Component } from "react";
import { connect } from "react-redux";

import TabGroup from "components/app-shared/TabGroup";
import Tab from "components/app-shared/TabGroup/Tab";
import FormFieldGroup from "components/app-shared/FormFieldGroup";
import FormContainer from "components/app-shared/FormContainer";
import { fieldByName, answerByFieldNameAndAnswerGroup } from "redux/selectors";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { getSubFields } from "redux/selectors/Field";
import { deleteAnswerGroup } from "redux/actions/orm/AnswerGroup";

class AddNewPolicyholder extends Component {
  changePolicyholderType = (tabLabel) => {
    const { answerGroupId, upsertAnswerForFieldName } = this.props;
    upsertAnswerForFieldName("phType", answerGroupId, { value: tabLabel });
  }

  render() {
    const { phTypeAnswer, policyholderField, answerGroupId, repeatableIndex } = this.props;
    return (
      <FormContainer
        mainElementStyleRule="AddNewPolicyholder"
        headerTitle="Add another policyholder"
        headerAction={() => this.props.removePolicyHolderModal(answerGroupId)}
        headerActionText="Remove">
        <TabGroup activeTab={phTypeAnswer.value}>
          <Tab afterHandleClick={this.changePolicyholderType} label="Person">
            <FormFieldGroup
              field={getSubFields(policyholderField)}
              answerGroupId={answerGroupId}
              repeatableIndex={repeatableIndex} />
          </Tab>
          {/*
            Uncomment below to re-enable Business type policyholder. Disabled in V1.
            Note that the following still needs to be done:
            - Validation: Only ONE business policyholder allowed (and no others)
            - Confirmation Modal: If changing from policyholder type "Person" to "Business", then all other policyholders must be removed.
          */}
          {/* <Tab afterHandleClick={this.changePolicyholderType} label="Business">
            <FormFieldGroup field={getSubFields(policyholderField)} answerGroupId={answerGroupId} repeatableIndex={repeatableIndex} />
          </Tab> */}
        </TabGroup>
      </FormContainer>
    );
  }
}

function stateToProps(state, props) {
  return {
    policyholderField: fieldByName(state, 'policyHolder'),
    phTypeAnswer: answerByFieldNameAndAnswerGroup(state, { fieldName: 'phType', answerGroup: props.answerGroupId })
  };
}

const dispatchToProps = {
  upsertAnswerForFieldName,
  deleteAnswerGroup
};

export default connect(
  stateToProps,
  dispatchToProps
)(AddNewPolicyholder);
