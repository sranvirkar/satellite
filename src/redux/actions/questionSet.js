import {
  GET_QUESTION_SET_REQUEST,
  GET_QUESTION_SET_SUCCESS,
  GET_QUESTION_SET_ERROR
} from "redux/actionTypes";
import {
  formTypeSelector } from "redux/selectors";
import fetch from "unfetch";

function getQuestionSetPath(formType) {
  switch (formType) {
    case "Quote":
      return questionSetPath;

    case "Endorsement":
      return questionSetPath;

    case "Claims":
      return claimsQuestionSetPath;

    case "Contact":
      return contactUsQuestionSetResourceName;
  }
}

export function getQuestionSet() {
  return async (dispatch, getState) => {
    const formType = formTypeSelector(getState());
    const path = getQuestionSetPath(formType);

    try {
      dispatch(getQuestionSetRequest());
      const questionSetPayload = await fetch(path);
      dispatch(getQuestionSetSuccess());
      return Promise.resolve(questionSetPayload.json());
    } catch (error) {
      dispatch(getQuestionSetError());
      return Promise.reject("Error: Get Question Set: " + JSON.stringify(error));
    }
  }
}

function getQuestionSetRequest() {
  return {
    type: GET_QUESTION_SET_REQUEST
  }
}

function getQuestionSetSuccess() {
  return {
    type: GET_QUESTION_SET_SUCCESS
  }
}

function getQuestionSetError(errorMessage) {
  return {
    type: GET_QUESTION_SET_ERROR,
    payload: errorMessage
  }
}
