import React, { Component } from "react";
import { connect } from "react-redux";

import { policySummarySelector } from "redux/selectors";
import { createEndorsementForm } from "redux/actions";
import FormNavigation from "components/app-shared/FormNavigation";
import ContactSidebar from "components/route-online-self-service/EditPolicy/ContactSidebar";
import FormRouter from "components/app-shared/FormRouter";
import LoadingSpinner from "components/app-global/LoadingSpinner";
import { Link } from "react-router-dom";
import { OSSBackArrow } from "helpers/svgIcons";
import moment from "moment";

class EditPolicy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true
    };
  }

  // Before displaying endorsement form, question set will be fetched and fields are prepopulated
  async componentDidMount() {
    await this.props.createEndorsementForm(this.props.match.params.id);
    this.setState({
      loading: false
    });
  }

  render() {
    const { match, policy, underwriting } = this.props;

    const sectionUrlParam = match.params.sectionUrlParam;

    return this.state.loading ?
      <LoadingSpinner /> :
      <React.Fragment>
        <FormNavigation />
        <div className="Route-OnlineSelfService-EditPolicy">
          <div className="main-wrapper">
            <main  id="main" className={sectionUrlParam}>
              <div>
                <h2 className="poncho-h2">{`Vehicle Policy: ${match.params.id}`}</h2>
                <ul className="metadata">
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
                <ul className="footer">
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

                <FormRouter
                  path={`${reactRoute}/oss/${match.params.id}/edit`}
                  sectionUrlParam={sectionUrlParam}
                  disableTitles={true} />

              </div>
            </main>
          </div>

          <div id="sidebar-wrapper" className={`aside-wrapper ${sectionUrlParam}`}>
            <aside id="sidebar"/>
          </div>
        </div>
      </React.Fragment>

  }
}

function stateToProps(state, props) {
  return {
    policy: policySummarySelector(state, props.match.params.id, false || moment().format('x'))
    // replace false with redux stored policy view date
  };
}

const dispatchToProps = {
  createEndorsementForm
};

export default connect(
  stateToProps,
  dispatchToProps
)(EditPolicy);
