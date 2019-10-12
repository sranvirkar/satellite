import {
  CREATE_QUOTE_AND_BUY_FORM,
  CREATE_ENDORSEMENT_FORM,
  CREATE_CLAIMS_FORM,
  CREATE_CONTACT_FORM,
  CLEAR_POLICY_CHANGES,
  RESET_FORM,
  SET_FORM_TYPE,
  SUBMIT_FORM_REQUEST,
  SUBMIT_FORM_ERROR,
  SUBMIT_FORM_SUCCESS,
  CREATE_FORM_REQUEST,
  CREATE_FORM_SUCCESS
} from "./actionTypes";
import { parsePolicyholder } from "redux/actions/policyholder";

import { policyByIdSelector, endorsementFinalisedSelector, answerGroups, formTypeSelector, fieldByNameOrDataSourceFieldname, policySummarySelector, policyFinalised, answerByFieldNameAndAnswerGroup, fieldByName, policyIdSelector } from "redux/selectors";
import { getNextAnswerId, getDefaultValue } from "redux/utils";
import { constructPolicyChangesPayload } from "helpers/mulesoft";
import { updateEndorsement } from "redux/actions/endorsement";
import { updateQuote, constructUpdateQuotePayload, finaliseQuoteAndProcessPayment } from "redux/actions/quote";
import { getQuestionSet } from "redux/actions/questionSet";
import { submitClaim } from "redux/actions/claims";
import { submitContactUs } from "redux/actions/contact";
import { upsertAnswer, upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { getVehicleDetails } from "redux/actions/vehicle";
import { createAnswerGroupFromField, updateAnswerGroup, createRelationship } from "redux/actions/orm/AnswerGroup";
import { isEmptyObject } from "helpers/utils";
import { navigateToNextSection, resetRoute } from "redux/actions/navigation";
import { finaliseEndorsementAndProcessPayment } from "redux/actions/endorsement";
import { isSafeToGetPrice } from "redux/selectors/Pricing";
import { policyChangesSelector } from "redux/selectors/Policy";

import {
  setPreviousPrices,
  getQuotePrice,
  getEndorsementPrice
} from "redux/actions/price";

import { clearReduxPricingQuote } from "redux/actions/pricing/quote";

// TODO: check error status / error codes to determine whether to retry request... e.g. bad vehicle rego should not retry again
const DEFAULT_MAX_RETRIES = 1;
const DEFAULT_RETRY_TIMEOUT = 3000; // in ms
const EXCLUDE_FROM_RETRY = ['finalisePolicyAndProcessPayment'];

// Call methods that exist on the ApexController (exposed in Visualforce page)
export function apexActionPromise(actionMethod, ...args) {
  if (window.ApexController[actionMethod] === undefined) {
    Promise.reject(`Action method ${actionMethod} does not exist on ApexController`);
  }

  let retries = 0;
  return new Promise((resolve, reject) => {

    const options = {
      escape: false,
      buffer: false,
      timeout: 120000
    };

    const callback = (result, event) => {
      const parsedResult = JSON.parse(result);
      if (!parsedResult || parsedResult.error) {
        console.log(`action failed: ${actionMethod}`, parsedResult);

        if (parsedResult && parsedResult.statusCode === 402 && ["finalisePolicyAndProcessPayment", "finaliseEndorsementAndProcessPayment"].includes(actionMethod)) {
          console.log('payment error, allow user to try again');
          // Payment decline error, allow user to try again
          return reject(parsedResult);
        }

        if (retries >= DEFAULT_MAX_RETRIES || EXCLUDE_FROM_RETRY.includes(actionMethod)) {
          console.log(`all actions failed: ${actionMethod}`);
          return reject(parsedResult);
        }

        retries++;
        console.log(`retrying action in ${DEFAULT_RETRY_TIMEOUT} milliseconds...`);

        window.setTimeout(() => {
          console.log(`retrying action [attempt ${retries}]: ${actionMethod}`);
          window.ApexController[actionMethod](
            ...args,
            userModel.antiCSRFToken,
            userModel.userAccessToken,
            callback,
            options
          );
        }, DEFAULT_RETRY_TIMEOUT);

      } else {
        console.log(`action success: ${actionMethod}`, parsedResult);
        return resolve(parsedResult);
      }
    }

    console.log(`sending action: ${actionMethod}`, args);
    window.ApexController[actionMethod](
      ...args,
      userModel.antiCSRFToken,
      userModel.userAccessToken,
      callback,
      options
    );

  })
}

// Send request to Mulesoft API (via ApexController sendRequest method)
export function apexRequestPromise(serviceName, httpMethod, urlParams, payload) {
  let retries = 0;
  return new Promise((resolve, reject) => {

    const options = {
      escape: false,
      buffer: false,
      timeout: 120000
    };

    const callback = (result, event) => {
      const parsedResult = JSON.parse(result);
      if (!parsedResult || parsedResult.error) {
        console.log(`request failed: ${httpMethod} ${serviceName}`, parsedResult);

        // Don't try callout again if it is a vehicle registration not found error (404) or payment decline error (402)
        if (parsedResult && ((parsedResult.statusCode === 404 && serviceName === "Vehicle Registration") || (parsedResult.statusCode === 402 && serviceName === "Quote Payment"))) {
          return reject(parsedResult);
        }

        if (retries >= DEFAULT_MAX_RETRIES || EXCLUDE_FROM_RETRY.includes(serviceName)) {
          console.log(`all requests failed: ${httpMethod} ${serviceName}`);
          return reject(parsedResult);
        }

        retries++;
        console.log(`retrying request in ${DEFAULT_RETRY_TIMEOUT} milliseconds...`);

        window.setTimeout(() => {
          console.log(`retrying request [attempt ${retries}]: ${httpMethod} ${serviceName}`);
          window.ApexController.sendRequest(
            serviceName,
            httpMethod,
            urlParams,
            payload,
            window.dataLayer.find(d => d.name === 'policyId').value,
            userModel.antiCSRFToken,
            userModel.userAccessToken,
            callback,
            options
          );
        }, DEFAULT_RETRY_TIMEOUT);

      } else {
        console.log(`request success: ${httpMethod} ${serviceName}`, parsedResult);
        return resolve(parsedResult.payload);
      }
    }

    // Log out payload as object in console if it is a JSON string
    let payloadObj;
    try {
      payloadObj = JSON.parse(payload);
    } catch {
      payloadObj = payload;
    }
    console.log(`sending request: ${httpMethod} ${serviceName}`, urlParams, payloadObj);

    window.ApexController.sendRequest(
      serviceName,
      httpMethod,
      urlParams,
      payload,
      window.dataLayer.find(d => d.name === 'policyId').value,
      userModel.antiCSRFToken,
      userModel.userAccessToken,
      callback,
      options
    );
  })
}

import { isValidSection } from "redux/actions/navigation";

const getSubfieldRefs = (field, arr) => {
  arr.push(field.ref);
  field.subfields.toModelArray().map(subfield => getSubfieldRefs(subfield, arr));
  return arr;
}

function resetForm() {
  return {
    type: RESET_FORM
  }
}

export function shouldUpdateQuote() {
  return (dispatch, getState) => {
    const policyChanges = policyChangesSelector(getState());
    const policyChangesPayload = constructPolicyChangesPayload(policyChanges, getState);
    const policyId = policyIdSelector(getState());
    const updateQuotePayload = constructUpdateQuotePayload(policyChangesPayload, policyId);

    if (
      // RV - this looks like it's checks to see if it's safe to update the quote in socotra
      !updateQuotePayload.policyStartTimestamp &&
      updateQuotePayload.addExposures.length <= 0 &&
      updateQuotePayload.updateExposures.length <= 0 &&
      updateQuotePayload.removeExposures.length <= 0 &&
      isEmptyObject(updateQuotePayload.fieldValues)
    ) {
      return Promise.resolve();
    } else {
      return dispatch(updateQuote(updateQuotePayload));
    }
  }
}

export function shouldUpdateEndorsement() {
  return (dispatch, getState) => {
    const formType = formTypeSelector(getState());
    if (formType !== "Endorsement") return Promise.resolve();
    dispatch(updateEndorsement());
  }
}

export function clearPolicyChanges() {
  return {
    type: CLEAR_POLICY_CHANGES
  }
}

export function submitForm() {
  return async (dispatch, getState) => {
    dispatch(submitFormRequest());

    const formType = formTypeSelector(getState());
    switch (formType) {
      case "Quote":
        try {
          if (!policyFinalised(getState())) await dispatch(finaliseQuoteAndProcessPayment());
          dispatch(submitFormSuccess());
          dispatch(navigateToNextSection());
        } catch (error) {
          if (error.statusCode === 402) {
            dispatch({ type: "SUBMIT_FORM_CLEAR" })
            console.error("Quote Payment Error: Allow User Retry: " + JSON.stringify(error));
            return Promise.reject(error);
          } else {
            dispatch(submitFormError());
            console.error(error);
          }
        }
        break;

      case "Endorsement":
        try {
          // if (!endorsementFinalisedSelector(getState())) await dispatch(finaliseEndorsement());
          // if (!paymentProcessedSelector(getState())) await dispatch(processPayment());
          if (!endorsementFinalisedSelector(getState())) await dispatch(finaliseEndorsementAndProcessPayment());
          dispatch(submitFormSuccess());
          dispatch(resetRoute());
          // dispatch(getPolicies());
        } catch (error) {
          if (error.statusCode === 402) {
            console.error("Endorsement Payment Error: Allow User Retry: " + JSON.stringify(error));
          } else {
            dispatch(submitFormError());
            console.error(error);
          }
        }
        break;

      case "Claims":
        dispatch(submitClaim());
        dispatch(submitFormSuccess());
        break;

      case "Contact":
        // TO DO ERROR HANDLING
        dispatch(submitContactUs());
        dispatch(submitFormSuccess());
        break;
    }
  }
}

export function submitFormRequest() {
  return {
    type: SUBMIT_FORM_REQUEST
  }
}

export function submitFormError() {
  return {
    type: SUBMIT_FORM_ERROR
  }
}

export function submitFormSuccess() {
  return {
    type: SUBMIT_FORM_SUCCESS
  }
}

export function populateWithAnswers(fromAnswerGroup, toAnswerGroup, mapping) {
  return (dispatch, getState) => {
    // console.log('populate with answers', fromAnswerGroup, toAnswerGroup, mapping);
    Object.keys(mapping).forEach(key => {
      const fromAnswer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: key, answerGroup: fromAnswerGroup });
      const toAnswer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: mapping[key], answerGroup: toAnswerGroup });

      // console.log('fromAnswer', key, fromAnswerGroup, fromAnswer, toAnswer);

      if (toAnswer === null) {
        // Create answer
        const field = fieldByName(getState(), mapping[key]);
        dispatch(upsertAnswer({
          id: getNextAnswerId(),
          answerGroup: toAnswerGroup,
          field: field.id,
          fieldName: field.name,
          value: getDefaultValue(field),
          excludeFromResponsePayload: field.excludeFromResponsePayload,
          dataSource: field.dataSource,
          dataSourceFieldname: field.dataSourceFieldname,
          value: fromAnswer ? fromAnswer.value : "", // TODO: check this
          disabled: true
        }));
      } else {
        dispatch(upsertAnswer({
          id: toAnswer.id,
          value: fromAnswer ? fromAnswer.value : "",
          disabled: true,
          validationErrors: false
        }));
      }
    })
  }
}

