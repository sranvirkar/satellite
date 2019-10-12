import React, { Component } from "react";
import dropin from "braintree-web-drop-in";
import { connect } from "react-redux";
import { submitForm } from "redux/actions.js";
import { setCreditCardToken, getCustomerClientToken, processRenewalPayment } from "redux/actions/payment.js";
import { formTypeSelector } from "redux/selectors";
import { amountDueSelector } from "redux/selectors/Pricing";
import LoadingSpinner from "components/app-global/LoadingSpinner";
import AlertMessage from "components/app-shared/AlertMessage";

class BraintreePaymentForm extends Component {
  constructor(props) {
    super(props);

    /*
      On the Billing page in OSS, Braintree is potentially instantiated twice (to show the existing payment methods and potentially in the one time payment modal)
      Setting a different braintreeContainerId for existing payment methods instantiation will prevent the Braintree container elements from having the same id
      ---
      Setting a read-only class for existing payment methods will remove some of the Braintree styling (text and green borders/tick SVG) and also hide the 'Add another payment method' button
    */
    let className = "braintree-div";
    let braintreeContainerId = "braintree-dropin-container";
    if (props.readOnly) {
      className += " read-only";
      braintreeContainerId += "-read-only";
    }

    this.state = {
      dropinInstance: null,
      paymentError: false,
      className,
      braintreeContainerId
    }
  }

  async componentDidMount() {
    const { amountDue, formType, readOnly, oneTimePayment, policyId, getCustomerClientToken, onLoad, setButtonAction } = this.props;

    // Set the FormContainer footerAction method in the parent component
    if (setButtonAction) setButtonAction(this.handleSubmit);

    try {
      // For endorsement, one time payment and read-only (Billing page - payment methods section), we want to show the customer's existing payment methods, so pass customer client token when initialising braintree drop-in ui
      if (oneTimePayment || readOnly) {
        const clientToken = await getCustomerClientToken(policyId);
        await this.initialiseForm(clientToken);
      } else if (amountDue > 0) {
        // We only want to instantiate Braintree for payments (not refund or no-change in endorsements)
        switch (formType) {
          case "Quote":
            // TODO: need to switch this to production / use environment variable
            // There is no existing customer yet so just using Braintree tokenization key (see Braintree control panel)
            await this.initialiseForm("sandbox_fmzwp7hw_zt483pr93v879rwj");
            break;

          case "Endorsement":
            const clientToken = await getCustomerClientToken();
            await this.initialiseForm(clientToken);
            break;
        }
      }
      if (onLoad) onLoad();
    } catch (error) {
      console.error(error);
      // TODO: dispatch error here
    }
  }

  initialiseForm = async (authorization) => {
    try {
      const dropinInstance = await dropin.create({
        authorization,
        container: `#${this.state.braintreeContainerId}`,
        card: {
          cardholderName: {
            required: true
          },
          overrides: {
            styles: {
              input: {
                'font-size': '14px',
                'color': '#0A091A',
                'line-height': '20px',
                'border': '1px solid #DDDCE6',
                'border-radius': '4px'
              },
              ':focus': {
                'color': '#0A091A'
              }
            }
          }
        },
        translations: {
          cardholderNameLabel: 'Name on card',
          cardholderNamePlaceholder: 'Name on card',
          payWithCard: ''
        }
        // vaultManager: true // If enabled, allows them to delete a credit card
      });
      this.setState({
        dropinInstance
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject("Error: Initialise Braintree Drop-in UI: " + JSON.stringify(error));
    }
  }

  handlePaymentSuccess = () => {
    this.props.onPaymentSuccess();
  }

  handleSubmit = async () => {
    const { amountDue, oneTimePayment, policyId, invoice, setCreditCardToken, processRenewalPayment, submitForm, onPaymentSuccess } = this.props;
    const { dropinInstance } = this.state;

    // Hide error message on submit
    this.setState({
      paymentError: false
    });

    // This occurs during endorsement when there is a refund or no change to policy price
    if (!oneTimePayment && amountDue <= 0) return submitForm();

    try {
      const result = await dropinInstance.requestPaymentMethod();
      setCreditCardToken(result.nonce);
    } catch (error) {
      console.error("Error: Get Braintree Payment Method: " + JSON.stringify(error));
      // TODO: dispatch error here
    }

    try {
      if (oneTimePayment) {
        await processRenewalPayment(policyId, invoice);
        onPaymentSuccess();
      } else {
        await submitForm();
      }
    } catch (error) {
      // Show error message (allows user to retry payment)
      this.setState({
        paymentError: true
      });

      // If it is a technical error, there will be an error screen (an error action will be dispatched in either processRenewalPayment or submitForm) displayed to the user which blocks them from continuing
      // Else, they will be able to retry
    }
  }

  componentWillUnmount() {
    if (this.state.dropinInstance) this.state.dropinInstance.teardown();
  }

  render() {
    const { className, braintreeContainerId, dropinInstance, paymentError } = this.state;

    return (
      <div className={className}>
        {/* Using a "hide" CSS class because the DOM element needs to exist for the Braintree script to attach to on load */}
        <div id={braintreeContainerId} className={!dropinInstance ? "hide" : ""} />
        {
          !dropinInstance &&
          <LoadingSpinner />
        }
        {
          paymentError &&
          <AlertMessage
            title="Sorry, the transaction is unsuccessful."
            message="Please check the details and try again. If issue persists, then contact your bank or use another card."
          />
        }
      </div>
    );
  }
}

function stateToProps(state) {
  return {
    formType: formTypeSelector(state),
    amountDue: amountDueSelector(state)
  };
}

const dispatchToProps = {
  setCreditCardToken,
  submitForm,
  getCustomerClientToken,
  processRenewalPayment
};

export default connect(
  stateToProps,
  dispatchToProps
)(BraintreePaymentForm);
