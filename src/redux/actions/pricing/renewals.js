import {
  SET_PRICING_RENEWALS
} from "redux/actionTypes";

export function setReduxPricingRenewals(array) {
  return async (dispatch) => {
    dispatch({
      type: SET_PRICING_RENEWALS,
      payload: array
    })
  }
}
