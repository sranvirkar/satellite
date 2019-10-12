import { combineReducers } from "redux";
import orm from "../orm";
import { createReducer } from "redux-orm";

import quoteAndBuyNavigation from "./quoteAndBuyNavigation";
import loading from "./loading";
import error from "./error";
import response from "./response";
import policyChanges from "./policyChanges";
import oss from "./oss";
import pricing from "./pricing";

export default combineReducers({
  db: createReducer(orm),
  quoteAndBuyNavigation,
  loading,
  error,
  response,
  policyChanges,
  oss,
  pricing
});
