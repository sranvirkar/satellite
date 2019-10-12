export const quotePolicyPriceSelector = state => {
  return state.pricing.quote
      && state.pricing.quote.policy
}

export const quoteVehiclePremiumSelector = (state, exposureCharacteristicsLocator) => {
  return state.pricing.quote
      && state.pricing.quote.exposures
      && state.pricing.quote.exposures[exposureCharacteristicsLocator].premiumPayable
}
