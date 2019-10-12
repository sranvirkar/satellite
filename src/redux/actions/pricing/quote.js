import {
  SET_PRICING_QUOTE,
  CLEAR_PRICING_QUOTE
} from "redux/actionTypes";

export function setReduxPricingQuote(object) {
  return async (dispatch) => {
    dispatch({
      type: SET_PRICING_QUOTE,
      payload: object
    })
  }
}

export function clearReduxPricingQuote() {
  return async (dispatch) => {
    dispatch({
      type: CLEAR_PRICING_QUOTE
    })
  }
}
