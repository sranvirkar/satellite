import { 
  ADD_PERIL, 
  REMOVE_PERIL, 
  DELETE_PERIL } from "redux/actionTypes";
import { perilByNameAndAnswerGroup } from "redux/selectors";

export function addPeril(answerGroupId, value, perilLocator) {
  return {
    type: ADD_PERIL,
    payload: {
      answerGroupId,
      value,
      perilLocator
    }
  }
}

export function removePeril(answerGroupId, value) {
  return (dispatch, getState) => {
    const peril = perilByNameAndAnswerGroup(getState(), { name: value, answerGroupId });

    // TODO: document difference between these two actions
    dispatch({
      type: REMOVE_PERIL,
      payload: {
        answerGroupId,
        value: peril.perilLocator ? peril.perilLocator : value
      }
    });

    dispatch({
      type: DELETE_PERIL,
      payload: {
        answerGroupId,
        value
      }
    })
  }
}