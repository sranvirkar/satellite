import React, { Component } from "react";
import { connect } from "react-redux";
import { createRelationship, deleteRelationship } from "redux/actions/orm/AnswerGroup";
import InputAnswerGroupsCheckbox from "../InputAnswerGroupsCheckbox";
import InputToggle from "../InputToggle";
import VehicleCard from "components/app-shared/VehicleCard";
import DriverCard from "components/app-shared/DriverCard";
import { selectedAnswerGroups } from "redux/selectors";
import { updateAndGetPrice, shouldUpdateQuote } from "redux/actions";
import { processUnderwriting } from "redux/actions/underwriting";
import { currentSectionUrlParamSelector } from "redux/selectors";
import { getDriverAGIdsForVehicle } from "redux/selectors/AnswerGroups";

class InputRelationships extends Component {
  // InputCheckbox determines what is initially checked by looking at the answer.value
  // However, the value in this case is actually AnswerGroupAnswerGroup relationships (which are two-way)
  // I.e. AnswerGroupAnswerGroup relationships can be modified  by either the vehiclesDriven or vehicleDrivers fields
  // Therefore, on component mount, populate answer.value with the selected AnswerGroupAnswerGroup relationships so that the correct answer groups will be initially checked
  componentDidMount() {
    this.props.updateAnswer(this.props.selectedAnswerGroups);
  }

  handleChange = (event) => {
    const {
      createRelationship,
      deleteRelationship,
      answerGroupId,
      currentSectionUrlParam,
      updateAndGetPrice,
      shouldUpdateQuote,
      driversForThisVehicle,
      processUnderwriting
    } = this.props;

    const value = parseInt(event.target.value);
    if (event.target.checked) {
      createRelationship([answerGroupId, value]).then(() => {
        // after creating the relationship (between a driver and a vehicle)
        if (currentSectionUrlParam === "quote") {
          // if you're on the quote page, update the price
          // (no limits on creating relationships, don't need to check to see if we have vehicles with no drivers)

          updateAndGetPrice().then(() => {
            processUnderwriting(); // do this afterwards so that we know that 'update' has been done before uw
          });
        }
      });
    } else {

      deleteRelationship([answerGroupId, value]).then(() => {
        if (currentSectionUrlParam === "quote") {
          updateAndGetPrice();
        }
      });
    }
  }

  render() {
    const vehicleCard = VehicleCard;
    const driverCard = DriverCard;
    // const DriverToggle = (props) => <InputToggleNew label={`${props.label.answers.driverFirstName} ${props.label.answers.driverLastName}`} selected={props.selected} />;

    return (
      <InputAnswerGroupsCheckbox outerClassName="InputRelationships" innerClassName="shared-RelationshipCard" afterChange={this.handleChange} {...this.props}>
        {/* pass this.props down to the child component with {...this.props} */}

        {/* Using eval to get the Class, since passing a string will render an HTML element instead */}
        {/* render the VehicleCardField component (for example) by grabbing it from the qsp and rendering the correct class */}
        {
          React.createElement(eval(this.props.field.typeOptions.displayComponent))
        }
      </InputAnswerGroupsCheckbox>
    );
  }
}

function stateToProps(state, props) {
  return {
    currentSectionUrlParam: currentSectionUrlParamSelector(state),
    driversForThisVehicle: props.answerGroupId ? getDriverAGIdsForVehicle(state, props.answerGroupId) : null,
    selectedAnswerGroups: selectedAnswerGroups(state, props.answerGroupId)
  };
}

const dispatchToProps = {
  createRelationship,
  deleteRelationship,
  updateAndGetPrice,
  shouldUpdateQuote,
  processUnderwriting
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputRelationships);
