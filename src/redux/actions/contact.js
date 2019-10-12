import {
  answersDataSelector,
  fieldsSelector } from "redux/selectors";
import {
  SUBMIT_CONTACT_US_REQUEST,
  SUBMIT_CONTACT_US_SUCCESS } from "redux/actionTypes";
import { constructWebToCasePayload } from "redux/utils";

export function submitContactUs() {
  return (dispatch, getState) => {
    const answersData = answersDataSelector(getState());
    const fields = fieldsSelector(getState());
    const fieldsMap = fields.reduce((accumulator, currentValue) => { accumulator[currentValue.name] = currentValue; return accumulator; } , {});
    console.log('contact us payload before conversion', answersData);
    const contactUsPayload = constructWebToCasePayload(answersData, "General Enquiries", fieldsMap);
    console.log('contact us payload', contactUsPayload);

    // TODO: file attachments

    // webToCaseUrl is a global variable
    fetch(webToCaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: contactUsPayload,
      mode: "no-cors"
    })
    .then(response => {
      console.log('success posting contact us form', response);
      dispatch(submitContactUsSuccess());
    })
    .catch(error => console.log('error posting contact us form', error));
  }
}

function submitContactUsRequest() {
  return {
    type: SUBMIT_CONTACT_US_REQUEST
  }
}

function submitContactUsSuccess() {
  return {
    type: SUBMIT_CONTACT_US_SUCCESS
  }
}
