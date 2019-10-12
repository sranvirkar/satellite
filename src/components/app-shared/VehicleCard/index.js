import React, { Component } from "react";
import { connect } from "react-redux";
import { answerByFieldNameAndAnswerGroup } from "redux/selectors";
import FormCard from "components/app-shared/FormCard";
import { SelectedTick, Car, Car2 } from "helpers/svgIcons";

class VehicleCard extends Component {

  render() {
    const {
      children,
      yearAnswerModel,
      makeAnswerModel,
      familyAnswerModel,
      styleAnswerModel,
      vehicleLicensePlateAnswerModel,
      isSelected,
      answerGroupId
    } = this.props;

    const captions = <ul>
      <li>
        <Car2 />
        <span className="poncho-body grey short">{styleAnswerModel && styleAnswerModel.value}</span>
        <span className="poncho-body grey short uppercase">{` (${vehicleLicensePlateAnswerModel && vehicleLicensePlateAnswerModel.value})`}</span>
      </li>
    </ul>

    return (
      <FormCard
        isSelected={isSelected}
        svgIcon={Car}
        title={`${yearAnswerModel && yearAnswerModel.value} ${makeAnswerModel && makeAnswerModel.value} ${familyAnswerModel && familyAnswerModel.value}`}
        captionsComponents={captions}
        isCompact="false">
        {
          isSelected && !children ?
          <SelectedTick styles={{marginTop: "12px"}} /> :
          children
        }
      </FormCard>
    );
  }
}

function stateToProps(state, props) {
  return {
    yearAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleYear", answerGroup: props.answerGroupId}),
    makeAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleMakeLabel", answerGroup: props.answerGroupId}),
    familyAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleFamily", answerGroup: props.answerGroupId}),
    styleAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleStyle", answerGroup: props.answerGroupId}),
    vehicleLicensePlateAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "vehicleLicensePlate", answerGroup: props.answerGroupId}),
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(VehicleCard);