export function clearFieldsInAnswerGroup(fields, answerGroup) {
  return (dispatch, getState) => {
    fields.forEach(field => {
      const answer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: field, answerGroup });

      if (answer) {
        dispatch(upsertAnswer({
          id: answer.id,
          value: getDefaultValue(fieldByName(getState(), field)),
          disabled: false,
          validationErrors: false
        }));
      }
    })
  }
}

// Create answers from an object with key as fieldname - either name or dataSourceFieldName in question set payload
// Used for populating endorsement form
export function createAnswersFromObject(obj, answerGroupId) {
  return (dispatch, getState) => {
    Object.keys(obj).forEach(key => {
      let field = fieldByNameOrDataSourceFieldname(getState(), key);
      // Checking for entity because we want to ignore fields like "driver" (answer groups will be created separately)
      if (field && !field.ref.entity) {
        dispatch(upsertAnswerForFieldName(field.ref.name, answerGroupId, { value: obj[key] }));
      }
    })
  }
}

// Get policy summary at timestamp and populate answers in endorsement form
export function populateEndorsementForm(policyId, timestamp) {
  return async (dispatch, getState) => {
    const policySummary = policySummarySelector(getState(), policyId, timestamp);

    // Keys are vehicle id (exposureLocator)/driver id (driverId) and value is answer group id
    // Helps to create relationships between driver and vehicle answer groups
    const vehicleAnswerGroupIdMap = {};
    const driverAnswerGroupIdMap = {};

    let getVehicleDetailsPromises = [];

    // Populate vehicles
    policySummary.vehicles.allIds.forEach(vehicleId => {
      // Get vehicle data
      const vehicle = policySummary.vehicles.byId[vehicleId];

      // Create vehicle answer group and update with existing exposureLocator
      const vehicleField = fieldByName(getState(), "vehicle");
      const vehicleAnswerGroupId = dispatch(createAnswerGroupFromField(vehicleField, true));
      dispatch(updateAnswerGroup({
        id: vehicleAnswerGroupId,
        exposureLocator: vehicleId
      }));
      vehicleAnswerGroupIdMap[vehicleId] = vehicleAnswerGroupId;

      // Create answers from vehicle fields and relate to vehicle answer group
      dispatch(createAnswersFromObject(vehicle, vehicleAnswerGroupId));

      // Do RedBook callout
      getVehicleDetailsPromises.push(dispatch(getVehicleDetails(vehicleAnswerGroupId, true)));
    })

    // Populate drivers
    policySummary.drivers.allIds.forEach(driverId => {
      // Get driver data
      const driver = policySummary.drivers.byId[driverId];

      // Create driver answer group and update with existing driverLocator and driverId
      const driverField = fieldByName(getState(), "driver");
      console.log('driverLocator...', driver.driverLocator);
      const driverAnswerGroupId = dispatch(createAnswerGroupFromField(driverField, true));
      dispatch(updateAnswerGroup({
        id: driverAnswerGroupId,
        driverId,
        driverLocator: driver.driverLocator
      }));
      driverAnswerGroupIdMap[driverId] = driverAnswerGroupId;

      // Create answers from driver fields and relate to driver answer group
      dispatch(createAnswersFromObject(driver, driverAnswerGroupId));
    })

    // Create relationships between vehicles and drivers
    Object.keys(policySummary.drivers.byVehicleId).forEach(vehicleId => {
      const vehicleAnswerGroupId = vehicleAnswerGroupIdMap[vehicleId];
      const driverIds = policySummary.drivers.byVehicleId[vehicleId];
      driverIds.forEach(driverId => {
        const driverAnswerGroupId = driverAnswerGroupIdMap[driverId];
        dispatch(createRelationship([vehicleAnswerGroupId, driverAnswerGroupId]));
      })
    })

    // driverPolicyholder is a front-end only (not stored in Socotra) policyholder field with a value equal to the answer group id of the driver that is linked/populating fields in the policyholder (e.g. first name, last name)
    // driverPolicyholders is an array (front-end only field) of these driverPolicyholder values
    const driverPolicyholders = [];

    // Populate policyholders
    policySummary.policyholders.forEach(policyholder => {
      /*
        Field names in policyholder data are not directly mapped to a front-end field
        Because business and person are separate fields on the front-end but the same fields in Salesforce
        So this extra parsing part is required
      */
      const parsedPolicyholder = parsePolicyholder(policyholder);

      // Create policyholder answer group and update with existing account id
      const policyholderField = fieldByName(getState(), "policyHolder");
      const policyholderAnswerGroupId = dispatch(createAnswerGroupFromField(policyholderField, true));
      dispatch(updateAnswerGroup({
        id: policyholderAnswerGroupId,
        accountId: policyholder.Id
      }));

      // Create answers from policyholder fields and relate to policyholder answer group
      dispatch(createAnswersFromObject(parsedPolicyholder, policyholderAnswerGroupId));

      /*
        Manually populate driverPolicyholder: check if any drivers share the same first name, last name and dob as this policyholder
        This would indicate that it is HIGHLY likely that the driver was selected to populate the policyholder
        FUTURE FIX: driverPolicyholder should be stored on the policyholder in Salesforce with value driverId - this would make it possible to 100% determine whether a driver is linked to a policyholder
      */
      const driverAnswerGroups = answerGroups(getState(), "driver");
      const matchingDriverAnswerGroup = driverAnswerGroups.find(driverAnswerGroup =>
        driverAnswerGroup.answers.driverFirstName === parsedPolicyholder.phFirstName &&
        driverAnswerGroup.answers.driverLastName === parsedPolicyholder.phLastName &&
        driverAnswerGroup.answers.driverDob === parsedPolicyholder.phDob);
      if (matchingDriverAnswerGroup) {
        dispatch(upsertAnswerForFieldName("driverPolicyholder", policyholderAnswerGroupId, { value: matchingDriverAnswerGroup.id }));
        driverPolicyholders.push(matchingDriverAnswerGroup.id);
      }

      /*
        Manually populate phAddressSelection: check if any vehicles share the same address as this policyholder
        Same potential for error as driverPolicyholder - see above note
      */
      const vehicleAnswerGroups = answerGroups(getState(), "vehicle");
      const matchingVehicleAnswerGroup = vehicleAnswerGroups.find(vehicleAnswerGroup =>
        vehicleAnswerGroup.answers.vehicleAptNumber === parsedPolicyholder.phPostalAptNumber &&
        vehicleAnswerGroup.answers.vehicleStreetNumber === parsedPolicyholder.phPostalStreetNumber &&
        vehicleAnswerGroup.answers.vehicleStreetName === parsedPolicyholder.phPostalStreetName &&
        vehicleAnswerGroup.answers.vehicleSuburb === parsedPolicyholder.phPostalSuburb &&
        vehicleAnswerGroup.answers.vehicleState === parsedPolicyholder.phPostalState &&
        vehicleAnswerGroup.answers.vehiclePostcode === parsedPolicyholder.phPostalPostcode);
      if (matchingVehicleAnswerGroup) {
        dispatch(upsertAnswerForFieldName("phAddressSelection", policyholderAnswerGroupId, { value: matchingVehicleAnswerGroup.id }));
      }
    })

    // Populate driverPolicyholders answer - this is a top-level field not related to an answer group
    dispatch(upsertAnswerForFieldName("driverPolicyholders", undefined, { value: driverPolicyholders }));

    // Populate top-level policy fields
    /*
      NOTE:
      This is a potential source for errors.
      The fields we update in Socotra like acceptPrivacy are returned here with others like grossPremium which are not in our question set payload,
      so need to make sure we don't use something like grossPremium as a field name in our question set payload unless it is actually a field to be populated here
    */
    dispatch(createAnswersFromObject(policySummary.policy));

    try {
      await Promise.all(getVehicleDetailsPromises);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject("Error fetching vehicle details from RedBook");
    }
  }
}

