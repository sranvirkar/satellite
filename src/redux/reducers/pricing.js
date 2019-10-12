import {

  SET_PRICING_QUOTE,
  CLEAR_PRICING_QUOTE,

  SET_PRICING_ENDORSEMENT,
  CLEAR_PRICING_ENDORSEMENT,

  SET_PRICING_RENEWALS

} from "redux/actionTypes";

const initialState = {
  quote: null,
  endorsement: null,
  renewalsByPolicyId: null,
};

const pricing = (state = initialState, action) => {
  switch (action.type) {

    case SET_PRICING_QUOTE: {
      const exposures = {};

      action.payload[0].policy.vehicle.forEach(vehicle => {
        exposures[vehicle.vehicleId] = vehicle.vehiclePremium;
      })

      return Object.assign({}, state, {
        quote: {
          quoteId: action.payload[0].quoteId,
          versionId: action.payload[0].versionId,
          policy: action.payload[0].policy.policyPremium,
          exposures: exposures
        }
      })
    }

    case CLEAR_PRICING_QUOTE: {
      return Object.assign({}, state, {
        quote: null
      })
    }

    case SET_PRICING_ENDORSEMENT: {

      const endorsement = action.payload;
      const exposures = {};

      endorsement.exposurePrices.forEach(vehicle => {
        exposures[vehicle.locator] = vehicle;
        exposures[vehicle.locator].premiumPayable = Number(vehicle.newGrossPremium) + Number(vehicle.newGrossTaxes) + Number(vehicle.newGrossCommissions);
      })

      endorsement.exposures = exposures;
      delete endorsement.exposurePrices
      delete endorsement.commissions

      return Object.assign({}, state, {
        endorsement: endorsement
      })
    }

    case CLEAR_PRICING_ENDORSEMENT:
      return Object.assign({}, state, {
        endorsement: null
      })

    case SET_PRICING_RENEWALS: {
      return Object.assign({}, state, {
        renewalsByPolicyId: action.payload
      })
    }

    default:
      return state;

  }
}

export default pricing;
