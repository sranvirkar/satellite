import React, { Component } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";

import FormContainer from "components/app-shared/FormContainer";
import FormField from "components/app-shared/FormField";
import DriverCardField from "components/app-shared/DriverCardField";

import Modal from "components/app-global/Modal";
import DeleteDataModal from "components/app-shared/DeleteDataModal";

import Premium from "./Premium";
import Details from "./Details";
import Value from "./Value";
import Cover from "./Cover";

import { getDriverAGIdsForVehicle, getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";
import { deleteAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { navigateToRoute } from "redux/actions/navigation";
import { fieldByName } from "redux/selectors";
import { quoteVehiclePremiumSelector, quotePolicyPriceSelector } from "redux/selectors/pricing/quote";
import { endorsementVehiclePremiumSelector } from "redux/selectors/pricing/endorsement";
import { renewalVehiclePremiumSelector } from "redux/selectors/pricing/renewals";


class VehicleSummary extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deleteModalIndex: undefined
    }
  }

  render() {
    const {
      summaryTypes,
      index,
      answerGroup,
      drivers,
      quotePrice,
      vehicleDriversField,
      vehiclePerilsField,
      vehicleQuotePremium,
      vehicleEndorsementPremium,
      vehicleRenewalPremium,
      viewPolicyPage,
      vehicleField,
      vehicleAnswerGroups,
      navigateToRoute
    } = this.props;
    const { deleteModalIndex } = this.state;

    // rawOssDriversArray is a prop coming from PolicyDetails component - there are no answer groups created at this point so actual data is being passed in
    // rawOssDriversArray is an array of drivers for this vehicle in this component
    const rawOssDriversArray = viewPolicyPage || false;

    return (
      <div className="shared-VehicleSummary">
        <FormContainer
          className="shared-VehicleSummary"
          headerTitle={`Car #${index + 1}: ${answerGroup.answers.vehicleYear} ${answerGroup.answers.vehicleMake} ${answerGroup.answers.vehicleFamily}`}
          headerAction={
            summaryTypes.includes("quote") ?
              vehicleAnswerGroups.length > 1 ?
              () => this.setState({deleteModalIndex: answerGroup.id}) :
              undefined :
            () => navigateToRoute("cars")
          }
          headerActionText={
            summaryTypes.includes("quote") ?
              vehicleAnswerGroups.length > 1 ?
              "Remove" :
              undefined :
            "Edit"
          }>

          {
            summaryTypes.includes("quote") ||
            summaryTypes.includes("pay") ?
              <Premium premium={vehicleQuotePremium} />
            : null
          }

          {
            summaryTypes.includes("oss") ?
            <Premium
              premium={vehicleRenewalPremium} /> :
              null
          }

          {
            summaryTypes.includes("finalise") ?
            <Premium
              premium={vehicleEndorsementPremium} /> :
              null
          }


          <div className="summary-body">

            {
              summaryTypes.includes("pay") ||
              summaryTypes.includes("oss") ?
              <Details viewPolicyPage={rawOssDriversArray} answerGroup={answerGroup} /> :
              null
            }

            <Value value={answerGroup.answers.vehicleValue} />

            <Cover />

            {
              summaryTypes.includes("quote") ||
              summaryTypes.includes("finalise") ?
              <div className="vehicle-perils">
                <h5 className="poncho-body bold short">Your cover includes:</h5>
                <FormField field={vehiclePerilsField} answerGroupId={answerGroup.id} repeatableIndex={index} />
              </div> : null
            }

            <div className="vehicle-drivers">
                <h5 className="poncho-body bold short">
                  {
                    summaryTypes.includes("pay") ||
                    summaryTypes.includes("finalise") ||
                    summaryTypes.includes("oss") ?
                    `Drivers (${
                      summaryTypes.includes("oss") ?
                      rawOssDriversArray.length :
                      drivers.length})` :
                    `Select drivers to cover (${drivers.length})`
                  }
                </h5>

                {
                  summaryTypes.includes("oss") &&
                  rawOssDriversArray.map((driver, index) => <DriverCardField key={index} clickable={false} isCompact="true" viewPolicyPage={driver} />)
                }

                {
                  summaryTypes.includes("quote") &&
                  <FormField field={vehicleDriversField} answerGroupId={answerGroup.id} repeatableIndex={index} />
                }

                {
                  summaryTypes.includes("pay") &&
                  <span
                    className="drivers-edit-link"
                    onClick={() => navigateToRoute("drivers")}>Edit</span>
                }

                {
                  summaryTypes.includes("finalise") ||
                  summaryTypes.includes("pay") ?
                  drivers.map(driverAGId =>
                    <DriverCardField key={driverAGId} answerGroupId={driverAGId} DriverCardField="true" clickable="false" isCompact="true" />
                  ) : null
                }
            </div>
          </div>
        </FormContainer>

        {
          Number.isInteger(deleteModalIndex) &&
          <Modal
            padding="false"
            exitUsingButton="true"
            exitUsingBackground="true"
            exitModalAction={() => {this.setState({deleteModalIndex: undefined})}}
            isSmall="true">

            <DeleteDataModal
              field={vehicleField}
              proceedAction={() => {
                this.props.deleteAnswerGroup(deleteModalIndex);
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
    vehicleAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'vehicle' }),
    vehicleField: fieldByName(state, 'vehicle'),
    vehicleDriversField: fieldByName(state, 'vehicleDrivers'),
    vehiclePerilsField: fieldByName(state, 'vehiclePerils'),
    drivers: getDriverAGIdsForVehicle(state, props.answerGroup.id),
    quotePrice: quotePolicyPriceSelector(state),
    vehicleQuotePremium: quoteVehiclePremiumSelector(state, props.answerGroup.exposureCharacteristicsLocator), // CAUTION: DIFFERENT LOCATOR
    vehicleEndorsementPremium: endorsementVehiclePremiumSelector(state, props.answerGroup.exposureLocator), // CAUTION: DIFFERENT LOCATOR
    vehicleRenewalPremium: renewalVehiclePremiumSelector(state, props.policyId, props.answerGroup.answers.exposureLocator)
  };
}

const dispatchToProps = {
  navigateToRoute,
  deleteAnswerGroup
};

export default connect(
  stateToProps,
  dispatchToProps
)(VehicleSummary);