export function setEditPolicy(policyId) {
  return {
    type: 'EDIT_POLICY',
    payload: policyId
  }
}

function setFormType(formType) {
  return {
    type: SET_FORM_TYPE,
    payload: formType
  }
}

function createFormRequest() {
  return {
    type: CREATE_FORM_REQUEST
  }
}

function createFormSuccess() {
  return {
    type: CREATE_FORM_SUCCESS
  }
}

export function createQuoteForm() {
  return async dispatch => {
    try {
      dispatch(createFormRequest())
      dispatch(resetForm());
      dispatch(setFormType("Quote"));
      const questionSetPayload = await dispatch(getQuestionSet());
      dispatch({
        type: CREATE_QUOTE_AND_BUY_FORM,
        payload: questionSetPayload
      })
      dispatch(createFormSuccess());
    } catch (error) {
      dispatch({ type: 'CREATE_FORM_ERROR' });
      console.error(error);
    }
  }
}

export function createEndorsementForm(policyId) {
  return async (dispatch, getState) => {
    try {
      dispatch(createFormRequest())
      dispatch(resetForm());
      dispatch(setFormType("Endorsement"));
      dispatch(setEditPolicy(policyId));
      const questionSetPayload = await dispatch(getQuestionSet());
      dispatch({
        type: CREATE_ENDORSEMENT_FORM,
        payload: questionSetPayload
      })
      const policy = policyByIdSelector(getState(), policyId);
      dispatch(setPreviousPrices(policy.invoices));
      await dispatch(populateEndorsementForm(policyId));
      dispatch(clearPolicyChanges());
      dispatch(createFormSuccess());
    } catch (error) {
      dispatch({ type: 'CREATE_FORM_ERROR' });
      console.error(error);
    }
  }
}


