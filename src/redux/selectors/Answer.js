import { orm } from "../orm";
import { createSelector } from "redux-orm";
import { dbStateSelector } from "../selectors";

export const getAnswersForFieldIds = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, fieldIds) => {
    let answersToReturn = [];

    fieldIds.forEach(id => {
      session.Answer.all()
      .filter({ field: id })
      .toModelArray()
      .forEach(answer => answersToReturn.push(answer.ref))
    })

    return answersToReturn;
  }
)

export const getGlobalAnswerByFieldName = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, props) => {
    return session.Answer.all().filter({ fieldName: props.fieldName })
  }
)

export const getAnswersWithThisValue = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, props) => {
    return session.Answer.all().filter({ value: props.value }).toRefArray()
  }
)
