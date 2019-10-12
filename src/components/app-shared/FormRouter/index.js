import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { navigateToRoute, setSectionUrlParam, validateSectionUrlParam, validateAllPreviousSections, navigateToNextSection, navigateToPrevSection, removeCurrentOnwardsFromValidatedSections, postNavigationActions, resetRoute } from "redux/actions/navigation";
import { nextSectionUrlParamSelector, prevSectionUrlParamSelector, currentSectionUrlParamSelector, globalLoadingSelector, formTypeSelector, editPolicySelector  } from "redux/selectors";
import { isShowingSupportLinks } from "redux/selectors/Section";
import { getAllSections } from "redux/selectors/Section.js";
import FormSection from "components/app-shared/FormSection";
import FormContainer from "components/app-shared/FormContainer";
import SupportLinks from "components/route-free-quote/SupportLinks";
import ContactSidebar from "components/route-online-self-service/EditPolicy/ContactSidebar";

import LoadingSpinner from "components/app-global/LoadingSpinner";
import LoadingBar from "components/app-global/LoadingBar";

class FormRouter extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentSection: false
    }
  }

  navigateToNextSection = async () => {
    await this.props.navigateToNextSection();
    // this.props.postNavigationActions();
  }

  navigateToPrevSection = async () => {
    await this.props.navigateToPrevSection();
    // this.props.postNavigationActions();
  }

  async validateCurrentAndPreviousSections(sectionUrlParam) {
    // console.log('sectionURLparam', sectionUrlParam);
    const {
      history,
      validateSectionUrlParam,
      validateAllPreviousSections,
      navigateToRoute,
      resetRoute,
      nextSectionUrlParam
    } = this.props;

    try {
      await validateSectionUrlParam(sectionUrlParam);
    } catch (error) {
      // console.log('FormRouter error', error);
      // console.log('redirecting to index...');
      // history.push(reactRoute);

      resetRoute();

      return;
    }

    try {
      await validateAllPreviousSections(sectionUrlParam);
    } catch (invalidSection) {
      if (invalidSection.urlParam) {
        // console.log('redirecting to invalid section...', invalidSection.urlParam);
        // FUTURE FIX: path prop currently hardcoded for q&b and endorsement FormRouters - might want to make this more dynamic
        // history.push(`${this.props.path}/${invalidSection.urlParam}`);

        navigateToRoute(invalidSection.urlParam);

      }
      return;
    }

    // console.log('setting current section url param');
    this.setState({
      currentSection: sectionUrlParam
    });

    this.props.setSectionUrlParam(sectionUrlParam);

    // Putting this here because this was firing AFTER... and hence the section in postNavigationActions was still the previous section
    this.props.postNavigationActions();

    // console.log('removing sections from current one onwards from validated sections');
    this.props.removeCurrentOnwardsFromValidatedSections();

  }

  componentDidMount() {
    this.validateCurrentAndPreviousSections(this.props.match.params.sectionUrlParam);
  }

  componentWillReceiveProps(props) {
    const sectionUrlParam = props.match.params.sectionUrlParam;

    // we only pass the match.params.sectionUrlParam as props, so this should only run when the subroute changes
    // all the same, we use an if statement to only run these validations when there's a change to be actually done
    if (sectionUrlParam !== this.state.currentSection) {
      // console.log('route change:', sectionUrlParam);
      this.setState({
        currentSection: false
      });
      this.validateCurrentAndPreviousSections(sectionUrlParam);
    }
  }

  renderLoadingState = () => {
    const {currentSectionUrlParam } = this.props;
      if(currentSectionUrlParam === 'pay') {
        return (
           <div className="loading-overlay-grey">
              <LoadingBar/>
            </div>
        )
      } else {
        return (
        <div className="loading-overlay">
          <LoadingSpinner width={50}/>
        </div>
        )
      }
  }

  render() {
    const { currentSection } = this.state;
    const { sections, isShowingSupportLinks, prevSectionUrlParam, currentSectionUrlParam, loading, formType } = this.props;
    if (!currentSection) {
      return <p>loading</p>;
    }

    const section = sections.find(s => s.urlParam === currentSection);

    return (
      <form className="shared-FormRouter" onSubmit={e => e.preventDefault()}>
        {
          !this.props.disableTitles &&
          <React.Fragment>
            { section.title && <h1 className="poncho-h2">{section.title}</h1> }
            { section.subtitle && <h2 className="poncho-lead grey">{section.subtitle}</h2> }
          </React.Fragment>
        }

        {
         loading &&
         this.renderLoadingState()
        }

        <FormSection section={section} />

        {
          isShowingSupportLinks &&
          <div className="navigation-buttons">
            {
              section.next &&
              <button
                type="button"
                className="next poncho-btn-primary-reg"
                onClick={this.navigateToNextSection}>
                {section.next}
              </button>
            }
            {
              prevSectionUrlParam &&
              currentSectionUrlParam !== "confirmation" &&
              currentSectionUrlParam !== "cars" &&
              <button
                type="button"
                className="back poncho-btn-primary-reg transparent grey border"
                onClick={this.navigateToPrevSection}>
                Back
              </button>
            }
          </div>
        }
        {
          (formType === 'Claims' || formType === 'Quote')?
          (
            <SupportLinks/>
          ) : (null)
        }

        {
          currentSectionUrlParam === "effective-date" ||
          currentSectionUrlParam === "edit-policy" ||
          currentSectionUrlParam === "declarations" ?
            <ContactSidebar /> : null
        }

      </form>
    );
  }
}

function stateToProps(state, props) {
  return {
    sections: getAllSections(state),
    nextSectionUrlParam: nextSectionUrlParamSelector(state),
    prevSectionUrlParam: prevSectionUrlParamSelector(state),
    currentSectionUrlParam: currentSectionUrlParamSelector(state),
    isShowingSupportLinks: isShowingSupportLinks(state),
    loading: globalLoadingSelector(state),
    formType: formTypeSelector(state)
  };
}

const dispatchToProps = {
  setSectionUrlParam,
  validateSectionUrlParam,
  validateAllPreviousSections,
  navigateToNextSection,
  navigateToPrevSection,
  removeCurrentOnwardsFromValidatedSections,
  postNavigationActions,
  navigateToRoute,
  resetRoute
};

export default connect(
  stateToProps,
  dispatchToProps
)(withRouter(FormRouter));
