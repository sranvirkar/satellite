import React, { Component } from "react";
import FormFieldGroup from "components/app-shared/FormFieldGroup";

import InputString from "../InputString";
import InputTextarea from "../InputTextarea";
import InputDateSingleDay from "../InputDateSingleDay";
import InputDate from "../InputDate";
import InputFile from "../InputFile";
import InputAddress from "../InputAddress";
import InputSelect from "../InputSelect";
import InputToggle from "../InputToggle";

// Vehicle inputs
import VehicleCardField from "../VehicleCardField";
import InputVehicleCantFind from "../InputVehicleCantFind";
import InputVehicleSearch from "../InputVehicleSearch";
import InputVehicleSelectButton from "../InputVehicleSelectButton";
import InputVehicleClear from "../InputVehicleClear";

import InputVehicleAddressCantFind from "../InputVehicleAddressCantFind";
import InputVehicleAddressSelectButton from "../InputVehicleAddressSelectButton";

import EndorsementVehicle from "../EndorsementVehicle";

// Driver inputs
import DriverCardField from "../DriverCardField";
import EndorsementDriver from "../EndorsementDriver";

// PH inputs
import InputDeclarationPersons from "../InputDeclarationPersons";
import EndorsementPolicyholder from "../EndorsementPolicyholder";
import InputEmailMatchRedirect from "../InputEmailMatchRedirect";

import PaySection from "components/route-free-quote/PaySection";
import QuoteSection from "components/route-free-quote/QuoteSection";
import FinaliseSection from "components/route-online-self-service/EditPolicy/FinaliseSection";

import Tooltip from "../Tooltip";
import InputPolicyholderAddress from "../InputPolicyholderAddress";
import VehicleCheckbox from "../VehicleCheckbox";
import VehicleTotalValue from "../VehicleTotalValue";
import VehicleStandards from "../VehicleStandards";
import InputRelationships from "../InputRelationships";
import InputRadioButtons from "../InputRadioButtons";
import InputDriverPolicyholders from "../InputDriverPolicyholders";
import InputPerils from "../InputPerils";
import InputPolicies from "../InputPolicies"

import ConfirmationPage from "../ConfirmationPage";

import moment from 'moment';

