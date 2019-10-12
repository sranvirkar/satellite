import { 
  answersDataSelector,
  fieldsSelector } from "redux/selectors";
import { 
  SUBMIT_CLAIM_REQUEST, 
  SUBMIT_CLAIM_SUCCESS } from "redux/actionTypes";
import { constructWebToCasePayload } from "redux/utils";

export function submitClaim() {
  return (dispatch, getState) => {
    const answersData = answersDataSelector(getState());
    const fields = fieldsSelector(getState());
    const fieldsMap = fields.reduce((accumulator, currentValue) => { accumulator[currentValue.name] = currentValue; return accumulator; } , {});
    console.log('claim payload before conversion', answersData);
    const claimPayload = constructWebToCasePayload(answersData, "Claims", fieldsMap);
    console.log('claim payload', claimPayload);

    // TODO: file attachments

    // webToCaseUrl is a global variable
    fetch(webToCaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: claimPayload,
      mode: "no-cors"
    })
    .then(response => {
      console.log('success posting claim form', response);
      dispatch(submitClaimSuccess());
    })
    .catch(error => console.log('error posting claim form', error));
  }
}

function submitClaimRequest() {
  return {
    type: SUBMIT_CLAIM_REQUEST
  }
}

function submitClaimSuccess() {
  return {
    type: SUBMIT_CLAIM_SUCCESS
  }
}
