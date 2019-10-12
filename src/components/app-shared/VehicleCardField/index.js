import React, { Component } from "react";
import { connect } from "react-redux";
import VehicleCard from "components/app-shared/VehicleCard";
import Modal from "components/app-global/Modal";
import DeleteDataModal from "components/app-shared/DeleteDataModal";
import { answerByFieldNameAndAnswerGroup, formTypeSelector } from "redux/selectors";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { deleteAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { clearVehicleData } from "redux/actions/vehicle";
import { SelectedTick, Pen, Trash } from "helpers/svgIcons";

class VehicleCardField extends Component {

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

    if (isCardOnly) {
      upsertAnswerForFieldName("vehicleIsCardOnly", answerGroupId, { value: false });
    }
  }

  render() {
    const {
      answerGroupId,
      isValid,
      isSummary,
      isVehicleSelected,
      isSelected,
      clearVehicleData,
      isEndorsement
    } = this.props;
    const { deleteModalIndex } = this.state;

    const endorsementActions = (answerGroupId) => <div className="endorsement-card-actions">
      {/*<span onClick={() => { window.alert('not built yet') }}><Pen /></span>*/}
      <span onClick={() => {this.setState({deleteModalIndex: answerGroupId})}}><Trash /></span>
      <SelectedTick styles={{marginTop: "12px"}} />
    </div>

    return (
      <div
        className="shared-VehicleCardField"
        onMouseUp={e => this.toggleShowingQuestions()}
        onTouchStart={e => this.toggleShowingQuestions()}
        onTouchEnd={e => e.preventDefault()} >
        {
          isValid &&
          !isVehicleSelected && (
            <label className={`poncho-body`}>
              We found this result
            </label>
          )
        }

        <VehicleCard
          answerGroupId={answerGroupId}
          isSelected={typeof isSelected === 'boolean' ? isSelected : isVehicleSelected}
          isCompact="false">
          {
            isEndorsement ?
            endorsementActions(answerGroupId) :

            (typeof isSelected === 'boolean' ? isSelected : isVehicleSelected) ? <SelectedTick styles={{marginTop: "12px"}} /> : null

          }
        </VehicleCard>

        {
          isVehicleSelected &&
          isSummary &&
          <p
            className={`not-my-car poncho-body`}
            onClick={() => {this.setState({deleteModalIndex: answerGroupId})}}>
            This is not my car
          </p>
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
              customActionName="Clear"
              field={{name: 'vehicle', deleteText: 'Are you sure you would like to remove this vehicle? The details you have entered will be lost and you will need to start again.'}}
              proceedAction={() => {
                // opting to just clear the vehicle with this action, instead of deleting it
                // this.props.deleteAnswerGroup(deleteModalIndex);
                clearVehicleData(deleteModalIndex);
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
    isEndorsement: formTypeSelector(state) === "Endorsement",
    isValid: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleIsSearched", answerGroup: props.answerGroupId}).value,
    isCardOnly: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleIsCardOnly", answerGroup: props.answerGroupId}).value,
    isVehicleSelected: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleIsSelected", answerGroup: props.answerGroupId}).value,
  };
}

const dispatchToProps = {
  deleteAnswerGroup,
  upsertAnswerForFieldName,
  clearVehicleData
};

export default connect(
  stateToProps,
  dispatchToProps
)(VehicleCardField);
