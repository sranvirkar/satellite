import React, { Component } from "react";
import { Link } from "react-router-dom";
import FormRouter from "components/app-shared/FormRouter";
import { connect } from "react-redux";
import { getFirstPolicy } from "redux/selectors/Policy.js";
import { contactUsSubmittedSelector } from "redux/selectors";
import { currentSectionSelector } from "redux/selectors";
import { initialiseContact } from "helpers/navigation";
import { createContactForm } from "redux/actions";
class ContactUs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

   async componentDidMount() {
    try {
      await this.props.initialiseContact();
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
    return loading ?
      <p> Loading</p> :
      <div className="contact-us">

        <div>
          <div className="main-wrapper">
            <main>
              <FormRouter disableTitles={false} sectionUrlParam={match.params.sectionUrlParam} path={`${reactRoute}/oss/contact`}/>
             
            </main>
          </div>

          <div id="sidebar-wrapper" className="aside-wrapper">
            <aside>
              {/* userModel is a global variable exposed on the Visualforce page */}
              <h5 className="poncho-h5">Sales and Service Helpdesk</h5>
              <p className="poncho-body light-grey short">To mange your policy log into our <a href={`${reactRoute}/oss`}>Online Self Service.</a> Got Questions? Take a look at our <a href={`${reactRoute}/oss`}>FAQS</a> to see if the answer is there.</p>
              
              <p className="poncho-body light-grey short">Still got questions? You can reach us on:</p>
              <ul className="poncho-body light-grey social-media">
                <li>support@poncho.com.au</li>
                <li>@poncho_au</li>
                <li>@poncho_au</li>
                <li>@poncho_au</li>
              </ul>
              <h5 className="poncho-h5">Need to make a claim?</h5>
            <p className="poncho-body light-grey short">Head over to our <a href={`${reactRoute}/oss/claims/choosePolicy`}>Make a Claim</a> portal and we will guide you through the entire process</p>
            </aside>
            
          </div>
        </div>

      </div>
  }
}

function stateToProps(state, props) {
  return {
    policy: getFirstPolicy(state),
    contactUsSubmitted: contactUsSubmittedSelector(state),
    currentSection: currentSectionSelector(state)
  };
}

const dispatchToProps = {
  createContactForm,
  initialiseContact
};

export default connect(
  stateToProps,
  dispatchToProps
)(ContactUs);
