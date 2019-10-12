import React, { Component } from "react";
import moment from "moment";

export default class Bill extends Component {
  render() {
    const { invoice, isFailedPayment, paymentTimestamp, openOneTimePaymentModal } = this.props;

    return (
      <li className="Bill">
        <i className="material-icons">file_copy</i>

        <div className="document-details">
          <p className="poncho-body">${invoice.totalDue}</p>
          <p className="poncho-caption grey">
            {
              isFailedPayment ?
              <span><span className="poncho-caption red">Failed payment</span> on {moment(parseInt(paymentTimestamp)).format('DD/M/YY')}</span> 
              :
              <span>Paid on {moment(parseInt(paymentTimestamp)).format('DD/M/YY')}</span>
            }
          </p>
        </div>

        {
          openOneTimePaymentModal ?
          <button onClick={event => openOneTimePaymentModal(invoice)} className="pay-button poncho-caption red">Pay</button> 
          :
          (
            isFailedPayment ?
            null
            :
            invoice.documents &&
            invoice.documents[0] &&
            <a className="poncho-caption teal" href={invoice.documents[0].url}>Download <span className="uppercase">{invoice.documents[0].type}</span></a>
          )
        }
      </li>
    );
  }
}
