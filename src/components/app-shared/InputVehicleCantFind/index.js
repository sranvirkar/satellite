import React, { Component } from "react";
import { connect } from "react-redux";
import { underwritingDecline } from "redux/actions/underwriting";

class InputVehicleCantFind extends Component {
  sendAction() {
    const { underwritingDecline } = this.props;
    underwritingDecline({
      header: "Unfortunately we cannot offer you insurance right now",
      message: <React.Fragment>
          <p>
            We appreciate you taking the time to get a quote from us. Unfortunately, as we cannot find your car we are unable to offer you insurance at this time. To find insurance suited to your needs, you can contact the Insurance Council of Australia at <a href="https://www.insurancecouncil.com.au/">insurancecouncil.com.au/</a>
          </p>
          <p>
            To get in touch with us, please complete our Contact Us form <a href="https://staging.ponchoinsurance.com.au/contact">here</a>.
          </p>
        </React.Fragment>
    });
  }

  render() {
    const { field, answer } = this.props;

    return (
      <button
        className={`shared-InputVehicleCantFind poncho-btn-primary-reg white`}
        type="button"
        tabIndex="0"
        onMouseUp={e => this.sendAction()}
        onTouchStart={e => this.sendAction()}
        onTouchEnd={e => e.preventDefault()}
        onKeyPress={e => { if (e.key == "Enter" || e.keyCode == 32) { this.sendAction(); }}}>
        I can't find my car
      </button>
    );
  }
}

function stateToProps(state, props) {
  return {
  };
}

const dispatchToProps = {
  underwritingDecline
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputVehicleCantFind);
