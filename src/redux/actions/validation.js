import { upsertAnswer } from "redux/actions/orm/Answer";
import { userFormattedDate, validation } from "helpers/fieldValidations";
import { getFieldById } from "redux/selectors/Field";

export function validateAnswer(newAnswer, answer, shouldUpdateAnswer) {
  return async (dispatch, getState) => {
    const field = getFieldById(getState(), answer.field);
    const answerGroupId = answer.answerGroup;

    let value = newAnswer;

    if (field.type === "date-single-day" || field.type === "date") {
      value = userFormattedDate(value);
    }

    return await validation(
      field.validations,
      value,
      getState(),
      answerGroupId,
      e => dispatch(e),
    ).then(data => {
      const errorMessages = data ? data.filter(e => e) : data;
      const thereAreNoErrors = errorMessages === undefined || errorMessages.length == 0 || errorMessages === false;
      const thereAreNoErrorsBeingDisplayed = answer.validationErrors && answer.validationErrors.length == 0;
      const errorMessagesArraysAreTheSame = answer.validationErrors & errorMessages ?
            answer.validationErrors.length === errorMessages.length : true;
      const answersAreTheSame = newAnswer === value;

      if (
        !shouldUpdateAnswer &&
        thereAreNoErrors &&
        answersAreTheSame &&
        thereAreNoErrorsBeingDisplayed) {
        return;
      }

      if (
        shouldUpdateAnswer ||
        errorMessagesArraysAreTheSame ||
        !answersAreTheSame) {

        const answerModelUpdates = Object.assign(
          {},
          answer,
          {
            validationErrors: errorMessages.length ? errorMessages : false,
          },
          shouldUpdateAnswer ? {
            value: newAnswer
          } : {}
        );

        dispatch(
          upsertAnswer(answerModelUpdates)
        );
      }

      if (errorMessages.length) {
        return Promise.reject();
      } else {
        return Promise.resolve();
      }

    });
  }
}
