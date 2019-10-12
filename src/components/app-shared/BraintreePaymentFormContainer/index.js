import React, { Component } from "react";
import { connect } from "react-redux";
import FormContainer from "components/app-shared/FormContainer";
import BraintreePaymentForm from "components/app-shared/BraintreePaymentForm";
import PriceBreakdown from "components/app-shared/PriceBreakdown";
import { amountDueSelector } from "redux/selectors/Pricing";
import { quotePolicyPriceSelector } from "redux/selectors/pricing/quote";
import { getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";

// Used for payment in quote and buy, and endorsement. Paying for overdue renewals/one time payment is in the OneTimePaymentModal component
class BraintreePaymentFormContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formLoaded: false,
      buttonAction: null,
      viewPriceBreakdown: false
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

  togglePriceBreakdown = () => {
    this.setState({
      viewPriceBreakdown: !this.state.viewPriceBreakdown
    });
  }

  roundedPrice = (number) => `${number.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  render() {
    const { amountDue, quotePrice, vehicleAnswerGroups } = this.props;
    const { formLoaded, buttonAction, viewPriceBreakdown } = this.state;

    let headerTitle;
    let footerText;

    // Set different headings and button text based on whether it is a payment, no change or refund (the last two only apply to endorsement)
    if (amountDue > 0) {
      headerTitle = "Purchase your policy";
      footerText = "Purchase policy";
    } else if (amountDue === 0) {
      headerTitle = "Your policy";
      footerText = "Confirm policy";
    } else {
      headerTitle = "Total refund";
      footerText = "Confirm policy";
    }

    return (
      <FormContainer
        headerTitle={headerTitle}
        footerText={formLoaded && footerText} // Don't show the footer button until the braintree form is loaded
        footerAction={buttonAction}
        mainElementStyleRule="BraintreePaymentFormContainer">
        <div className="payment-form">
          <BraintreePaymentForm setButtonAction={this.setButtonAction} onLoad={this.handleOnLoad} />
        </div>

        <div className="price-details">
          <div className="premium">
            <div>
              <h4 className="poncho-lead bold">Monthly premium</h4>
              <p className="poncho-body grey">Incl GST & Gov charges</p>
            </div>
            <div className="premium-price">{`$${this.roundedPrice(quotePrice.premiumPayable || 0)}/mo`}</div>
          </div>

          <button className="poncho-btn-primary-reg white wide" onClick={this.togglePriceBreakdown}>{`${viewPriceBreakdown ? "Hide" : "View"} price breakdown`}</button>
          {
            viewPriceBreakdown &&
            <PriceBreakdown
              breakdownObject={{
                "Vehicles:": vehicleAnswerGroups.length,
                "Monthly Premium:": `$${roundedPrice(quotePrice.premiumStreet || 0)}`,
                "Fire State Levy:": `$${roundedPrice(quotePrice.premiumFsl || 0)}`,
                "Goods and Services Tax:" : `$${roundedPrice(quotePrice.premiumGst || 0)}`,
                "Stamp Duty:": `$${roundedPrice(quotePrice.premiumStampDuty || 0)}`
              }}
            />
          }
        </div>
      </FormContainer>
    );
  }
}

function stateToProps(state) {
  return {
    vehicleAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'vehicle' }),
    amountDue: amountDueSelector(state),
    quotePrice: quotePolicyPriceSelector(state)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(BraintreePaymentFormContainer);
