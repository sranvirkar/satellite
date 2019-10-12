import React, { Component } from "react";
import { connect } from "react-redux";
import { formTypeSelector } from "redux/selectors";
import DriverCard from "components/app-shared/DriverCard";
import Modal from "components/app-global/Modal";
import DeleteDataModal from "components/app-shared/DeleteDataModal";
import { Pen, Trash, SelectedTick } from "helpers/svgIcons";
import { answerByFieldNameAndAnswerGroup } from "redux/selectors";
import { currentSectionUrlParamSelector } from "redux/selectors";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { deleteAnswerGroup } from "redux/actions/orm/AnswerGroup";
import moment from 'moment';

class DriverCardField extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deleteModalIndex: undefined
    }
  }

  toggleShowingQuestions() {
    const {
      isCardOnly,
      upsertAnswerForFieldName,
      answerGroupId,
    } = this.props;

    if (isCardOnly.value) {
      upsertAnswerForFieldName("driverIsCardOnly", answerGroupId, { value: false });
    }
  }

  render() {
    const {
      answerGroupId,
      children,
      isSelected,
      clickable, // can probably be refactored out (used in driver section) FormField
      isCompact,
      isEndorsement,
      currentSectionUrlParam,
      viewPolicyPage // can probably be refactored out (used in oss/viewPolicyPage)
    } = this.props;
    const { deleteModalIndex } = this.state;

    const endorsementActions = (answerGroupId) => <div className="endorsement-card-actions">
      {/*<span onClick={() => { window.alert('not built yet') }}><Pen /></span>*/}
      <span onClick={() => {this.setState({deleteModalIndex: answerGroupId})}}><Trash /></span>
      <SelectedTick styles={{marginTop: "12px"}} />
    </div>

    return (
      <div
        className={`shared-DriverCardField`}
        onMouseUp={e => { if (clickable) { this.toggleShowingQuestions()}} }
        onTouchStart={e => { if (clickable) { this.toggleShowingQuestions()}} }
        onTouchEnd={e => { if (clickable) { e.preventDefault()}} } >

        <DriverCard
          answerGroupId={answerGroupId}
          isSelected={isSelected}
          isCompact={isCompact}
          viewPolicyPage={viewPolicyPage}>
            {
              isEndorsement && currentSectionUrlParam == "edit-policy" ?
              endorsementActions(answerGroupId) :
              isSelected ? <SelectedTick styles={{marginTop: "12px"}} /> : null
            }
        </DriverCard>

        {
          Number.isInteger(deleteModalIndex) &&
          <Modal
            padding="false"
            exitUsingButton="true"
            exitUsingBackground="true"
            exitModalAction={() => {this.setState({deleteModalIndex: undefined})}}
            isSmall="true">

            <DeleteDataModal
              customActionName="Clear"
              field={{name: 'driver', deleteText: 'Are you sure you would like to remove this driver? The details you have entered will be lost and you will need to start again.'}}
              proceedAction={() => {
                // opting to just clear the vehicle with this action, instead of deleting it
                this.props.deleteAnswerGroup(deleteModalIndex);
                // clearVehicleData(deleteModalIndex);
                this.setState({deleteModalIndex: undefined});
              }}
              cancelAction={() => {this.setState({deleteModalIndex: undefined})}}/>

          </Modal>
        }

      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
    currentSectionUrlParam: currentSectionUrlParamSelector(state),
    isEndorsement: formTypeSelector(state) === "Endorsement",
    isCardOnly: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverIsCardOnly", answerGroup: props.answerGroupId}),
  };
}

const dispatchToProps = {
  deleteAnswerGroup,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(DriverCardField);
