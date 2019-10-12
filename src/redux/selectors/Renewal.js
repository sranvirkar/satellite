import { orm } from "../orm";
import { createSelector } from "redux-orm";
import { dbStateSelector } from "../selectors";

// POSSIBLE RENEWAL STATUSES
// application, accepted, invalidated, issued, discarded

// RENEWAL STATUS HAPPY PATH
// applciation --> accepted --> issued

export const renewalsByPolicyIdSelector = (state, policyId) => state.oss.renewalsByPolicyId[policyId];

export const nextRenewalSelector = (state, policyId) =>
  state.oss.renewalsByPolicyId[policyId].find(renewal => renewal.state === "accepted");


export const renewalByPolicyAndInvoiceId = (state, policyId, invoiceId) => {
  const renewals = renewalsByPolicyIdSelector(state, policyId);
  return renewals.find(renewal => renewal.invoice.locator === invoiceId);
}
