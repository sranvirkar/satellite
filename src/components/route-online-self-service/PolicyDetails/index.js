import React, { Component } from "react";
import { connect } from "react-redux";
import { policySummarySelector } from "redux/selectors";
import VehicleSummary from "components/app-shared/VehicleSummary";
import FormContainer from "components/app-shared/FormContainer";
import PolicyholderCard from "components/app-shared/PolicyholderCard";

/*
  Trying to re-use existing components - but a big difference is that there are no answer groups created yet on the View Policy page in OSS (they are created when the user is actually editing a policy)

  For the VehicleSummary component, it is expecting an answerGroup with data in a property called 'answers' - this is simulated here
  Also passing a viewPolicyPage prop that contains driver data - this prop is passed onto DriverCardField and the data is read directly instead of trying to grab the answer by answer group id and field name
  A viewPolicyPage prop is also passed to the PolicyholderCard component containing policyholder data

  However, the data contains UNCONVERTED property names - that is, field names coming directly from Socotra. This is not always the same as the front-end field name (hence name and dataSourceFieldName in the Question Set Payload)
  The mapping should be done properly by reading from the question set payload - but it's not very straightforward (fields are very nested... as they are expecting to be parsed into Field models)
  So due to time constraints, I am hard coding the mapping here in driverMapping and policyholderMapping

  Marking this as a FUTURE FIX
*/
class PolicyDetails extends Component {

  addConvertedProperties = (obj, mapping) => {
    const convertedProperties = Object.keys(mapping).reduce((accumulator, currentValue) => { accumulator[currentValue] = obj[mapping[currentValue]]; return accumulator; }, {});
    return Object.assign({}, obj, convertedProperties);
  }

  render() {
    const { policy, policyId } = this.props;

    const driverMapping = {
      driverFirstName: "firstName",
      driverLastName: "lastName"
    }

    const policyholderMapping = {
      "phFirstName": "FirstName",
      "phLastName": "LastName",
      "phDob": "Date_of_Birth__c",
      "phEmail": "Email",
      "phPostalAddress": "Policy_Holder_Address__c"
    }

    return (
      <div className="PolicyDetails">
        {
          Object.values(policy.vehicles.byId).map((vehicle, index) =>
            <VehicleSummary
              summaryTypes={["oss"]}
              key={`key-${index}`}
              index={index}
              answerGroup={Object.assign({}, { answers: vehicle })}
              policyId={policyId}
              viewPolicyPage={vehicle.driver.map(driverId => this.addConvertedProperties(policy.drivers.byId[driverId], driverMapping))} />
          )
        }

        {
          policy.policyholders.map((policyholder, index) =>
            <FormContainer
              key={index}
              headerTitle={`Policy holder`}>
              <PolicyholderCard viewPolicyPage={this.addConvertedProperties(policyholder, policyholderMapping)} />
            </FormContainer>
          )
        }

      </div>
    )
  }
}

function stateToProps(state, props) {
  return {
    policy: policySummarySelector(state, props.policyId, props.timestamp)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(PolicyDetails);
