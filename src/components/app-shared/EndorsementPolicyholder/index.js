import React, { Component } from "react";
import { connect } from "react-redux";
import PolicyholderCard from "components/app-shared/PolicyholderCard";
import Modal from "components/app-global/Modal";
import DeleteDataModal from "components/app-shared/DeleteDataModal";
import { getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";
import { deleteAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { getFieldByName } from "redux/selectors/Field.js";
import { SelectedTick, Pen, Trash } from "helpers/svgIcons";
import FormFieldGroup from "components/app-shared/FormFieldGroup";

import { createAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { getNextAnswerGroupId } from "redux/utils";

class EndorsementPolicyholder extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deleteModalIndex: undefined,
      editingAnswerGroupIds: []
    }
  }

  handleAddFieldGroup = () => {
    const { nestedFields, createAnswerGroup } = this.props;

    const answerGroupId = getNextAnswerGroupId();

    createAnswerGroup({
      id: answerGroupId,
      field: nestedFields.id,
      fieldName: nestedFields.name,
      entity: nestedFields.entity,
      exposureLocator: null
    });

    this.setState({editingAnswerGroupIds: [...this.state.editingAnswerGroupIds, answerGroupId]})
  }

  editAnswerGroup = (agi) => {
    this.props.upsertAnswerForFieldName("phAddressSelection", agi, {disabled: true});
    this.props.upsertAnswerForFieldName("phEmail", agi, {disabled: true});
    this.props.upsertAnswerForFieldName("phPhone", agi, {disabled: true});

    this.setState({editingAnswerGroupIds: [...this.state.editingAnswerGroupIds, agi]})
  }

  cancelEditingAnswerGroup = (agi) => {
    this.setState({editingAnswerGroupIds: this.state.editingAnswerGroupIds.filter(id => id !==  agi)})
  }

  render() {
    const { policyholderAnswerGroups, nestedFields, deleteAnswerGroup } = this.props;
    const { editingAnswerGroupIds, deleteModalIndex } = this.state;

    const endorsementActions = (answerGroupId) => <div className="endorsement-card-actions">
      <span disabled={true} onClick={() => this.editAnswerGroup(answerGroupId)}><Pen /></span>
      <span onClick={() => this.setState({ deleteModalIndex: answerGroupId})}><Trash /></span>
      <SelectedTick styles={{marginTop: "12px"}} />
    </div>

    return (
      <ul className="shared-EndorsementPolicyholder">
        {
          policyholderAnswerGroups.map((policyholder, key) => (
            <li key={key}>
              {
                editingAnswerGroupIds.includes(policyholder.id) ?
                <React.Fragment>

                  <FormFieldGroup
                    field={nestedFields}
                    answerGroupId={policyholder.id}
                    repeatableIndex={key} />

                  <div className="endorsement-footer-actions">
                    <button
                      className="poncho-btn-primary-reg white"
                      onClick={() => this.setState({ deleteModalIndex: policyholder.id})}>
                      Delete
                    </button>
                    <button
                      className="poncho-btn-primary-reg"
                      onClick={() => this.cancelEditingAnswerGroup(policyholder.id)}>
                      Collapse
                    </button>
                  </div>

                </React.Fragment>:

                <div className="policyholder-card-wrapper">
                  <PolicyholderCard
                    answerGroupId={policyholder.id}
                    isSelected={false}
                    isCompact={false}>
                    {endorsementActions(policyholder.id)}
                  </PolicyholderCard>
                </div>
              }
            </li>
          ))
        }

        <button
          id="add-group"
          className="poncho-btn-primary-reg white wide"
          type="button"
          onClick={this.handleAddFieldGroup}>
          + Add another Policyholder
        </button>

        {
          Number.isInteger(deleteModalIndex) &&
          <Modal
            padding="false"
            exitUsingButton="true"
            exitUsingBackground="true"
            exitModalAction={() => {this.setState({deleteModalIndex: undefined})}}
            isSmall="true">

            <DeleteDataModal
              customActionName="Delete"
              field={{name: 'policyholder', deleteText: 'Are you sure you would like to remove this policyholder? The details you have entered will be lost and you will need to start again.'}}
              proceedAction={() => {
                deleteAnswerGroup(deleteModalIndex);
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
    policyholderAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'policyHolder' }),
    nestedFields: getFieldByName(state, 'policyHolder')
  };
}

const dispatchToProps = {
  upsertAnswerForFieldName,
  deleteAnswerGroup,
  createAnswerGroup
};

export default connect(
  stateToProps,
  dispatchToProps
)(EndorsementPolicyholder);
