import React, { Component } from "react";
import { connect } from "react-redux";
import { policyIdSelector, answerByFieldNameAndAnswerGroup, formTypeSelector } from "../../../redux/selectors.js";
import moment from "moment";
import { CircleTick } from "helpers/svgIcons";

class ConfirmationPage extends Component {
  render() {
    const { policyId, policyStartDateAnswer, formType } = this.props;
    let confirmationMessage;
    switch (formType) {
      case "Quote":
        confirmationMessage = (
          <React.Fragment>
            <p className="poncho-lead grey">An email receipt has been sent to you.</p>
            <p className="poncho-lead grey">Your new policy <span id="PolicyNumConfirm" className="poncho-lead yellow bold">PONCHO - {policyId}</span> will begin on the <span id="PolicyStartDateConfirm" className="poncho-lead yellow bold">{moment(policyStartDateAnswer.value).format('DD/MM/YY')}</span></p>
            <p className="poncho-lead grey">How did we do? Please provide any feedback <a href ={surveyUrl}>here</a></p>
          </React.Fragment>
        );
        break;

      case "Endorsement":
        // TODO
        break;

      case "Claims":
        confirmationMessage = (
          <React.Fragment>
            <p className="poncho-lead grey">Thank you, we have received your claim and will be in contact by end of next business day. Please call 1300 230 601 if you have any questions.</p>
            <p className="poncho-lead grey">How did we do? Please provide any feedback <a href ={surveyUrl}>here</a></p>
          </React.Fragment>
        );
        break;
    }

    return (
      <div className="ConfirmationPage">
        <CircleTick className="green-circle-tick" color="#68B34F" size="64" />
        { confirmationMessage }
      </div>
    );
  }
}

function stateToProps(state) {
  return {
    policyId: policyIdSelector(state),
    policyStartDateAnswer: answerByFieldNameAndAnswerGroup(state, { fieldName: "policyStartDate", answerGroup: undefined }),
    formType: formTypeSelector(state)
  };
}

const dispatchToProps = {};

export default connect(
  stateToProps,
  dispatchToProps
)(ConfirmationPage);
