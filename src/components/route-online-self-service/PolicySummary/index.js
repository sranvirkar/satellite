import React, { Component } from "react";
import { connect } from "react-redux";
import FormCard from "components/app-shared/FormCard";
import { Car } from "helpers/svgIcons";
import { Link } from "react-router-dom";
import { policySummarySelector } from "redux/selectors";

class PolicySummary extends Component {

  render() {
    const { policy, children, match, styles } = this.props;
    const captions = () => {
      return <ul>
        <li>
          <i className="material-icons">file_copy</i>
          <span className="poncho-body grey short">Policy: #{policy.policyId}</span>
        </li>
        <li>
          <i className="material-icons">calendar_today</i>
          <span className="poncho-body grey short">Start date: {policy.startDate}</span>
        </li>
        <li>
          <i className="material-icons">credit_card</i>
          <span className="poncho-body grey short">Next payment: {policy.nextPaymentDate} (${policy.nextPaymentAmount})</span>
        </li>
      </ul>
    }

    return (
      <div className="OnlineSelfService-PolicySummary">
        <FormCard
          isSelected={false}
          svgIcon={Car}
          policyStatus={policy.status}
          title={`Vehicle Policy`}
          captionsComponents={captions()}
          isCompact="false"
          styles={styles}>
         {children}
      </FormCard>

        <ul className="OnlineSelfService-PolicySummary_footer">
          <li>
            <i className="material-icons">directions_car</i>
            <span className="poncho-body grey short">Vehicles: {policy.vehicles.allIds.length}</span>
          </li>
          <li>
            <i className="material-icons">person</i>
            <span className="poncho-body grey short">Drivers: {policy.drivers.allIds.length}</span>
          </li>
          <li>
            <i className="material-icons">account_circle</i>
            <span className="poncho-body grey short">Policy holders: {policy.policyholders.length}</span>
          </li>
        </ul>
      </div>
    )
  }
}

// export default PolicySummary;
function stateToProps(state, props) {
  return {
    policy: policySummarySelector(state, props.policyId, props.timestamp)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(PolicySummary);
