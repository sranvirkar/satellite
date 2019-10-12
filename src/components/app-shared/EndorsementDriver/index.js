import React, { Component } from "react";
import { connect } from "react-redux";
import DriverCard from "components/app-shared/DriverCard";
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

class EndorsementDriver extends Component {

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
    this.props.upsertAnswerForFieldName("driverIsCardOnly", agi, {value: ''});
    this.setState({editingAnswerGroupIds: [...this.state.editingAnswerGroupIds, agi]})
  }

  cancelEditingAnswerGroup = (agi) => {
    this.setState({editingAnswerGroupIds: this.state.editingAnswerGroupIds.filter(id => id !==  agi)})
  }

  render() {
    const { driverAnswerGroups, nestedFields, deleteAnswerGroup } = this.props;
    const { editingAnswerGroupIds, deleteModalIndex } = this.state;

    const endorsementActions = (answerGroupId) => <div className="endorsement-card-actions">
      <span onClick={() => this.editAnswerGroup(answerGroupId)}><Pen /></span>
      <span onClick={() => this.setState({ deleteModalIndex: answerGroupId})}><Trash /></span>
      <SelectedTick styles={{marginTop: "12px"}} />
    </div>

    return (
      <ul className="shared-EndorsementDriver">
        {
          driverAnswerGroups.map((driver, key) => (
            <li key={key}>
              {
                editingAnswerGroupIds.includes(driver.id) ?
                <React.Fragment>

                  <FormFieldGroup
                    field={nestedFields}
                    answerGroupId={driver.id}
                    repeatableIndex={key} />

                  <div className="endorsement-footer-actions">
                    <button
                      className="poncho-btn-primary-reg white"
                      onClick={() => this.setState({ deleteModalIndex: driver.id})}>
                      Delete
                    </button>
                    <button
                      className="poncho-btn-primary-reg"
                      onClick={() => this.cancelEditingAnswerGroup(driver.id)}>
                      Collapse
                    </button>
                  </div>

                </React.Fragment>:

                <DriverCard
                  answerGroupId={driver.id}
                  isSelected={false}
                  isCompact={false}>
                  {endorsementActions(driver.id)}
                </DriverCard>
              }
            </li>
          ))
        }

        <button
          id="add-group"
          className="poncho-btn-primary-reg white wide"
          type="button"
          onClick={this.handleAddFieldGroup}>
          + Add another Driver
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
              field={{name: 'driver', deleteText: 'Are you sure you would like to remove this driver? The details you have entered will be lost and you will need to start again.'}}
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
    driverAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'driver' }),
    nestedFields: getFieldByName(state, 'driver')
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
)(EndorsementDriver);
