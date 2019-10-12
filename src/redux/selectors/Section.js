import { orm } from "../orm";
import { createSelector } from "redux-orm";
import { dbStateSelector } from "../selectors";

export const getAllSections = createSelector(
  orm,
  dbStateSelector,
  session => session.Section.all().toRefArray().filter(s => !s.hidden)
)

export const getSectionById = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerId) => (
    session &&
    session.Section &&
    session.Section.withId(answerId) &&
    session.Section.withId(answerId).ref
  )
)


export const getAllSectionsForPolicy = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.policy,
  (session, policy) => {

    return policy && session.Section.all()
      .filter(section => section.policy === policy.name).toRefArray().filter(s => !s.hidden);
  }
)

export const isShowingSupportLinks = createSelector(
  orm,
  dbStateSelector,
  session => {
    const decidingField = 'vehicleAddressIsSelected';
    const vehicleAnswerGroups = session.AnswerGroup.all().filter(ag => ag.fieldName === 'vehicle').toRefArray();
    const decidingAnswerGroup = vehicleAnswerGroups.length > 0 ? vehicleAnswerGroups[0] : false;

    if (typeof decidingAnswerGroup === 'boolean') {
      return true;
    } else {
      const filteredAnswers = session.Answer.all().filter(a => a.fieldName == decidingField && a.answerGroup == decidingAnswerGroup.id).toRefArray();
      return !filteredAnswers.length ? true : filteredAnswers[0].value;
    }
  }
)
