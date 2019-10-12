import moment from 'moment';
import { answerById, selectedAnswerGroups, answerByFieldNameAndAnswerGroup, fieldByName, answerGroups } from "redux/selectors";
import { getAnswersWithThisValue } from "redux/selectors/Answer";
import { apexActionPromise } from "redux/actions";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { getDriverAGIdsForVehicle, getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";

export function userFormattedDate(value) { // this is to convert YYYY-MM-DD back to DD/MM/YYYY just for regex testing purposes
  return /^(\d{4}-\d{2}-\d{2})$/g.test(value) ? moment(value, "YYYY-MM-DD").format("DD/MM/YYYY") : value;
}

export async function validation(rules, value, state, answerGroupId, dispatch) {
  if (rules && rules.find(r => r.type === "optional" && value === "")) { return [];};

  if (!rules) {
    return false;
  }

  return await Promise.all(rules.map(rule => {
    switch(rule.type) {
      case "max":
        return max(rule, value);

      case "min":
        return min(rule, value);

      case "dateValid":
        return dateValid(rule, value);

      case "dateMax":
        return dateMax(rule, value);

      case "dateMin":
        return dateMin(rule, value);

      case "regex":
        return regex(rule, value);

      case "groupRelationshipsMin":
        return groupRelationshipsMin(rule, state, answerGroupId);

      case "vehicleMinDrivers":
        return vehicleMinDrivers(rule, state, answerGroupId);

      case "groupMinPolicyholder":
        return groupMinPolicyholder(rule, state);

      case "subFields":
        return validateSubFields(rule, value, state, answerGroupId);

      case "isUniqueEmail":
        return isUniqueEmail(rule, value, state, answerGroupId, dispatch);

      case "isUniqueValue":
        return isUniqueValue(rule, value, state, answerGroupId);


      default:
        return false;
    }
  }));
}

async function validateSubFields(rule, value, state, answerGroupId) {

  // this might be able to be refactored, but i'm defining a const here because I want to be able to 'return'
  // something so I'm using 'const' and 'await' to be able to wait for a bunch of stuff, and then using the
  // new Promise's resolve callback, resolving back to this parent level once the subField calcs are done
  const arrayOfSubFieldsErrors = await new Promise(async (resolve, reject) => {

    await Promise.all(rule.fields.map(async fieldName => {
      const answer = answerByFieldNameAndAnswerGroup(state, { fieldName: fieldName, answerGroup: answerGroupId }) || '';
      const field = fieldByName(state, fieldName);

      // await the validation response for the indidividual subfield
      const subFieldErrorMessages = await validation(
        field.validations,
        answer.value || '',
        state,
        answerGroupId
      );

      //after you've got the subFieldErrorMessages, return the relevant (the first) errorMessage
      return subFieldErrorMessages && subFieldErrorMessages.some(e => e) ? field.validations[0].errorMessage : false;

    })).then(data => {
      // only resolve the Promise from arrayOfSubFieldsErrors once the Promise.all is finished
      resolve(data);
    });
  });

  // after all the subField calculations, if there are any errorMessages in the array, return the top level errorMessage
  return arrayOfSubFieldsErrors.filter(e => e).length > 0 ? rule.errorMessage : false;
};


async function isUniqueEmail(rule, value, state, answerGroupId, dispatch) {
  const result = await apexActionPromise('userExists', value);
  dispatch(
    upsertAnswerForFieldName(
      'emailMatchRedirect',
      answerGroupId,
      { value: result.payload }
    )
  );
  return result.payload ? true : false;
}

async function isUniqueValue(rule, value, state, answerGroupId) {
  const answers = getAnswersWithThisValue(state, {value: value});
  const answersFromOtherAGs = answers.filter(a => a.answerGroup !== answerGroupId);
  return answersFromOtherAGs.length > 0 ? rule.errorMessage : false;
}

async function max(rule, value) {
  return Number(value) > Number(rule.number) ? rule.errorMessage : false;
}

async function min(rule, value) {
  return Number(value) < Number(rule.number) ? rule.errorMessage : false;
}

async function regex(rule, value) {
  return RegExp(rule.string).test(value) ? false : rule.errorMessage;
}

async function groupRelationshipsMin(rule, state, answerGroupId) {
  const answerGroups = selectedAnswerGroups(state, answerGroupId);
  return answerGroups.length ? false : rule.errorMessage;
}

async function vehicleMinDrivers(rule, state, answerGroupId) {
  const allVehicles = getAnswerGroupsByFieldName(state, { fieldName: "vehicle" }).map(v => v.id);
  return allVehicles.some(id => getDriverAGIdsForVehicle(state, id).length < 1) ? rule.errorMessage : false;
}

async function groupMinPolicyholder(rule, state) {
  const answerGroupsPolicyholders = answerGroups(state, 'policyHolder');
  return answerGroupsPolicyholders.length ? false : rule.errorMessage;
}

async function dateValid(rule, value) {
  const { errorMessage } = rule;
  const userEntry = moment(value, "DD/MM/YYYY");

  return !userEntry.isValid() ? errorMessage : false;
}

async function dateMax(rule, value) {
  const { number, unit, errorMessage } = rule;
  const userEntry = moment(value, "DD/MM/YYYY");

  let modifiedErrorMessage = errorMessage;

  if (modifiedErrorMessage.indexOf("${number}")) {
    modifiedErrorMessage = modifiedErrorMessage.replace("${number}", number);
  }

  if (modifiedErrorMessage.indexOf("${unit}")) {
    modifiedErrorMessage = modifiedErrorMessage.replace("${unit}", unit);
  }

  if (!userEntry.isValid() || value.length !== 10) { return; }

  return userEntry.isAfter(moment().add(number, unit), "day") ? modifiedErrorMessage : false;
}

async function dateMin(rule, value) {
  const { number, unit, errorMessage } = rule;
  const userEntry = moment(value, "DD/MM/YYYY");

  let modifiedErrorMessage = errorMessage;
  if (modifiedErrorMessage.indexOf("${number}")) {
    modifiedErrorMessage = modifiedErrorMessage.replace("${number}", number);
  }

  if (modifiedErrorMessage.indexOf("${unit}")) {
    modifiedErrorMessage = modifiedErrorMessage.replace("${unit}", unit);
  }

  if (!userEntry.isValid() || value.length !== 10) { return; }

  return userEntry.isBefore(moment().add(number, unit), "day") ? modifiedErrorMessage : false;
}
