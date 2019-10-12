import React, { Component } from "react";
import FormField from "../FormField";
import FormFieldGroupRepeatable from "../FormFieldGroupRepeatable";
import Tooltip from "../Tooltip";

import { connect } from "react-redux";
import { isFieldVisibleInThisAnswerGroup } from "redux/selectors/Field";

class FormFieldGroup extends Component {
  render() {
    const { field, answerGroupId, isFieldVisibleInThisAnswerGroup, repeatableIndex } = this.props;

    const subfields = field.subfields.map((subfield, index) => {
      if (subfield.hidden) {
        return null;
      } else if (subfield.type === 'group' && subfield.repeatable == true) {
        return <FormFieldGroupRepeatable key={subfield.id} field={subfield} />;
      } else if (subfield.type === 'group') {
        return <FormFieldGroupContainer key={subfield.id} field={subfield} answerGroupId={answerGroupId} repeatableIndex={repeatableIndex} />;
      } else {
        return <FormField key={subfield.id} field={subfield} answerGroupId={answerGroupId} repeatableIndex={repeatableIndex} fieldGroupIndex={index + 1}/>;
      }
    });

    return isFieldVisibleInThisAnswerGroup ? (
      <div className={`${field.name === 'credit_card' && 'credit-card'} ${field.styles} shared-FormFieldGroup`}>
        {field.title &&
          <div className="label-wrapper">
            <label
              className={`${field.type === "date" && "disabled"} poncho-body`}
              htmlFor={field.name}>
              {field.title}
            </label>
            &nbsp;
            { !field.display &&
              <Tooltip
                uniqueId={field.id}
                helpText={field.helpText} />
            }
          </div>
        }

        {subfields}
      </div>
    ) : null;
  }
}

function stateToProps(state, props) {
  return {
    isFieldVisibleInThisAnswerGroup: isFieldVisibleInThisAnswerGroup(state, {fieldId: props.field.id, answerGroup: props.answerGroupId})
  };
}

const FormFieldGroupContainer = connect(
  stateToProps,
  null
)(FormFieldGroup);
export default FormFieldGroupContainer;
