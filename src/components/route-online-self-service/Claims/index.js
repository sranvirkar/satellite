import React, { Component } from "react";
import { Link } from "react-router-dom";
import Header from "components/route-free-quote/Header";
import FormNavigation from "components/app-shared/FormNavigation";
import FormRouter from "components/app-shared/FormRouter";

import { connect } from "react-redux";
import { getFirstPolicy } from "redux/selectors/Policy.js";
import { claimSubmittedSelector, currentSectionSelector } from "redux/selectors";
import { createClaimsForm } from "redux/actions.js";
import { initialiseClaim } from "helpers/navigation";
import FormContainer from "components/app-shared/FormContainer";
class Claims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

   async componentDidMount() {
    try {
      //await this.props.getPolicies();
      await this.props.initialiseClaim();
      this.setState({
        loading:false
      })

    } catch (error) {
        console.log(error);
    }
  }

  render() {
    const { match } = this.props;
    const { loading } = this.state;

    const { policy, claimSubmitted, currentSection } = this.props;

    const sectionUrlParam = match.params.sectionUrlParam;

    return loading ?
      <p> Loading</p> :
      <div className="Route-OnlineSelfService-Claims">
        <FormNavigation />

        <div>
          <div className="main-wrapper">
            <main>
              <FormRouter disableTitles={false} sectionUrlParam={match.params.sectionUrlParam} path={`${reactRoute}/oss/claims`}/>
             
            </main>
          </div>

          <div id="sidebar-wrapper" className="aside-wrapper">
            <aside>
              {/* userModel is a global variable exposed on the Visualforce page */}
              <h5 className="poncho-h5">We're always here to help</h5>
              <p className="poncho-body light-grey short">To lodge your claim over the phone, please call <a href="tel:1300230601">1300 230 601</a>, alternatively you can lodge your claim by completing this online claim form.</p>
              
              <p className="poncho-body light-grey short">Don't forget if you need help you can always <Link to={`${reactRoute}/oss/contact/startPage`}>contact us</Link>.</p>
            </aside>
          </div>
        </div>

      </div>
  }
}

function stateToProps(state, props) {
  return {
    policy: getFirstPolicy(state),
    claimSubmitted: claimSubmittedSelector(state),
    currentSection: currentSectionSelector(state)
  };
}

const dispatchToProps = {
  createClaimsForm,
  initialiseClaim
};

export default connect(
  stateToProps,
  dispatchToProps
)(Claims);
