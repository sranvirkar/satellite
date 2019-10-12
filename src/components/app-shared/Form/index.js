import React, { Component } from "react";

import NavigationBanner from "./NavigationBanner";
import Section from "./Section";
import LoadingSpinner from "components/app-global/LoadingSpinner";

import { connect } from "react-redux";

import { getAllSectionsForPolicy } from "redux/selectors/Section.js";

class QuoteAndBuyForm extends Component {

  render() {
    const {
      policy,
      sections,
      sectionIndex,
      noNav
    } = this.props;

    if (!policy) {
      return <LoadingSpinner />;
    }

    return (
      <form className="shared-Form" onSubmit={e => e.preventDefault()}>
        <NavigationBanner
          sections={sections}
          sectionIndex={sectionIndex}
          noNav={noNav}/>

        <Section
          section={sections && sections[sectionIndex]}/>
      </form>
    );
  }
}

function stateToProps(state, props) {
  return {
    sections: getAllSectionsForPolicy(state, props),
    sectionIndex: state.quoteAndBuyNavigation.sectionIndex
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(QuoteAndBuyForm);
