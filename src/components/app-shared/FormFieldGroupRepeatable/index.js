import React, { Component } from "react";
import FormFieldGroup from "../FormFieldGroup";
import FormContainer from "components/app-shared/FormContainer";
import Modal from "components/app-global/Modal";
import DeleteDataModal from "components/app-shared/DeleteDataModal";
import uuid from "uuid";

import { connect } from "react-redux";
import { createAnswerGroup, deleteAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { answerGroupIds, answerGroups } from "redux/selectors";
import { getNextAnswerGroupId } from "redux/utils";
import { isFieldVisibleInThisAnswerGroup } from "redux/selectors/Field";
import { getAnswerGroupsByEntity } from "redux/selectors/AnswerGroups";
import { isShowingSupportLinks } from "redux/selectors/Section";

import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";

class FormFieldGroupRepeatable extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deleteModalIndex: undefined
    }
  }

  componentDidMount() {
    if (this.props.answerGroupIds.length <= 0) this.handleAddFieldGroup();
  }

  hideOtherFormContainersOfThisEntity = () => {
    const { field, answerGroupsWithThisEntity, upsertAnswerForFieldName } = this.props;

    answerGroupsWithThisEntity.forEach(ag => {
      upsertAnswerForFieldName(`${field.name}IsCardOnly`, ag.id, { value: 'true' });
    })
  }

  handleAddFieldGroup = () => {
    const { field, createAnswerGroup } = this.props;

    this.hideOtherFormContainersOfThisEntity();

    let additionalProps;
    switch (field.entity) {
      case "exposure":
        additionalProps = {
          exposureLocator: null
        };
        break;

      case "policyholder":
        additionalProps = {
          leadId: null,
          accountId: null,
          previousUpdateLeadPayload: null
        }
        break;

      default:
        additionalProps = {
          [`${field.name}Locator`]: {},
          [`${field.name}Id`]: uuid.v4()
        }
    }

    // TODO: move parameter into action... (just pass in field)?
    createAnswerGroup({
      id: getNextAnswerGroupId(),
      field: field.id,
      fieldName: field.name,
      entity: field.entity,
      ...additionalProps
    });
  }

  handleRemoveFieldGroup = (answerGroupId) => {
    this.setState({deleteModalIndex: answerGroupId});
    // this.props.deleteAnswerGroup(answerGroupId);
  }

  showAddGroupButton = () => {
    const { field, answerGroupIds, policyholders } = this.props;

    // Check for maximum number of repeatable groups as configured in JSON
    if (field.repeatableMax && answerGroupIds.length >= parseInt(field.repeatableMax)) return false;

    // Check for policyholder limitations
    // If policyholder is business, there can be no more policyholders
    if (field.entity === "policyholder" && policyholders.find(policyholder => policyholder.answers.phType === "Business")) return false;


    return true;
  }

  render() {
    const { field, answerGroupIds, isFieldVisibleInThisAnswerGroup, isShowingSupportLinks } = this.props;
    const { deleteModalIndex } = this.state;

    return isFieldVisibleInThisAnswerGroup ? (
      <ul className="shared-FormFieldGroupRepeatable">
        {
          answerGroupIds.map((answerGroupId, index) =>
            <FormContainer
              key={index}
              headerTitle={`${field.entityName} #${index + 1}`}
              headerActionText={answerGroupIds.length > 1 && "Remove"}
              headerAction={() => {this.handleRemoveFieldGroup(answerGroupId)}}
              >
              <div className="width-trick">
                <FormFieldGroup
                  field={field}
                  answerGroupId={answerGroupId}
                  repeatableIndex={index} />
              </div>
            </FormContainer>
          )
        }

        {
          isShowingSupportLinks ?
            (
              this.showAddGroupButton() &&
              <button
                id="add-group"
                className="poncho-btn-primary-reg white wide"
                type="button"
                onClick={this.handleAddFieldGroup}>
                + Add another {field.entityName.toLowerCase()}
              </button>
            )
           : ""
        }

        {
          Number.isInteger(deleteModalIndex) &&
          <Modal
            padding="false"
            exitUsingButton="true"
            exitUsingBackground="true"
            exitModalAction={() => {this.setState({deleteModalIndex: undefined})}}
            isSmall="true">

            <DeleteDataModal
              field={field}
              proceedAction={() => {
                this.props.deleteAnswerGroup(deleteModalIndex);
                this.setState({deleteModalIndex: undefined});
              }}
              cancelAction={() => {this.setState({deleteModalIndex: undefined})}}/>

          </Modal>
        }

      </ul>
    ) : null;
  }
}

function stateToProps(state, props) {
  return {
    answerGroupIds: answerGroupIds(state, props),
    policyholders: answerGroups(state, 'policyHolder'),
    isFieldVisibleInThisAnswerGroup: isFieldVisibleInThisAnswerGroup(state, {fieldId: props.field.id, answerGroup: props.answerGroupId}),
    answerGroupsWithThisEntity: getAnswerGroupsByEntity(state, {entity: props.field.entity}),
    isShowingSupportLinks: isShowingSupportLinks(state)
  };
}

const dispatchToProps = {
  createAnswerGroup,
  deleteAnswerGroup,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(FormFieldGroupRepeatable);
