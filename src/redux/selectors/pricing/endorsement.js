export const endorsementPolicyPriceSelector = state => {
  return state.pricing.endorsement
}

export const endorsementVehiclePriceSelector = (state, exposureLocator) => {
    return state.pricing.endorsement
        && state.pricing.endorsement.exposures
        && state.pricing.endorsement.exposures[exposureLocator]
        && Number(state.pricing.endorsement.exposures[exposureLocator])
}

export const endorsementVehiclePremiumSelector = (state, exposureLocator) => {
    return state.pricing.endorsement
        && state.pricing.endorsement.exposures
        && state.pricing.endorsement.exposures[exposureLocator]
        && Number(state.pricing.endorsement.exposures[exposureLocator].premiumPayable)
}
