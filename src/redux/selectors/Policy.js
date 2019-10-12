import { orm } from "../orm";
import { createSelector } from "redux-orm";
import { dbStateSelector } from "../selectors";

export const getFirstPolicy = createSelector(
  orm,
  dbStateSelector,
  session => session.Policy.first() && session.Policy.first().ref
);

export const policyChangesSelector = state => state.policyChanges;
