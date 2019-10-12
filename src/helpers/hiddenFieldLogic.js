// import { getConditionsArrayByFieldId } from "redux/selectors/Condition";
import { getAnswersForFieldIds } from "redux/selectors/Answer";

export function filterOutHiddenFields(getState, fieldsArray) {
  // const filteredFieldsArray = fieldsArray.filter(field => {
  //   // is this field visible/relevant right now? (does it need to be validated?)
  //   // const conditionsForThisField = getConditionsArrayByFieldId(getState(), field.id);
  //   if (!conditionsForThisField) { return field; }
  //
  //   return conditionsForThisField.filter(condition => {
  //     // console.log('checking condition:', condition.id);
  //
  //     //for each condition model
  //     const answersFromControllingFields = getAnswersForFieldIds(getState(), [condition.controllingField]);
  //
  //     // 1 iteration here for each Answer Group
  //     const answersWhichFulfilTheCondition = answersFromControllingFields.filter(answer => {
  //       if (condition.operator === "!==") {
  //         return !condition.values.includes(answer.value);
  //       } else {
  //         // in the default case, return true if the controlling Answer in this AG is one of the condition.values
  //         return condition.values.includes(answer.value);
  //       }
  //     });
  //
  //     if (answersWhichFulfilTheCondition.length > 0) {
  //       console.log('including validation of answers:', answersWhichFulfilTheCondition);
  //     }
  //
  //     return answersWhichFulfilTheCondition.length == 0;
  //   }).length == 0;
  // });

  // return filteredFieldsArray;
  return fieldsArray;
}
