import { orm } from "../orm";
import { createSelector } from "redux-orm";
import { dbStateSelector } from "../selectors";

export const previousPricesArraySelector = state => state.pricing.previousPrices;

// totalChange is undefined for quote and buy
// export const amountDueSelector = state => parseFloat(state.pricing.newPrice && (state.pricing.newPrice.policy.totalChange || state.pricing.newPrice.policy.total));

export const amountDueSelector = state => {
  switch (state.response.type) {
    case 'Quote':
      return state.pricing.quote.policy.premiumPayable;

    case 'Endorsement':
      return state.pricing.endorsement.totalChange;
  }

}

export const isSafeToGetPrice = createSelector(
  orm,
  dbStateSelector,
  session => {
    const ags = session.AnswerGroup.all().toModelArray()
    const agags = session.AnswerGroupAnswerGroups.all().toModelArray();
    const vehicles = ags.filter(ag => ag.fieldName === 'vehicle');

    const allVehiclesHaveDrivers = vehicles.every(vehicle => {
      return agags.some(agag => {
        return agag.toAnswerGroupId === vehicle.id
      })
    });

    const isSafe = allVehiclesHaveDrivers; // TODO add more conditions

    return isSafe;
  }
)
