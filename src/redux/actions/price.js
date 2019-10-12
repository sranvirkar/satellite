import {
  GET_QUOTE_PRICE_REQUEST,
  GET_QUOTE_PRICE_SUCCESS,
  GET_QUOTE_PRICE_ERROR,
  GET_ENDORSEMENT_PRICE_REQUEST,
  GET_ENDORSEMENT_PRICE_SUCCESS,
  GET_ENDORSEMENT_PRICE_ERROR,
  SET_PREVIOUS_PRICES } from "redux/actionTypes";

import {
  editPolicySelector,
  endorsementIdSelector,
  policyIdSelector,
  firstExposureWithNoLocatorSelector,
  exposuresSelector } from "redux/selectors";

import { updateAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { apexRequestPromise } from "../actions";

import { setReduxPricingQuote } from "redux/actions/pricing/quote";
import { setReduxPricingEndorsement } from "redux/actions/pricing/endorsement";

export function getQuotePrice() {
  return async (dispatch, getState) => {
    const headers = {
      policyId: policyIdSelector(getState())
    }

    try {
      dispatch({ type: GET_QUOTE_PRICE_REQUEST });

      const result = await apexRequestPromise('Quote Price', 'GET', headers, '');
      dispatch(setReduxPricingQuote(result));
      dispatch({ type: GET_QUOTE_PRICE_SUCCESS }); // pass payload through here instead of above

      return Promise.resolve();
    } catch (error) {

      dispatch({ type: GET_QUOTE_PRICE_ERROR });
      return Promise.reject("Error: Quote Price: " + JSON.stringify(error));
    }
  }
}

export function getEndorsementPrice() {
  return async (dispatch, getState) => {
    dispatch({ type: GET_ENDORSEMENT_PRICE_REQUEST });

    const headers = {
      policyId: editPolicySelector(getState()),
      endorsementId: endorsementIdSelector(getState())
    }

    try {
      const result = await apexRequestPromise('Endorsement Price', 'GET', headers, '');

      dispatch(setReduxPricingEndorsement(result));
      dispatch({ type: GET_ENDORSEMENT_PRICE_SUCCESS }); // pass payload through here instead of above

      return Promise.resolve();
    } catch (error) {

      dispatch({ type: GET_ENDORSEMENT_PRICE_ERROR });
      return Promise.reject("Error: Endorsement Price: " + JSON.stringify(error));
    }
  }
}

export function setPreviousPrices(previousPrices) {
  return {
    type: SET_PREVIOUS_PRICES,
    payload: previousPrices
  }
}
