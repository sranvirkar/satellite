import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { getAllSections } from "redux/selectors/Section";
import { validatedSectionsSelector } from "redux/selectors";
import { Tick } from "helpers/svgIcons";
import { navigateToRoute } from "redux/actions/navigation";

import {
} from "redux/selectors.js";

class FormNavigation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentSection: false
    }
  }

  componentWillReceiveProps(props) {
    const sectionUrlParam = props.match.params.sectionUrlParam;

    if (sectionUrlParam !== this.state.currentSection) {
      this.setState({
        currentSection: props.match.params.sectionUrlParam
      });
    }
  }

  navigateToSection(sectionId) {
    const { navigateToRoute } = this.props;

    navigateToRoute(sectionId);
  }

  render() {
    const {
      sections,
      match,
      validatedSections,
      disabled
    } = this.props;

    const { currentSection } = this.state;

    if (currentSection === "confirmation") return null;

    return (
      <nav className="shared-FormNavigation">
        {
          sections.length &&
          sections.filter(s => s.navigationName !== "").map((s, key) =>
            <a
              key={key}
              className={`navigation-option ${validatedSections.includes(s.urlParam) ? "valid" : ''} ${s.urlParam === currentSection ? "active" : ""}`}
              onMouseDown={e => !disabled && this.navigateToSection(s.urlParam)}
              onTouchStart={e => !disabled && this.navigateToSection(s.urlParam)}
              onTouchEnd={e => e.preventDefault()}>
                {
                  validatedSections.includes(s.urlParam) ? <span><Tick /></span> :
                  <span className="poncho-h6 demi-bold">{key + 1}</span>
                }
              <p className="poncho-body">{s.navigationName}</p>
            </a>
          )
        }
      </nav>
    );
  }
}

function stateToProps(state, props) {
  return {
    sections: getAllSections(state).filter(s => !s.hidden),
    validatedSections: validatedSectionsSelector(state),
  };
}

const dispatchToProps = {
  navigateToRoute
};

export default connect(
  stateToProps,
  dispatchToProps
)(withRouter(FormNavigation));
