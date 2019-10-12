import React, { Component } from "react";
import { connect } from "react-redux";
// import LoadingSpinner from "components/app-global/LoadingSpinner";
import Modal from "components/app-global/Modal";
import FormContainer from "components/app-shared/FormContainer";
import YourPolicy from "./YourPolicy";
import Bills from "./Bills";
import OneTimePaymentModal from "./OneTimePaymentModal";
import moment from "moment";
import { policySummarySelector } from "redux/selectors";
import BraintreePaymentForm from "components/app-shared/BraintreePaymentForm";
import { getPoliciesAndPolicyholders } from "redux/actions/policy";

/*
  To get next policy due date -> getRenewals and check for next accepted renewal 
    - There should only be one, as they will be automatically issued on the due date (regardless of success/fail of payment) which will move them from renewals to invoices on the policy
  To check if there is an unpaid renewal -> check invoices on the policy and see if there is an overdue invoice with "outstanding" settlementStatus
*/
class Billing extends Component {
  constructor(props) {
    super(props);

    // Setting to true will open a modal to make a one time payment to pay off an overdue renewal
    this.state = {
      oneTimePaymentModal: false,
      oneTimePaymentInvoice: null
    }
  }

  formatDate = (dateInDDMMYYYY) => moment(dateInDDMMYYYY, "DD/MM/YYYY").format("DD/MM/YY");

  formatTimestamp = (timestamp) => moment(parseInt(timestamp)).format("DD/MM/YY");

  openOneTimePaymentModal = (invoice) => {
    this.setState({
      oneTimePaymentModal: true,
      oneTimePaymentInvoice: invoice
    })
  }

  closeOneTimePaymentModal = () => {
    this.setState({
      oneTimePaymentModal: false
    })
  }

  render() {
    const { policy } = this.props;
    return (
      <div className="Billing">
        <FormContainer>
          <YourPolicy
            price={policy.nextPaymentAmount}
            startCoverageDate={this.formatTimestamp(policy.policy.policyStartTimestamp)}
            endCoverageDate={this.formatTimestamp(policy.policy.policyEndTimestamp)}
            nextPaymentDate={this.formatDate(policy.nextPaymentDate)} />
        </FormContainer>

        <FormContainer headerTitle="Payment method">
          { !this.state.oneTimePaymentModal && <BraintreePaymentForm policyId={policy.policyId} readOnly={true} /> }
        </FormContainer>

        <FormContainer headerTitle="Latest bills">
          <Bills policy={policy} openOneTimePaymentModal={this.openOneTimePaymentModal} />
        </FormContainer>

        {
          this.state.oneTimePaymentModal && <OneTimePaymentModal closeModal={this.closeOneTimePaymentModal} policyId={policy.policyId} invoice={this.state.oneTimePaymentInvoice} />
        }
      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
    policy: policySummarySelector(state, props.policyId, props.timestamp)
  };
}

const dispatchToProps = {
  getPoliciesAndPolicyholders
};

export default connect(
  stateToProps,
  dispatchToProps
)(Billing);
