// export const quotePolicyPriceSelector = state => {
//   return state.pricing.quote
//       && state.pricing.quote.policy
// }

export const renewalVehiclePremiumSelector = (state, policyId, exposureCharacteristicsLocator) => {
  if (!policyId) return;

  const price = state.pricing.renewalsByPolicyId
              && state.pricing.renewalsByPolicyId[policyId]
              && state.pricing.renewalsByPolicyId[policyId].find(r => r.state == "accepted")
              && state.pricing.renewalsByPolicyId[policyId].find(r => r.state == "accepted").price
              && state.pricing.renewalsByPolicyId[policyId].find(r => r.state == "accepted").price.exposurePrices
              && state.pricing.renewalsByPolicyId[policyId].find(r => r.state == "accepted").price.exposurePrices.find(e => e.locator == exposureCharacteristicsLocator)

  if (!price) return 0;

  return Number(price.newGrossPremium) + Number(price.newGrossTaxes) + Number(price.newGrossCommissions);
}
