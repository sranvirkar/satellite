import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import { getAllSections } from "redux/selectors/Section.js";

import Header from "components/route-free-quote/Header";
import FormNavigation from "components/app-shared/FormNavigation";
import FormRouter from "components/app-shared/FormRouter";
import UnderwritingDeclinePage from "components/app-shared/UnderwritingDeclinePage";
import ErrorPage from "components/app-shared/ErrorPage";
// import AsideInstantQuote from "./AsideInstantQuote";

import { underwritingSelector, globalErrorSelector } from "redux/selectors";

class FreeQuote extends Component {
  renderContent() {
    const { match, underwriting, error } = this.props;

    if (underwriting.declined) {
      return <UnderwritingDeclinePage />;
    } else if (error) {
      return <ErrorPage />;
    } else {
      const sectionUrlParam = match.params.sectionUrlParam;
      return (
        <React.Fragment>
          <div className="main-wrapper">
            <main id="main" className={sectionUrlParam}>
              <FormRouter path={`${reactRoute}/free-quote`} sectionUrlParam={sectionUrlParam} />
            </main>
          </div>

          <div id="sidebar-wrapper" className={`aside-wrapper ${sectionUrlParam}`}>
            <aside id="sidebar"/>
            {
              sectionUrlParam === "cars" ||
              sectionUrlParam === "drivers" ||
              sectionUrlParam === "policyholders" ||
              sectionUrlParam === "declarations" ?
              <div className="background" style={{ backgroundImage: `url(${reactRoute}/resource/poncho/assets/img/free-quote-aside.png)` }} /> :
              null
            }
          </div>
        </React.Fragment>
      )
    }
  }

  render() {
    const { underwriting, error } = this.props;

    return (
      <div className="Route-FreeQuote">
        <div className="header-wrapper">
          <Header />
          <FormNavigation disabled={underwriting.declined || error} />
        </div>
        <div className="content-wrapper">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
    sections: getAllSections(state),
    underwriting: underwritingSelector(state),
    error: globalErrorSelector(state)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(withRouter(FreeQuote));
