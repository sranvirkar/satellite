import {
  GET_POLICY_AND_POLICYHOLDER_IDS_REQUEST,
  GET_POLICY_AND_POLICYHOLDER_IDS_SUCCESS,
  GET_POLICY_AND_POLICYHOLDER_IDS_ERROR,
  GET_POLICY_REQUEST,
  GET_POLICY_SUCCESS,
  GET_POLICY_ERROR,
  GET_POLICYHOLDERS_REQUEST,
  GET_POLICYHOLDERS_SUCCESS,
  GET_POLICYHOLDERS_ERROR,
  GET_POLICIES_AND_POLICYHOLDERS_REQUEST,
  GET_POLICIES_AND_POLICYHOLDERS_SUCCESS,
  GET_POLICIES_AND_POLICYHOLDERS_ERROR } from "redux/actionTypes";
import { apexRequestPromise, apexActionPromise } from "redux/actions";

import { setReduxPricingRenewals } from "redux/actions/pricing/renewals";
import { getRenewals } from "redux/actions/payment";

// Get an array of { policyId, policyholderId } from Salesforce for this user
export function getPolicyAndPolicyholderIds() {
  return async dispatch => {
    try {
      dispatch(getPolicyAndPolicyholderIdsRequest());
      const result = await apexActionPromise('getPolicies');

      if (result.length > 1) {
        console.error('there are more than 1 policies, this is a problem because with the way we store policyIds in window.dataLayer and recall them for security');
      }

      result.policies.forEach(policy => {

        Object.keys(policy).forEach(key => {

        window.dataLayer = window.dataLayer.filter(foo => foo.name !== key);

        window.dataLayer.push({
            event: 'insightech-cid',
            name: key,
            value: policy[key]
          });
        })
      });

      dispatch(getPolicyAndPolicyholderIdsSuccess());
      return Promise.resolve(result.policies);
    } catch (error) {
      dispatch(getPolicyAndPolicyholderIdsError());
      return Promise.reject('Error: Get Policy And Policyholder Ids: ' + error);
    }
  }
}

function getPolicyAndPolicyholderIdsRequest() {
  return {
    type: GET_POLICY_AND_POLICYHOLDER_IDS_REQUEST
  }
}

function getPolicyAndPolicyholderIdsSuccess() {
  return {
    type: GET_POLICY_AND_POLICYHOLDER_IDS_SUCCESS
  }
}

function getPolicyAndPolicyholderIdsError() {
  return {
    type: GET_POLICY_AND_POLICYHOLDER_IDS_ERROR
  }
}

// Returns policy data from Socotra given the policy id
export function getPolicy(policyId) {
  return async (dispatch, getState) => {
    const headers = {
      policyId
    }

    try {
      dispatch(getPolicyRequest());
      const policy = await apexRequestPromise('Get Policy', 'GET', headers, '');
      dispatch(getPolicySuccess());
      return Promise.resolve(policy);
    } catch (error) {
      dispatch(getPolicyError());
      return Promise.reject('Error: Get Policy: ' + JSON.stringify(error));
    }
  }
}

function getPolicyRequest() {
  return {
    type: GET_POLICY_REQUEST
  }
}

function getPolicySuccess() {
  return {
    type: GET_POLICY_SUCCESS
  }
}

function getPolicyError() {
  return {
    type: GET_POLICY_ERROR
  }
}

// Returns policyholder data from Salesforce given the Socotra policyholder id
export function getPolicyholders(policyholderId) {
  return async dispatch => {
    try {
      dispatch(getPolicyholdersRequest());
      const policyholders = await apexActionPromise('getPolicyholders', policyholderId);
      dispatch(getPolicyholdersSuccess());
      return Promise.resolve(policyholders);
    } catch (error) {
      dispatch(getPolicyholdersError());
      return Promise.reject('Error: Get Policyholders: ' + error);
    }
  }
}

