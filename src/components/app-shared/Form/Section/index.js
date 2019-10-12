import React, { Component } from "react";
import { connect } from "react-redux";
import { navigateSectionForwards } from "redux/actions/navigation";
import { submitForm } from "redux/actions";
import {
  globalLoadingSelector,
  formTypeSelector,
  isLastSectionSelector
} from "redux/selectors.js";

import { getNestedFieldsAndSubfieldsForSection } from "redux/selectors/Field.js";


import FormField from "components/app-shared/FormField";
import FormFieldGroup from "components/app-shared/FormFieldGroup";
import FormFieldGroupRepeatable from "components/app-shared/FormFieldGroupRepeatable";
import ConfirmationPage from "components/app-shared/ConfirmationPage";
import LoadingSpinner from "components/app-global/LoadingSpinner";

class Section extends Component {
  renderNextButton() {
    const {
      section,
      loading,
      formType,
      navigateSectionForwards,
      isLastSection,
      submitForm
    } = this.props;

    if (formType === "Claims" || formType === "Contact") {
      return (
        <button
          id="next"
          type="button"
          className="ui-kit-btn-primary"
          tabIndex="0"
          disabled={loading}
          onClick={() => {
            if (isLastSection) {
              submitForm();
            } else {
              navigateSectionForwards();
            }
          }}>
          {section.proceedButtonText || "Next"}
        </button>
      )
    } else {
      return (
        <button
          id="next"
          type={section.proceedButtonAction === "finalise" ? "submit" : "button"}
          className="ui-kit-btn-primary"
          tabIndex="0"
          disabled={loading}
          onKeyPress={e => { if ((e.key == "Enter" || e.keyCode == 32) && section.proceedButtonAction !== "finalise") {navigateSectionForwards();}}}
          onTouchEnd={e => e.preventDefault()}
          onTouchStart={() => { if (section.proceedButtonAction !== "finalise") { navigateSectionForwards(); }}}
          onMouseDown={() => { if (section.proceedButtonAction !== "finalise") { navigateSectionForwards(); }}}>
            {section.proceedButtonText || "Next"}
        </button>
      );
    }
  }

  render() {
    const {
      section,
      navigateSectionForwards,
      fields,
      loading
    } = this.props;

    if (loading) {
      return <LoadingSpinner />;
    } else {
      return (
        <section className="shared-Form-Section">
          {fields &&
             fields.map(field => {
              if (field.hidden) {
                return null;
              } else if (field.type === 'group' && field.repeatable) {
                return <FormFieldGroupRepeatable key={field.id} field={field} />;
              } else if (field.type === 'group') {
                return <FormFieldGroup key={field.id} field={field} />;
              } else {
                return <FormField key={field.id} field={field} />;
              }
            })
          }

          {
            section.navigationName === "Confirmation" &&
              <ConfirmationPage />
          }

          {this.renderNextButton()}

        </section>
      );
    }
  }
}

function stateToProps(state, props) {
  return {
    fields: getNestedFieldsAndSubfieldsForSection(state, props.section.id),
    loading: globalLoadingSelector(state),
    formType: formTypeSelector(state),
    isLastSection: isLastSectionSelector(state)
  };
}

const dispatchToProps = {
  navigateSectionForwards,
  submitForm
};

export default connect(
  stateToProps,
  dispatchToProps
)(Section);
