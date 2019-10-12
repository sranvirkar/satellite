import React, { Component } from "react";
import { connect } from "react-redux";
import { formTypeSelector, underwritingSelector } from "redux/selectors";
import { getFirstPolicy } from "redux/selectors/Policy";
import { shouldUpdateQuote, shouldUpdateEndorsement } from "redux/actions";

class UnderwritingDeclinePage extends Component {

  renderDeclineHeading = () => {
    const { policy, formType } = this.props;
    switch (formType) {
      case "Quote":
        return "Unfortunately we cannot offer you insurance right now"

      case "Endorsement":
        return "Unfortunately we cannot offer you insurance right now";
    }
  }

  renderDeclineMessage = () => {
    const { policy, formType } = this.props;
    switch (formType) {
      case "Quote":
        return (
          <span> 
            We appreciate you taking the time to get a quote from us. Unfortunately, due to our underwriting criteria we are unable to offer you insurance at the current time. 
            To find insurance suited to your needs you can contact the Insurance Council of Australia 
            at <a href="https://www.insurancecouncil.com.au/">Insurancecouncil.com.au</a> To get in touch with us, 
            please complete our Contact Us form <a href="https://staging.ponchoinsurance.com.au/contact">here </a>
          </span>
          )

      case "Endorsement":
        return (
          <span> 
          Due to our underwriting criteria we are unable to offer you insurance at the current time for this change. To find insurance suited to your needs you can contact the Insurance Council of Australia at <a href="https://www.insurancecouncil.com.au/">Insurancecouncil.com.au</a> To get in touch with us, 
            please complete our Contact Us form <a href="https://staging.ponchoinsurance.com.au/contact">here </a>
          </span>
          )
    }
  }

  render() {
    const { underwriting } = this.props;
    console.log('underwriting', underwriting);

    return (
      <div className="UnderwritingDeclinePage">
        <div>
          <h2 className="poncho-h2">
            {
              underwriting.header ||
              this.renderDeclineHeading()
            }
          </h2>

          {
            underwriting.message ||
            <p className="poncho-lead grey">{this.renderDeclineMessage()}</p>
          }

        </div>
      </div>
    )
  }
}

function stateToProps(state, props) {
  return {
    underwriting: underwritingSelector(state),
    formType: formTypeSelector(state),
    policy: getFirstPolicy(state)
  };
}

const dispatchToProps = {
  shouldUpdateQuote,
  shouldUpdateEndorsement
};

export default connect(
  stateToProps,
  dispatchToProps
)(UnderwritingDeclinePage);