function getPolicyholdersRequest() {
  return {
    type: GET_POLICYHOLDERS_REQUEST
  }
}

function getPolicyholdersSuccess() {
  return {
    type: GET_POLICYHOLDERS_SUCCESS
  }
}

function getPolicyholdersError() {
  return {
    type: GET_POLICYHOLDERS_ERROR
  }
}

// Get all policy and policyholder data
export function getPoliciesAndPolicyholders() {
  return async (dispatch) => {
    dispatch(getPoliciesAndPolicyholdersRequest());

    try {
      // Gives back an array of { policyId, policyholderId } (Socotra ids/locators)
      const policyAndPolicyholderIds = await dispatch(getPolicyAndPolicyholderIds());
      // console.log('policyAndPolicyholderIds', policyAndPolicyholderIds);

      const policyIds = policyAndPolicyholderIds.map(obj => obj.policyId);
      const uniquePolicyholderIds = [...new Set(policyAndPolicyholderIds.map(obj => obj.policyholderId))];
      // console.log('uniquePolicyholderIds', uniquePolicyholderIds);

      // FUTURE FIX? Can probably combine the three Promise.all() below into one

      // Get the actual Socotra data for each policy
      const policies = await Promise.all(policyIds.map(policyId => dispatch(getPolicy(policyId))));
      // console.log('policies', policies);

      // Get the actual Salesforce data for each policyholder
      const policyholders = await Promise.all(uniquePolicyholderIds.map(policyholderId => dispatch(getPolicyholders(policyholderId))));
      // console.log('policyholders', policyholders);

      // Get renewals for each policy - this will provide next due date/payment information
      const renewals = await Promise.all(policyIds.map(policyId => dispatch(getRenewals(policyId))));
      // console.log('renewals', renewals);

      // Parse data into a nicer format
      const normalisedPolicies = {
        byId: policies.reduce((accumulator, currentValue) => {
          accumulator[currentValue.locator] = currentValue;
          return accumulator;
        }, {}),
        allIds: policyIds
      }
      // console.log('normalisedPolicies', normalisedPolicies);

      const policyholdersByPolicyId = policyholders.reduce((accumulator, currentValue, index) => {
        // Each item in the array is an array of policyholders for the corresponding Socotra policyholderId - get the policyId for this policyholderId
        const match = policyAndPolicyholderIds.find(obj => obj.policyholderId === uniquePolicyholderIds[index]);
        if (match) accumulator[match.policyId] = currentValue;
        return accumulator;
      }, {})
      // console.log('policyholdersByPolicyId', policyholdersByPolicyId);

      const renewalsByPolicyId = renewals.reduce((accumulator, currentValue, index) => {
        // Each item in the array is an array of renewals for the corresponding policyId
        const policyId = policyIds[index];
        accumulator[policyId] = currentValue;
        return accumulator;
      }, {})
      // console.log('renewalsByPolicyId', renewalsByPolicyId);

      dispatch(getPoliciesAndPolicyholdersSuccess(policyAndPolicyholderIds, normalisedPolicies, policyholdersByPolicyId, renewalsByPolicyId));
      dispatch(setReduxPricingRenewals(renewalsByPolicyId));
    } catch (error) {
      dispatch(getPoliciesAndPolicyholdersError());
      console.error(error);
    }
  }
}

function getPoliciesAndPolicyholdersRequest() {
  return {
    type: GET_POLICIES_AND_POLICYHOLDERS_REQUEST
  }
}

function getPoliciesAndPolicyholdersSuccess(policyAndPolicyholderIds, policies, policyholders, renewals) {
  return {
    type: GET_POLICIES_AND_POLICYHOLDERS_SUCCESS,
    payload: {
      policyAndPolicyholderIds,
      policies,
      policyholders,
      renewals
    }
  }
}

function getPoliciesAndPolicyholdersError() {
  return {
    type: GET_POLICIES_AND_POLICYHOLDERS_ERROR
  }
}
