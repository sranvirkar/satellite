import {
  SET_PRICING_ENDORSEMENT
} from "redux/actionTypes";

export function setReduxPricingEndorsement(object) {
  return async (dispatch) => {
    dispatch({
      type: SET_PRICING_ENDORSEMENT,
      payload: object
    })
  }
}
