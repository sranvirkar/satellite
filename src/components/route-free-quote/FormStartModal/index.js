import React, { Component } from "react";
import Section from "components/app-shared/FormSection";
import FormField from "components/app-shared/FormField";
import LoadingSpinner from "components/app-global/LoadingSpinner";
import BrowserCheck from "components/app-global/BrowserCheck";
import { connect } from "react-redux";
import { getNestedFieldsAndSubfieldsForSection } from "redux/selectors/Field.js";
import { getSectionById } from "redux/selectors/Section.js";
import { navigateToNextSection } from "redux/actions/navigation";
import { loadingSelector } from "redux/selectors";


class FormStartModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitted: false
    }
  }

  render() {
    const {
      section,
      fields,
      navigateToNextSection,
      creatingQuote
    } = this.props;

    const {
      isSubmitted
    } = this.state;

    if (!fields) {
      return null;
    }


    return (
      <div className="free-quote-FormStartModal">
        <div className="section-wrapper">
          <BrowserCheck/>
          <h1 className="poncho-h4">{section && section.title}</h1>
          <section>
            {
              fields.map(field => <FormField key={field.id} field={field} topLevel="true"/>)
            }

            {
              creatingQuote ?
              <a
                className="poncho-btn-primary-reg disabled"
                tabIndex="0">
                <LoadingSpinner />
              </a>
              :
              <a
                className="poncho-btn-primary-reg"
                tabIndex="0"
                disabled={isSubmitted}
                onClick={e => {
                  this.setState({isSubmitted: true});
                  navigateToNextSection();
                }}>
                {section && section.next}
              </a>
            }

            <p className="poncho-caption grey">
              By proceeding you agree to the <a href={termsUrl} target="_blank">Terms of Use</a> of this site and that you have read and understood this Important Information about answering questions that we ask you.
              You also consent to receiving all communications from us in digital form only. We will handle your personal information in accordance with our <a href={termsUrl} target="_blank">Privacy Policy</a>.
            </p>
          </section>
        </div>

        <div className="image" style={{backgroundImage: `url(${reactRoute}/resource/poncho/assets/img/form-start-modal-rhs.png)`}}/>
      </div>
    )
  }
}

function stateToProps(state, props) {
  return {
    section: getSectionById(state, 0),
    fields: getNestedFieldsAndSubfieldsForSection(state, 0),
    creatingQuote: loadingSelector(state, "CREATE_QUOTE")
  };
}

const dispatchToProps = {
  navigateToNextSection
};

export default connect(
  stateToProps,
  dispatchToProps
)(FormStartModal);
