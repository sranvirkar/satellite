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
import FormFieldGroupPolicyHolder from "components/app-shared/FormFieldGroupPolicyHolder";
import FormContainer from "components/app-shared/FormContainer";


class FormSection extends Component {

  render() {
    const {
      section,
      navigateSectionForwards,
      fields,
      loading
    } = this.props;

    if (!fields) {
      return null;
    }

    const containerWrapper = (field) => (
      <FormContainer
        key={field.id}
        headerSupertitle={field.containerSupertitle}
        headerTitle={field.containerTitle}
        headerSubtitle={field.containerSubtitle}
        mainElementStyleRule={field.containerStyle}>
        { fieldVariations(field) }
      </FormContainer>
    )

    const fieldVariations = (field) => {
      if (field.hidden === "true") {
        return null;

      } else if (field.type === 'group' && field.name === 'policyHolder') {
        return <FormFieldGroupPolicyHolder key={field.id} field={field}/>;

      } else if (field.type === 'group' && field.repeatable) {
        return <FormFieldGroupRepeatable key={field.id} field={field}/>;

      } else if (field.type === 'group') {
        return <FormFieldGroup key={field.id} field={field} />;

      } else {
        return <FormField key={field.id} field={field} />;
      }
    }

    return (
      <section className="shared-FormSection">
        {
          fields.map(field => field.hasContainer ? containerWrapper(field) : fieldVariations(field))
        }
      </section>
    );
  }
}

function stateToProps(state, props) {
  return {
    fields: getNestedFieldsAndSubfieldsForSection(state, props.section.id),
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(FormSection);
