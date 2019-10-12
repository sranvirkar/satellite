import React, { Component } from "react";
import Bill from "./Bill";
import moment from "moment";
import { getPolicyStatus } from "redux/utils";

class Bills extends Component {
  // If policy has lapsed then invoice settlementStatus becomes "settled" but settlementType becomes "writtenOff" so check for both
  isOverdue = (invoice) => (invoice.dueTimestamp < moment().format('x') && (invoice.settlementStatus === "outstanding" || invoice.settlementType === "writtenOff"));

  render() {
    const { policy, openOneTimePaymentModal } = this.props;
    const invoices = policy.invoices;
    const isLapsed = policy.status === "lapse";
    
    /*
      Logic here is based on the below
      ---
      Rendering transactions by looking at the payments array on each invoice (itself from the invoices array on the policy), as we want to show failed payments along with successful payments
      There should be four scenarios (corresponds to the if-else statements below):
      1. One payment and invoice is not outstanding
        - Successful payment on the first attempt
        - Should show Download PDF link
      2. More than one payment and invoice is not outstanding
        - All payments except the last payment are failed payments
        - Only the successful payment should have the Download PDF link, the failed payments should not have anything
      3. At least one payment and invoice is outstanding
        - All payments are failed payments
        - Only want to show the 'Pay' button on the most recent failed payment (which would be the last one in the array) if the policy is in grace (not lapsed)
        - 'Pay' button should open the one time payment modal
      4. No payments
        - If not overdue then ignore (it is an upcoming renewal)
        - Else this should only happen during testing when an overdue policy is created (by choosing a policy start date in the past). In this case, it is a failed payment attempted on the invoice due date.
    */

    let bills = [];

    invoices.forEach(invoice => {
      if (invoice.payments.length === 1 && !this.isOverdue(invoice)) {
        bills.push(<Bill key={invoice.locator} isFailedPayment={false} paymentTimestamp={invoice.payments[0].postedTimestamp} invoice={invoice} />);
      } else if (invoice.payments.length && !this.isOverdue(invoice)) {
        invoice.payments.forEach((payment, index, payments) => {
          bills.push(<Bill key={invoice.locator} isFailedPayment={index + 1 !== payments.length} paymentTimestamp={invoice.payments[index].postedTimestamp} invoice={invoice} />);
        });
      } else if (invoice.payments.length && this.isOverdue(invoice)) {
        invoice.payments.forEach((payment, index, payments) => {
          bills.push(<Bill key={invoice.locator} isFailedPayment={true} paymentTimestamp={invoice.payments[index].postedTimestamp} openOneTimePaymentModal={isLapsed ? null : (index + 1 === payments.length ? openOneTimePaymentModal : null)} invoice={invoice} />);
        });
      } else {
        if (this.isOverdue(invoice)) bills.push(<Bill key={invoice.locator} isFailedPayment={true} paymentTimestamp={invoice.dueTimestamp} openOneTimePaymentModal={isLapsed ? null : openOneTimePaymentModal} invoice={invoice} />);
      }
    })

    return (
      <ul className="Bills">
        { bills }
      </ul>
    )
  }
}

export default Bills;