import { connect } from "react-redux";
import { upsertAnswer, upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { validateAnswer } from "redux/actions/validation";
import { answer } from "redux/selectors";
import { isFieldVisibleInThisAnswerGroup } from "redux/selectors/Field";
import { getNextAnswerId } from "redux/utils";
import { userFormattedDate } from "helpers/fieldValidations";

class FormField extends Component {

  componentDidMount() {
    const { field, answer, answerGroupId, upsertAnswer } = this.props;
    if (answer === null) {
      upsertAnswer({
        id: getNextAnswerId(),
        answerGroup: answerGroupId,
        field: field.id,
        fieldName: field.name,
        value: field.exampleValues && window.location.href.includes('sandbox') ? field.exampleValues[0].replace(/RANDOM/g, Date.now()).replace(/TODAY/g, moment().format("YYYY-MM-DD")) : '',
        excludeFromResponsePayload: field.excludeFromResponsePayload,
        dataSource: field.dataSource,
        dataSourceFieldname: field.dataSourceFieldname
      });
    }
  }

  // refactor this to return a new Promise and resolve in the callback instead of this garbage - RV
  updateAnswer = (newAnswer, callback) => {
    const {
      field,
      answer,
      answerGroupId,
      validateAnswer,
      upsertAnswer,
      upsertAnswerForFieldName
    } = this.props;


    // RV - shouldn't be here, allows users to enter phone numbers in the format +614... and autocorrect to 04...
    let value = newAnswer;
    if (field.name == 'phPhone' && value.match(/^\+61/g)) {
      value = value.replace("+61", "0");
    }
    if (field.name == 'phPhone' && value.match(/^61/g)) {
      value = value.replace("61", "0");
    }
    if (field.name == 'vehicleLicensePlate') {
      value = value.toUpperCase();
    }

    if (field.validations && field.validations.find(rule => rule.event === "change")) {
      const updateAnswerAfterValidation = true;
      validateAnswer(value, answer, updateAnswerAfterValidation)
      .then(() => {
        if (callback) { return callback; }
      });
      return;
    }

    if (field.typeOptions && field.typeOptions.clear) {
      upsertAnswerForFieldName(field.typeOptions.clear, answerGroupId, {value: '', validationErrors: false})
    }

    upsertAnswer(Object.assign(
      {},
      answer,
      { value: value }
    ))
    .then(() => {
      if (callback) { return callback; }
    });
  }

  onBlurValidation = (newAnswer, shouldUpdate) => {
    return new Promise((resolve) => {
      const { field, answer, answerGroupId, validateAnswer } = this.props;
      validateAnswer(newAnswer, answer, shouldUpdate)
      .then(resolve())
      .catch();
    })
  }

  manuallyClearErrors = () => {
    const { answer, upsertAnswer } = this.props;
    const validationUpdates = Object.assign({}, answer, {
      validationErrors: false
    });

    upsertAnswer(validationUpdates);
  }

  render() {
    const {
      field,
      answer,
      isFieldVisibleInThisAnswerGroup,
      repeatableIndex,
      answerGroupId,
      fieldGroupIndex
    } = this.props;

    if (!answer || !isFieldVisibleInThisAnswerGroup) return null;

    if (field.display === "none") return null;

    //not scalable solution, specifically for hiding policyId field in non-auth contact-us form:
    // OTHER HALF IS IN navigateFields in redux/actions/navigation.js
    if (field.name === "Policy_Id" && !userModel.isLoggedIn) {
      return null;
    }

    let inputComponent;
    let pageComponent;
    switch(field.type) {
      case "string":
        inputComponent = <InputString field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />;
        break;

      case "address":
        inputComponent = <InputAddress field={field} answer={answer} answerGroupId={answerGroupId} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} manuallyClearErrors={this.manuallyClearErrors}/>;
        break;

      case "textarea":
        inputComponent = <InputTextarea field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />;
        break;

      case "file":
        inputComponent = <InputFile field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />;
        break;

      case "date-single-day":
        inputComponent = <InputDateSingleDay field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} manuallyClearErrors={this.manuallyClearErrors}/>;
        break;

      case "date":
        inputComponent = <InputDate field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} manuallyClearErrors={this.manuallyClearErrors}/>;
        break;

      case "select":
        inputComponent = <InputSelect field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />;
        break;

      case "toggle":
        inputComponent = <InputToggle field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />;
        break;

      case "vehicle-search":
        inputComponent = <InputVehicleSearch field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} answerGroupId={answerGroupId}/>;
        break;

      case "vehicle-select-button":
        inputComponent = <InputVehicleSelectButton field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} answerGroupId={answerGroupId}/>;
        break;

      case "vehicle-address-select-button":
        inputComponent = <InputVehicleAddressSelectButton field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} answerGroupId={answerGroupId}/>;
        break;

      case "vehicle-clear":
        inputComponent = <InputVehicleClear field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} answerGroupId={answerGroupId}/>;
        break;

      case "vehicle-cant-find":
        inputComponent = <InputVehicleCantFind field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} answerGroupId={answerGroupId}/>;
        break;

      case "vehicle-address-cant-find":
        inputComponent = <InputVehicleAddressCantFind field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} answerGroupId={answerGroupId}/>;
        break;

      case "vehicle-card":
        inputComponent = <VehicleCardField answerGroupId={answerGroupId} isSummary={true} />;
        break;

      case "driver-card":
        inputComponent = <DriverCardField answerGroupId={answerGroupId} clickable="true" />;
        break;

      case "quote-pay-section":
        pageComponent = <PaySection />;
        break;

      case "new-quote-step":
        pageComponent = <QuoteSection />
        break;

      case "endo-vehicles":
        inputComponent = <EndorsementVehicle />;
        break;

      case "endo-drivers":
        inputComponent = <EndorsementDriver />;
        break;

      case "endo-policyholders":
        inputComponent = <EndorsementPolicyholder />;
        break;

      case "endorsement-finalise-step":
        inputComponent = <FinaliseSection field={field} />;
        break;

      case "declaration-persons":
        inputComponent = <InputDeclarationPersons field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />;
        break;

      case "driver-policyholder":
        inputComponent = <InputDriverPolicyholders field={field} answer={answer} answerGroupId={answerGroupId} updateAnswer={this.updateAnswer} repeatableIndex={repeatableIndex} />;
        break;

      case "policyholder-address":
        inputComponent = <InputPolicyholderAddress field={field} answer={answer} answerGroupId={answerGroupId} updateAnswer={this.updateAnswer} repeatableIndex={repeatableIndex} onBlurValidation={this.onBlurValidation} manuallyClearErrors={this.manuallyClearErrors}/>;
        break;

      case "vehicle-value":
        inputComponent = <VehicleTotalValue field={field} answer={answer} answerGroupId={answerGroupId} repeatableIndex={repeatableIndex} />;
        break;

      case "vehicle-checkbox":
        inputComponent = <VehicleCheckbox field={field} answer={answer} answerGroupId={answerGroupId} updateAnswer={this.updateAnswer} repeatableIndex={repeatableIndex} />;
        break;

      case "vehicle-standards":
        inputComponent = <div>
          <VehicleStandards answerGroupId={answerGroupId} />
          <InputRadioButtons field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />
        </div>
        break;

      case "relationships":
        inputComponent = <InputRelationships field={field} answer={answer} answerGroupId={answerGroupId} updateAnswer={this.updateAnswer} repeatableIndex={repeatableIndex} hideInput={true} />;
        break;

      case "radio-buttons":
        inputComponent = <InputRadioButtons field={field} answer={answer} answerGroupId={answerGroupId} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex} />;
        break;

      case "subtitle":
        inputComponent = <h4 className="poncho-h5">{field.subtitle}</h4>;
        break;

      case "perils":
        inputComponent = <InputPerils field={field} answer={answer} answerGroupId={answerGroupId} updateAnswer={this.updateAnswer} repeatableIndex={repeatableIndex} />;
        break;

      case "email-match-redirect":
        inputComponent = <InputEmailMatchRedirect field={field} answer={answer} answerGroupId={answerGroupId} />;
        break;

      case "confirmation-page":
        inputComponent = <ConfirmationPage />;
        break;

      case "dropdown":
        inputComponent = <InputPolicies field={field} answer={answer} updateAnswer={this.updateAnswer} onBlurValidation={this.onBlurValidation} repeatableIndex={repeatableIndex}/>
        break;


      default:
        inputComponent = <input id={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name} type={field.type} onChange={this.handleChange} />
    }

    if (pageComponent) { return pageComponent; }

    return (
      <fieldset className={`shared-FormField ${field.styles || ''} ${answer.validationErrors ? "validation-error" : ''}`}>
        {field.title &&
          <div className="label-wrapper">
            <p className={`super-title poncho-body medium`}>{field.superTitle}</p>
            <label
              className={`${field.type === "date" && "disabled"} poncho-body`}
              htmlFor={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : `${field.name}`}>
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

        {
          inputComponent
        }

        {
          field.subfields &&
          field.subfields.length ?
            <FormFieldGroup field={Object.assign({}, field, {title: null})} answerGroupId={answerGroupId} /> : null
        }

        {
          fieldGroupIndex &&
          <p className="field-group-index">{fieldGroupIndex}</p>
        }

        {
          answer.validationErrors &&
          answer.validationErrors.length > 0 &&
          <div
            id={repeatableIndex !== undefined ? `validation-${field.name}-${repeatableIndex}` : `validation-${field.name}`}
            className={`poncho-caption error-message`}>
            {answer.validationErrors[0]}
          </div>
        }
      </fieldset>
    );
  }
}

function stateToProps(state, props) {
  return {
    answer: answer(state, props),
    isFieldVisibleInThisAnswerGroup: isFieldVisibleInThisAnswerGroup(state, {fieldId: props.field.id, answerGroup: props.answerGroupId})
  };
}

const dispatchToProps = {
  validateAnswer,
  upsertAnswer,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(FormField);