export function createContactForm() {
  return async dispatch => {
    try {
      dispatch(createFormRequest())
      dispatch(resetForm());
      dispatch(setFormType("Contact"));
      const questionSetPayload = await dispatch(getQuestionSet());
      dispatch({
        type: CREATE_CONTACT_FORM,
        payload: questionSetPayload
      })
      dispatch(createFormSuccess());
    } catch (error) {
      dispatch({ type: 'CREATE_FORM_ERROR' });
      console.error(error);
    }
  }
}

export function createClaimsForm() {
  return async dispatch => {
    try {
      dispatch(createFormRequest())
      dispatch(resetForm());
      dispatch(setFormType("Claims"));
      const questionSetPayload = await dispatch(getQuestionSet());
      dispatch({
        type: CREATE_CLAIMS_FORM,
        payload: questionSetPayload
      })
      dispatch(createFormSuccess());
    } catch (error) {
      dispatch({ type: 'CREATE_FORM_ERROR' });
      console.error(error);
    }
  }
}

// this function updates socotra with the new changes that have been implemented since last time
// and then if it's safe to do so will make a pricing request to get a new price from socotra
export function updateAndGetPrice() {
  return async (dispatch, getState) => {
    const formType = formTypeSelector(getState());

    switch (formType) {
      case "Quote":
        await dispatch(shouldUpdateQuote());

        if (isSafeToGetPrice(getState())) {
          console.debug('is safe to clearReduxPricingQuote()');
          dispatch(getQuotePrice());
        } else {
          console.warn('is NOT safe to clearReduxPricingQuote()');
          console.warn('resetting price ...');
          dispatch(clearReduxPricingQuote());
          Promise.reject("not safe to get price");
        }

        break;

      case "Endorsement":
        await dispatch(updateEndorsement());
        await dispatch(getEndorsementPrice());
        break;
    }
  }
}
