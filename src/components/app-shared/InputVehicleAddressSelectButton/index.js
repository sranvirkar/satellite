import React, { Component } from "react";
import { connect } from "react-redux";
import { getVehicleDetails } from "redux/actions/vehicle";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { answerByFieldNameAndAnswerGroup } from "redux/selectors";
import { underwritingDecline } from "redux/actions/underwriting";
import { approvedPostcodes } from "redux/mappings";

class InputVehicleAddressSelectButton extends Component {

  isAddressInCatchment = () => {
    const { vehiclePostcode, underwritingDecline, updateAnswer } = this.props;

    if (approvedPostcodes.includes(vehiclePostcode.value)) {
      updateAnswer(true);
    } else {
      console.log('decline bad postcode:', vehiclePostcode.value);

      underwritingDecline({
        header: "Unfortunately we cannot offer you insurance right now",
        message: <React.Fragment>
            <p>
              We appreciate you taking the time to get a quote from us. Unfortunately, as we are new to the market and don't service your area just yet, we are unable to offer you insurance at this time. To find insurance suited to your needs, you can contact the Insurance Council of Australia at <a href="https://www.insurancecouncil.com.au/">insurancecouncil.com.au/</a>
            </p>
            <p>
              Stay tuned while we expand our serviced areas.
            </p>
            <p>
              To get in touch with us, please complete our Contact Us form <a href="https://staging.ponchoinsurance.com.au/contact">here</a>.
            </p>
          </React.Fragment>
      });
    }
  }

  render() {
    const { field, answer, updateAnswer, vehicleAddressIsSearched } = this.props;

    return (
      <button
        className={`shared-InputVehicleAddressSelectButton poncho-btn-primary-reg`}
        type="button"
        tabIndex="0"
        disabled={!vehicleAddressIsSearched.value}
        onMouseUp={e => this.isAddressInCatchment()}
        onTouchStart={e => this.isAddressInCatchment()}
        onTouchEnd={e => e.preventDefault()}
        onKeyPress={e => { if (e.key == "Enter" || e.keyCode == 32) { this.isAddressInCatchment() }}}>
        <span>Yes, this is my address</span>
      </button>
    );
  }
}

function stateToProps(state, props) {
  return {
    vehicleAddressIsSearched: answerByFieldNameAndAnswerGroup(state, { fieldName: 'vehicleAddressIsSearched', answerGroup: props.answerGroupId }),
    vehiclePostcode: answerByFieldNameAndAnswerGroup(state, { fieldName: 'vehiclePostcode', answerGroup: props.answerGroupId })
  };
}

const dispatchToProps = {
  getVehicleDetails,
  upsertAnswerForFieldName,
  underwritingDecline
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputVehicleAddressSelectButton);
