import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "components/app-global/Modal";
import FormContainer from "components/app-shared/FormContainer";
import MonthlyPremium from "components/app-shared/MonthlyPremium";
import PriceBreakdown from "components/app-shared/PriceBreakdown";
import { policySummarySelector } from "redux/selectors";
import { renewalByPolicyAndInvoiceId } from "redux/selectors/Renewal";
import BraintreePaymentForm from "components/app-shared/BraintreePaymentForm";
import { getPoliciesAndPolicyholders } from "redux/actions/policy";

class OneTimePaymentModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formLoaded: false,
      paymentSuccess: false
    }
  }

  closeModal = () => {
    if (this.state.paymentSuccess) {
      this.props.getPoliciesAndPolicyholders();
    } else {
      this.props.closeModal();
    }
  }

  handleOnLoad = () => {
    this.setState({
      formLoaded: true
    })
  }

  // Allow the child component (BraintreePaymentForm in this case) to set the footerAction method
  setButtonAction = (buttonAction) => {
    this.setState({
      buttonAction
    });
  }

  handlePaymentSuccess = () => {
    this.setState({
      paymentSuccess: true
    });
  }

  // NOTE: finding the stamp duty amount is a bit dodgy, but looks like the best way to do it for now (as it just returns stamp duty for every state)
  render() {
    const { invoice, policy, renewal } = this.props;
    const { paymentSuccess, formLoaded, buttonAction } = this.state;

    return (
      <Modal
        exitUsingButton={true}
        exitUsingBackground={false}
        exitModalAction={this.closeModal}
        isSmall={true}>
        <FormContainer
          headerTitle="Make a Payment"
          footerText={!paymentSuccess && formLoaded && "Make payment"} // Don't show the footer button until the braintree form is loaded
          footerAction={buttonAction}
          mainElementStyleRule="OneTimePaymentModal">
          {
            paymentSuccess ?
            <div>Payment was successful!</div>
            :
            <React.Fragment>
              <MonthlyPremium price={invoice.totalDue} />
              <PriceBreakdown
                breakdownObject={{
                  "Vehicles:": renewal.price.exposurePrices.length,
                  "Monthly Premium:": `$${renewal.price.newGrossPremium}`,
                  "Fire State Levy:": `$${renewal.price.taxGroups.find(taxGroup => taxGroup.name === "fsl").newAmount}`,
                  "Goods and Services Tax:" : `$${renewal.price.taxGroups.find(taxGroup => taxGroup.name === "gst").newAmount}`,
                  "Stamp Duty:": `$${renewal.price.taxGroups.find(taxGroup => RegExp('stamp_').test(taxGroup.name) && taxGroup.newAmount !== "0.00").newAmount}`
                }}
              />
              <BraintreePaymentForm setButtonAction={this.setButtonAction} onLoad={this.handleOnLoad} onPaymentSuccess={this.handlePaymentSuccess} policyId={policy.policyId} oneTimePayment={true} invoice={invoice} />
            </React.Fragment>
          }
        </FormContainer>
      </Modal>
    );
  }
}

function stateToProps(state, props) {
  return {
    policy: policySummarySelector(state, props.policyId, props.timestamp),
    renewal: renewalByPolicyAndInvoiceId(state, props.policyId, props.invoice.locator)
  };
}

const dispatchToProps = {
  getPoliciesAndPolicyholders
};

export default connect(
  stateToProps,
  dispatchToProps
)(OneTimePaymentModal);
