import { orm } from "../orm";
import { createSelector } from "redux-orm";
import { dbStateSelector } from "../selectors";

// doubleup of getAnswerGroupData in redux/selectors.js, move to here
const getAnswerGroupData = (answerGroup, excludeFromResponsePayload, dataSource, useDataSourceFieldnames, excludeEmptyString) => {
  let data = {};
  const exclude = excludeFromResponsePayload ? { excludeFromResponsePayload: undefined } : {};
  const source = dataSource === null || dataSource === undefined ? {} : { dataSource };
  answerGroup.answers.filter({ ...exclude, ...source }).toRefArray().forEach(answer => {
    if (answer.fieldName !== undefined && answer.fieldName !== null) {
      if (excludeEmptyString && answer.value === "") {
        // skip
      } else {
        if (useDataSourceFieldnames && answer.dataSourceFieldname) {
          data[answer.dataSourceFieldname] = answer.value;
        } else {
          data[answer.fieldName] = answer.value;
        }
      }

    }
  });
  return data;
}

export const getDriverAGIdsForVehicle = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, vehicleId) => {
    let driverAnswerGroupIds = [];

    const vehicleDriverAnswerGroupAnswerGroupsTo = session.AnswerGroupAnswerGroups.all().filter(agag => agag.toAnswerGroupId == vehicleId).toRefArray();
    driverAnswerGroupIds.push(...vehicleDriverAnswerGroupAnswerGroupsTo.map(obj => obj.fromAnswerGroupId));

    const vehicleDriverAnswerGroupAnswerGroupsFrom = session.AnswerGroupAnswerGroups.all().filter(agag => agag.fromAnswerGroupId == vehicleId).toRefArray();
    driverAnswerGroupIds.push(...vehicleDriverAnswerGroupAnswerGroupsFrom.map(obj => obj.toAnswerGroupId));

    return driverAnswerGroupIds;
  }
)

export const getAnswerGroupsByEntity = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, props) => {
    return session.AnswerGroup.all().filter(ag => ag.entity == props.entity).toRefArray();
  }
)

export const getAnswerGroupsByFieldName = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, props) => {
    if (props.fieldName === null || props.fieldName === undefined) return [];
    const answerGroups = session.AnswerGroup.all().filter({ fieldName: props.fieldName }).toModelArray();
    return answerGroups.map(answerGroup => Object.assign({}, answerGroup.ref, { answers: getAnswerGroupData(answerGroup, true) }));
  }
);
