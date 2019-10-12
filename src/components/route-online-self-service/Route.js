import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { getPoliciesAndPolicyholders } from "redux/actions/policy";

import Header from "components/route-online-self-service/Header";
import Dashboard from "components/route-online-self-service/Dashboard";
import EditPolicy from "components/route-online-self-service/EditPolicy";
import ViewPolicy from "components/route-online-self-service/ViewPolicy";
import Claims from "components/route-online-self-service/Claims";
import LoadingSpinner from "components/app-global/LoadingSpinner";
import ErrorPage from "components/app-shared/ErrorPage";
import ContactUs from "components/route-online-self-service/ContactUs";
import UnderwritingDeclinePage from "components/app-shared/UnderwritingDeclinePage";

import AlertMessage from "components/app-shared/AlertMessage";
import Modal from "components/app-global/Modal";


import { globalErrorSelector, loadingSelector, underwritingSelector } from "redux/selectors";

class OnlineSelfService extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      warningTime: 1000 * 60 * 14, // warning timeout
      signoutTime: 1000 * 60 * 15, // signout timeout
      showWarningModal: false,
      signoutTimeCounter: 60
    };
  }

  // Before displaying any OSS route, all policy data will be fetched
  async componentDidMount() {
    await this.props.getPoliciesAndPolicyholders();
    this.setState({
      loading: false
    });

    this.events = [
        'load',
        'mousemove',
        'mousedown',
        'click',
        'scroll',
        'keypress'
    ];

    // add event listeners to all possible events
    for (var i in this.events) {
        window.addEventListener(this.events[i], this.resetTimeout);
    }

    // Once component has been loaded start timeouts.
    this.setTimeout();
  }

  // clears the warning and logout timeouts
  clearTimeoutFunc = () => {
      if (this.warnTimeout) clearTimeout(this.warnTimeout);

      if (this.logoutTimeout) clearTimeout(this.logoutTimeout);     
  };

  // clears the signoutTimer interval
  clearIntervalFunc = () => {
      if(this.signoutTimerInterval) clearInterval(this.signoutTimerInterval);
  }

  // Added timeoute for warning and logout
  setTimeout = () => {
      this.warnTimeout = setTimeout(this.warn, this.state.warningTime);
      this.logoutTimeout = setTimeout(this.logout, this.state.signoutTime);
  };
  
  // Set Interval for signoutTimer which will update the counter
  setInterval = () => {
      this.setState({signoutTimeCounter: 60});
      this.signoutTimerInterval = setInterval(this.signoutTimer, 1000);
  }

  // On any event detection from user reset timeouts and intervals and remove warning modal
  resetTimeout = () => {
      console.log("resetTimeout fires.");
      this.clearTimeoutFunc();
      this.clearIntervalFunc();
      this.setTimeout();               
      this.state.showWarningModal ? this.setState({showWarningModal: false}) : "";  //Hide warning modal while reset timeout
  }; 

  // display warning modal and start sighout timer
  warn = () => {      
      this.setState({showWarningModal: true});
      this.setInterval();
  };

  // redirect to logout page
  logout = () => {
      window.location.href = `${reactRoute}/secur/logout.jsp?retUrl=${reactRoute}/s/login`;
  };

  // Update signoutTimerCounter
  signoutTimer = () => {    
    (this.state.signoutTimeCounter === 1) ? clearInterval(this.signoutTimerInterval) : "";

    this.setState((state) => ({
      signoutTimeCounter: state.signoutTimeCounter - 1
    }));
  }

  toggleWarningModal(){
    const { showWarningModal } = this.state;
    this.setState({showWarningModal: !showWarningModal});
  }

  render() {
    const { underwriting } = this.props;
    const { showWarningModal, signoutTimeCounter } = this.state;
    
    if (underwriting.declined) {
      return (
        <div className="Route-OnlineSelfService">
        <UnderwritingDeclinePage />;
      </div>
      )
    } else if (this.props.error) {
      return <ErrorPage />;
    } else {
      return (
        <div className="Route-OnlineSelfService">
          {/* FUTURE FIX: Can probably move this Header component to the global folder and use the same one for both q&b and oss */}
          <Header />

          {
            showWarningModal &&
            <Modal
              padding="false"
              exitUsingButton="false"
              exitUsingBackground={false}
              exitModalAction={this.toggleWarningModal}>
              <AlertMessage
                title="Session timeout"
                message = {`You will be logged out automatically in ${signoutTimeCounter} seconds.`}
              />
            </Modal>
          }
          
          {
            this.props.loading || this.state.loading ?
              <LoadingSpinner /> :
              <Switch>
                <Route path={`${reactRoute}/oss`} exact component={Dashboard} />
                {/* Moved to the top as it won't direct to claims for properly if it's lower */}
                <Route path={`${reactRoute}/oss/claims/:sectionUrlParam?`} component={Claims} />
                <Route path={`${reactRoute}/oss/contact/:sectionUrlParam?`} component={ContactUs} />
                <Route path={`${reactRoute}/oss/:id`} exact component={ViewPolicy} />
                <Route path={`${reactRoute}/oss/:id/edit/:sectionUrlParam?`} component={EditPolicy} />
              </Switch>
          }

        </div>
      );
    }
  }
}

function stateToProps(state, props) {
  return {
    error: globalErrorSelector(state),
    loading: loadingSelector(state, "GET_POLICIES_AND_POLICYHOLDERS"),
    underwriting: underwritingSelector(state)
  };
}

const dispatchToProps = {
  getPoliciesAndPolicyholders
};

export default connect(
  stateToProps,
  dispatchToProps
)(OnlineSelfService);
