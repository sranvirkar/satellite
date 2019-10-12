import React, { Component } from "react";
import { connect } from "react-redux";
import { createAnswerGroupFromField, deletePolicyholderLinkedToDriver } from "redux/actions/orm/AnswerGroup";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import InputAnswerGroupsCheckbox from "../InputAnswerGroupsCheckbox";
import DriverPolicyholderCard from "components/app-shared/DriverPolicyholderCard";
import { fieldByName } from "redux/selectors";

import Modal from "components/app-global/Modal";
import DeleteDataModal from "components/app-shared/DeleteDataModal";

class InputDriverPolicyholders extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteModalIndex: undefined
    }
  }

  handleChange = (event) => {
    const {
      policyholderField,
      createAnswerGroupFromField,
      deletePolicyholderLinkedToDriver,
      upsertAnswerForFieldName
    } = this.props;
    const { deleteModalIndex } = this.state;

    const value = parseInt(event.target.value);
    if (event.target.checked) {
      // console.log('creating policyholder where driverPolicyholder is ' + value);
      const newPolicyholderAnswerGroupId = createAnswerGroupFromField(policyholderField);
      // console.log('created new policyholder answer group with id ' + newPolicyholderAnswerGroupId);
      // Update driverPolicyholder with driver answer group id, which will trigger updateLinkedPolicyholder
      upsertAnswerForFieldName("driverPolicyholder", newPolicyholderAnswerGroupId, { value });
    } else {

      // console.log('deleting policyholder where driverPolicyholder is ' + value);
      // deletePolicyholderLinkedToDriver(value); // suppress using modal instead
      this.setState({deleteModalIndex: value});
    }
  }

  render() {
    const {
      policyholderField,
      deletePolicyholderLinkedToDriver
    } = this.props;
    const { deleteModalIndex } = this.state;


    return (
      /*
        Added a new prop to InputCheckbox "noLabelElement".
        This will not render a label inside InputCheckbox - but will pass a new prop "labelHtmlFor" to the child props (in this case DriverPolicyholderCard)
        The child (DriverPolicyholderCard) should render the label instead inside it -> this allows us to put a label around the FormCard instead only and still link it to the input
        Without putting the FormFieldGroup in the label instead (which causes the issue where clicking on an empty space will deselect/close the DriverPolicyholderCard)
      */
      <React.Fragment>
        <InputAnswerGroupsCheckbox afterChange={this.handleChange} noLabelElement={true} {...this.props}>
          <DriverPolicyholderCard />
        </InputAnswerGroupsCheckbox>

        {
          Number.isInteger(deleteModalIndex) &&
          <Modal
            padding="false"
            exitUsingButton="true"
            exitUsingBackground="true"
            exitModalAction={() => {this.setState({deleteModalIndex: undefined})}}
            isSmall="true">

            <DeleteDataModal
              field={this.props.policyholderField}
              proceedAction={() => {
                deletePolicyholderLinkedToDriver(deleteModalIndex);
                this.setState({deleteModalIndex: undefined});
              }}
              cancelAction={() => {this.setState({deleteModalIndex: undefined})}}/>

          </Modal>
        }
        </React.Fragment>

    );
  }
}

function stateToProps(state, props) {
  return {
    policyholderField: fieldByName(state, 'policyHolder')
  };
}

const dispatchToProps = {
  createAnswerGroupFromField,
  deletePolicyholderLinkedToDriver,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputDriverPolicyholders);
