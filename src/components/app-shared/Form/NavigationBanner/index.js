import React, { Component } from "react";
import { connect } from "react-redux";
import { navigateToSection } from "redux/actions/navigation";
import { sectionsLength } from "redux/selectors.js";

class NavigationBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  navigateToSection = (index) => {
    this.props.navigateToSection(index);
  }

  render() {
    const { sections, sectionIndex, sectionsLength, completedSectionIndexes, noNav } = this.props;

    let sectionIndexes = [];
    for (var i=0; i<=sectionIndex; i++) {
      sectionIndexes.push(i);
    }

    return (
      <div className="shared-Form-NavigationBanner">
        <div className="top">
          <h2 className="ui-kit-h1">{sections[sectionIndex].title}</h2>
          {
            !noNav && <div className="ui-kit-pill-medium">Step&nbsp;{sectionIndex + 1}&nbsp;of&nbsp;{sectionsLength}</div>
          }
        </div>

        {
          !noNav && (
            <nav>
              <li className="ui-kit-pill-small summary"><span>Summary</span></li>
              {sectionIndexes.map(index =>
                <li key={index} className="ui-kit-pill-small" onClick={() => this.navigateToSection(index)}>
                  {sections[index].materialIconsIcon && <i className="material-icons">{sections[index].materialIconsIcon}</i>}
                  <span>{sections[index].navigationName}</span>
                </li>
              )}
            </nav>
          )
        }

      </div>
    );
  }
}

function stateToProps(state) {
  return {
    completedSectionIndexes: state.quoteAndBuyNavigation.completedSectionIndexes,
    sectionsLength: sectionsLength(state)
  };
}

const dispatchToProps = {
  navigateToSection,
};

export default connect(
  stateToProps,
  dispatchToProps
)(NavigationBanner);
