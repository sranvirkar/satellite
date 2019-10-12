import React, { Component } from "react";
import { connect } from "react-redux";
import {
  updateAddressDetails,
  resetSubFields } from "redux/actions/address";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";

class InputAddress extends Component {

  componentDidMount() {
    const { field, answer, repeatableIndex, answerGroupId, upsertAnswerForFieldName, updateAddressDetails, toggleManualAddressEntry } = this.props;

    const id = repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name;
    const input = document.getElementById(id);
    const options = {
      types: ['address'],
      // types: ['geocode'],
      componentRestrictions: {country: 'au'}
    };

    this.api = new google.maps.places.Autocomplete(input, options);

    this.api.addListener('place_changed', () => {
      updateAddressDetails(field, answerGroupId, this.api.getPlace());

      upsertAnswerForFieldName("vehicleAddressIsSearched", answerGroupId, { value: true });

      this.props.onBlurValidation(this.api.getPlace().formatted_address, true);
    });
  }

  handleChange = (event) => {
    if (event.target.value.match(/[<*#@,%>]/)) { return; } // check for *some* bad characters
    if (event.target.value.match(/  /)) { return; } // check for *some* bad characters

    const { answerGroupId, field, updateAnswer, resetSubFields, upsertAnswerForFieldName } = this.props;
    const subFields = field.validations.filter(rule => rule.type === "subFields")[0].fields;
    resetSubFields(subFields, answerGroupId);

    upsertAnswerForFieldName("vehicleAddressIsSearched", answerGroupId, { value: false });
    upsertAnswerForFieldName("vehicleAddressIsSelected", answerGroupId, { value: false });
    upsertAnswerForFieldName("vehicleAddressCantFind", answerGroupId, { value: true });

    updateAnswer(event.target.value);
  }

  handleBlur = (event) => {
    const { answer } = this.props;
    // this.props.onBlurValidation(event.target.value);
    this.props.onBlurValidation(answer.value, false);
  }

  render() {
    const {
      field,
      answer,
      repeatableIndex,
      answerGroupId,
      // toggleManualAddressEntry,
      manuallyClearErrors
    } = this.props;

    return (
      <div
        className="shared-InputAddress">
        <input
          id={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name}
          className={`${answer.validationErrors && answer.validationErrors.length > 0 ? "error " : ""}${answer.value ? "answer " : ""}`}
          type="string"
          placeholder={field.placeholder ? field.placeholder : ""}
          value={answer.value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          {...answer.disabled ? { disabled: true } : undefined }/>

        {
          answer && answer.value ? null : <i className="material-icons">search</i>
        }

        { /*
          answer && answer.value && this.state.showingCantFindText ? (
            <p className="ui-kit-body-small">
              Can't find your address?
              &nbsp;
              <span onClick={() => {
                  toggleManualAddressEntry(answerGroupId, "true");
                  this.setState({showingCantFindText: false});
                  manuallyClearErrors();
                }}>
                click here
              </span>
            </p>
          ) : null
        */}
      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
  };
}

const dispatchToProps = {
  updateAddressDetails,
  // toggleManualAddressEntry,
  resetSubFields,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputAddress);
