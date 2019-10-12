import React, { Component } from "react";
import FormFieldGroup from "../FormFieldGroup";
import FormContainer from "components/app-shared/FormContainer";

import moment from 'moment';
import FormField from "components/app-shared/FormField";
import AddNewPolicyholder from "components/app-shared/AddNewPolicyholder";

import Modal from "components/app-global/Modal";
import DeleteDataModal from "components/app-shared/DeleteDataModal";

import { connect } from "react-redux";
import { createAnswerGroupFromField, deleteAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { answerGroupIds, answerGroups, fieldByName, answerByFieldNameAndAnswerGroup } from "redux/selectors";
import { getAnswerGroupsByEntity } from "redux/selectors/AnswerGroups";

import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";

class FormFieldGroupPolicyHolder extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deleteModalIndex: undefined
    }
  }

  hideOtherFormContainersOfThisEntity = () => {
    const { field, answerGroupsWithThisEntity, upsertAnswerForFieldName } = this.props;

    answerGroupsWithThisEntity.forEach(ag => {
      upsertAnswerForFieldName(`${field.name}IsCardOnly`, ag.id, { value: true });
    })
  }

  handleAddFieldGroup = () => {
    const { field, createAnswerGroupFromField, upsertAnswerForFieldName } = this.props;
    this.hideOtherFormContainersOfThisEntity();
    const answerGroupId = createAnswerGroupFromField(field);
    upsertAnswerForFieldName("phType", answerGroupId, { value: "Person" });
  }

  handleRemoveFieldGroup = (answerGroupId) => {
    console.log('handleRemoveFieldGroup');
    this.setState({deleteModalIndex: answerGroupId});
    // this.props.deleteAnswerGroup(answerGroupId);
  }

  showAddGroupButton = () => {
    const { field, policyholders } = this.props;

    // Check for policyholder limitations
    // If policyholder is business, there can be no more policyholders
    if (field.entity === "policyholder" && policyholders.find(policyholder => policyholder.answers.phType === "Business")) return false;

    return Boolean(policyholders) && Boolean(policyholders.length < field.repeatableMax);
  }

  render() {
    const { field, policyholderField, answerGroupIds, driversAnswerGroups, driverPolicyholdersField, policyholders, driverPolicyholdersAnswer } = this.props;
    const { deleteModalIndex } = this.state;

    const offsetIndex = driverPolicyholdersAnswer === null || driverPolicyholdersAnswer.value === "" ? 0 : driverPolicyholdersAnswer.value.length;

    return (
      <ul className="shared-FormFieldGroupPolicyHolder">

        <FormField field={driverPolicyholdersField} />

        {
          policyholders.filter(policyholder =>
            policyholder.answers.driverPolicyholder === "").map(
              (policyholder, index) =>
                <AddNewPolicyholder
                  key={index + offsetIndex}
                  answerGroupId={policyholder.id}
                  repeatableIndex={index + offsetIndex}
                  removePolicyHolderModal={this.handleRemoveFieldGroup}
                  />
            )
        }

        {
          this.showAddGroupButton() &&
          <button
            id="add-group"
            className="poncho-btn-primary-reg white wide"
            type="button"
            onClick={this.handleAddFieldGroup}>
            + Add another policyholder
          </button>

        }
        <p className="poncho-caption grey">By adding another policyholder, you are consenting to each policyholder having viewing access to yours and their contact information in Online Self Service (E.g. full name, date of birth, mobile number, email address and postal address).</p>

        {
          Number.isInteger(deleteModalIndex) &&
          <Modal
            padding="false"
            exitUsingButton="true"
            exitUsingBackground="true"
            exitModalAction={() => {this.setState({deleteModalIndex: undefined})}}
            isSmall="true">

            <DeleteDataModal
              field={policyholderField}
              proceedAction={() => {
                this.props.deleteAnswerGroup(deleteModalIndex);
                this.setState({deleteModalIndex: undefined});
              }}
              cancelAction={() => {this.setState({deleteModalIndex: undefined})}}/>

          </Modal>
        }
      </ul>
    );
  }
}

function stateToProps(state, props) {
  return {
    answerGroupIds: answerGroupIds(state, props),
    driversAnswerGroups: answerGroups(state, 'driver'),
    policyholders: answerGroups(state, 'policyHolder'),
    policyholderField: fieldByName(state, 'policyHolder'),
    answerGroupsWithThisEntity: getAnswerGroupsByEntity(state, {entity: props.field.entity}),
    driverPolicyholdersField: fieldByName(state, 'driverPolicyholders').ref,
    driverPolicyholdersAnswer: answerByFieldNameAndAnswerGroup(state, { fieldName: 'driverPolicyholders', answerGroup: undefined })
  };
}

const dispatchToProps = {
  createAnswerGroupFromField,
  deleteAnswerGroup,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(FormFieldGroupPolicyHolder);
