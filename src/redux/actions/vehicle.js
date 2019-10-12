import { apexRequest, apexRequestPromise, clearFieldsInAnswerGroup } from "redux/actions";
import { updateAnswerGroup } from "redux/actions/orm/AnswerGroup"
import { upsertAnswer, upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { answerGroupById, answerByFieldNameAndAnswerGroup, fieldByName, answerGroupAllDataSelector } from "redux/selectors";
import { getNextAnswerId } from "redux/utils";
import { vehicleFieldsToRedBookMapping, vehicleUsagePerWeekToPredictedOdometerMapping } from "redux/mappings";
import { validateAnswer } from "redux/actions/validation";

export function getVehicleDetails(answerGroupId, prepopulateCallout) {
  return async (dispatch, getState) => {
    if (answerGroupId === null) return Promise.resolve();

    const vehicle = answerGroupById(getState(), answerGroupId);
    const vehicleLicensePlate = answerByFieldNameAndAnswerGroup(getState(), {fieldName: 'vehicleLicensePlate', answerGroup: answerGroupId});
    const vehicleRegistrationState = answerByFieldNameAndAnswerGroup(getState(), {fieldName: 'vehicleRegistrationState', answerGroup: answerGroupId});

    const payload = {
      regNumber: vehicleLicensePlate.value,
      regState: vehicleRegistrationState.value
    };

    // if these actions fail you get a Promise.reject inside validation.js
    await dispatch(validateAnswer(vehicleLicensePlate.value, vehicleLicensePlate, true));
    await dispatch(validateAnswer(vehicleRegistrationState.value, vehicleRegistrationState, true));

    try {

      const result = await apexRequestPromise('Vehicle Registration', 'GET', payload, '');
      // clear vehicle fields when vehicle has changed
      // TODO: check if previous value is the same?
      // const fieldsToClear = [
      //   "vehicleValue",
      //   "vehicleAccessoriesvalue",
      //   "vehicleTotalValue",
      //   "vehicleEquipment",
      //   "vehicleAccessories"
      // ];
      // dispatch(clearFieldsInAnswerGroup(fieldsToClear, answerGroupId));

      const mapping = vehicleFieldsToRedBookMapping;

      Object.keys(mapping).forEach(key => {
        const answer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: key, answerGroup: answerGroupId });
        const payloadValue = result[mapping[key]];
        if (answer) {
          dispatch(upsertAnswer(Object.assign({}, answer, {
            value: payloadValue === null || payloadValue === undefined ? '' : payloadValue.toString(),
            validationErrors: false
          })));
        } else {
          const field = fieldByName(getState(), key);
          dispatch(upsertAnswer({
            answerGroup: answerGroupId,
            id: getNextAnswerId(),
            field: field.id,
            fieldName: field.name,
            value: payloadValue === null || payloadValue === undefined ? '' : payloadValue.toString(),
            excludeFromResponsePayload: field.excludeFromResponsePayload,
            dataSource: field.dataSource,
            dataSourceFieldname: field.dataSourceFieldname
          }));
        }
      });

      // Store RedBook aftermarket accessories, options, standards, prices on vehicle
      const updatedVehicle = {
        id: answerGroupId,
        aftermarket: result.aftermarket,
        options: result.options,
        standards: result.standards,
        prices: result.prices,
        privateMin: result.privateMin,
        privateMax: result.privateMax
        // for vehicles > 10 years old, get default price
      }
      dispatch(updateAnswerGroup(updatedVehicle));

      // TODO: seriously...make this better
      // TODO: vehicle.answers.vehicleHasAccessories is either "Yes" or "No" not a boolean
      if (prepopulateCallout) {
        // parse vehicleAccessories and vehicleEquipment fields
        if (vehicle.answers.vehicleHasAccessories) {
          let vehicleAccessoriesJSON = vehicle.answers.vehicleAccessories;
          if (vehicleAccessoriesJSON && vehicleAccessoriesJSON !== "") {
            vehicleAccessoriesJSON = JSON.parse(vehicleAccessoriesJSON);
            const vehicleAccessories = vehicleAccessoriesJSON.map(accessory => String(result.aftermarket.findIndex(obj => obj.description === accessory.description)));
            const vehicleAccessoriesAnswer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'vehicleAccessories', answerGroup: vehicle.id });
            if (vehicleAccessoriesAnswer) {
              dispatch(upsertAnswer(Object.assign({}, vehicleAccessoriesAnswer, {
                value: vehicleAccessories
              })));
            } else {
              const field = fieldByName(getState(), "vehicleAccessories");
              dispatch(upsertAnswer({
                answerGroup: answerGroupId,
                id: getNextAnswerId(),
                field: field.id,
                fieldName: field.name,
                value: vehicleAccessories,
                excludeFromResponsePayload: field.excludeFromResponsePayload,
                dataSource: field.dataSource,
                dataSourceFieldname: field.dataSourceFieldname
              }));
            }
          }
        }

        if (vehicle.answers.vehicleHasEquipment) {
          let vehicleEquipmentJSON = vehicle.answers.vehicleEquipment;
          if (vehicleEquipmentJSON && vehicleEquipmentJSON !== "") {
            vehicleEquipmentJSON = JSON.parse(vehicleEquipmentJSON);
            const vehicleEquipment = vehicleEquipmentJSON.map(accessory => String(result.options.findIndex(obj => obj.description === accessory.description)));
            const vehicleEquipmentAnswer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'vehicleEquipment', answerGroup: vehicle.id });
            if (vehicleEquipmentAnswer) {
              dispatch(upsertAnswer(Object.assign({}, vehicleEquipmentAnswer, {
                value: vehicleEquipment
              })));
            } else {
              const field = fieldByName(getState(), "vehicleEquipment");
              dispatch(upsertAnswer({
                answerGroup: answerGroupId,
                id: getNextAnswerId(),
                field: field.id,
                fieldName: field.name,
                value: vehicleEquipment,
                excludeFromResponsePayload: field.excludeFromResponsePayload,
                dataSource: field.dataSource,
                dataSourceFieldname: field.dataSourceFieldname
              }));
            }
          }
        }
      }

      dispatch(updateVehicleTotalValue(answerGroupId));
      return Promise.resolve();
    } catch (error) {
      // No vehicle found with that rego and state
      if (error.statusCode === 404) {
        return Promise.reject("No results found. Please double check your plate.");
      } else {
        // Network error?
        dispatch({ type: "GET_VEHICLE_DETAILS_ERROR" });
        return Promise.reject("We are sorry we couldn't find your vehicle. Unfortunately we cannot offer you insurance for your vehicle at this time.");
      }
    }
  }
}

export function clearVehicleData(answerGroupId) {
  return (dispatch, getState) => {

    const clearData = (fieldName, answerGroupId) => {
      dispatch(upsertAnswer({
        id: answerByFieldNameAndAnswerGroup(getState(), { fieldName: fieldName, answerGroup: answerGroupId }).id,
        value: "",
        validationErrors: false
      }));
    }

    const fieldsToClear = [
      'vehicleLicensePlate',
      'vehicleRegistrationState',
      'vehicleIsSearched',
      'vehicleIsSearchedSearched',
      'vehicleIsSelected',
      'vehicleIsAddressSelected',
      ...Object.keys(vehicleFieldsToRedBookMapping)
    ];

    fieldsToClear.forEach(field => clearData(field, answerGroupId));
  }
}

export function toggleManualEntry(answerGroupId, boolean) {
  return (dispatch, getState) => {
    const manualVehicleDetailsEntry = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'vehicleManualEntry', answerGroup: answerGroupId });

    dispatch(upsertAnswer({
      id: manualVehicleDetailsEntry.id,
      value: boolean.toString()
    }));
  }
}

export function shouldUpdateVehicleDistance(answer) {
  return dispatch => {
    const fieldsToTriggerUpdate = ["vehicleKmsPerYear", "vehicleUsagePerWeek"];
    if (fieldsToTriggerUpdate.includes(answer.fieldName)) {
      dispatch(updateVehicleDistance(answer.answerGroup));
    }
  }
}

export function updateVehicleDistance(answerGroupId) {
  // this is bad but I can't touch this right now. we shouldn't be using the redux/mappings
  return (dispatch, getState) => {
    const vehicle = answerGroupAllDataSelector(getState(), { answerGroupId });
    const vehicleDistance = getPredictedOdometerValue(vehicle.answers.vehicleKmsPerYear, vehicle.answers.vehicleUsagePerWeek);
    if (vehicleDistance !== null) dispatch(upsertAnswerForFieldName("vehicleDistance", answerGroupId, { value: vehicleDistance }));
  }
}

export function shouldUpdateVehicleTotalValue(answer) {
  return dispatch => {
    const fieldsToTriggerUpdate = ["vehicleDriven", "vehicleKmsPerYear", "vehicleUsagePerWeek", "vehicleEquipment", "vehicleAccessories"];
    if (fieldsToTriggerUpdate.includes(answer.fieldName)) {
      dispatch(updateVehicleTotalValue(answer.answerGroup));
    }
  }
}

export function updateVehicleTotalValue(answerGroupId) {
  return (dispatch, getState) => {
    const vehicle = answerGroupAllDataSelector(getState(), { answerGroupId });
    if (!vehicle.prices) return Promise.resolve();

    const predictedOdometer = vehicle.answers.vehicleDistance;
    if (predictedOdometer === null || predictedOdometer === undefined || vehicle.answers.vehicleDriven === "") return Promise.resolve();

    const totalOdometer = parseInt(predictedOdometer) + parseInt(vehicle.answers.vehicleDriven);
    const roundedTotalOdometer = roundUp(totalOdometer);

    const baseVehicleValue = getBaseVehicleValue(vehicle.prices, vehicle.privateMin, vehicle.privateMax, roundedTotalOdometer);

    // Add selected options and aftermarket accessories (modifications)
    const selectedVehicleEquipment = vehicle.answers.vehicleEquipment;
    const selectedVehicleAccessories = vehicle.answers.vehicleAccessories;
    const vehicleEquipmentValue = getVehicleEquipmentValue(vehicle.options, selectedVehicleEquipment);
    const vehicleAccessoriesValue = getVehicleAccessoriesValue(vehicle.aftermarket, selectedVehicleAccessories);

    const accessoriesValue = vehicleEquipmentValue + vehicleAccessoriesValue;
    const totalVehicleValue = baseVehicleValue + vehicleEquipmentValue + vehicleAccessoriesValue;

    // calculate vehicle value
    dispatch(upsertAnswerForFieldName("vehicleTotalValue", answerGroupId, { value: totalVehicleValue.toString() }));
    dispatch(upsertAnswerForFieldName("vehicleValue", answerGroupId, { value: baseVehicleValue.toString() }));
    dispatch(upsertAnswerForFieldName("vehicleAccessoriesvalue", answerGroupId, { value: accessoriesValue.toString() }));
  }
}

export const getPredictedOdometerValue = (predictedOdometer, usageFrequency) => {
  if (predictedOdometer === "") {
    // Customer did not enter their own predicted odometer value, use mapped value if vehicle usage frequency is answered
    if (!usageFrequency) return null;

    const mappedOdometer = vehicleUsagePerWeekToPredictedOdometerMapping[usageFrequency];
    return mappedOdometer === undefined ? null : mappedOdometer;
  }

  return predictedOdometer;
}

export const getBaseVehicleValue = (prices, privateMin, privateMax, roundedTotalOdometer) => {
  let odometer = roundedTotalOdometer;
  if (prices.length) {
    // Use minimum/maximum distance provided in pricing table
    if (odometer < prices[0].km) {
      odometer = prices[0].km;
    } else if (odometer > prices[prices.length-1].km) {
      odometer = prices[prices.length-1].km;
    }
    const veryGoodRetailPrice = prices.find(price => price.condition === "Very Good" && price.km === odometer);
    const goodRetailPrice = prices.find(price => price.condition === "Good" && price.km === odometer);
    const average = (veryGoodRetailPrice.retail + goodRetailPrice.retail)/2;
    if(isNaN(average)) {
      console.log('returning 0');
      return 0;
    } else {
      console.log('returning average', average);
      return average;
    }
    
  } else {
    // Prices array is empty - vehicle is >10 years old - use default value
    
    const average = (privateMin + privateMax)/2;
    if(isNaN(average)) {
      return 0;
    } else {
      return average;
    }
    
  }
}

// selectedIndexes is an array of option indexes
export const getVehicleEquipmentValue = (options, selectedIndexes) => {
  if (!Array.isArray(selectedIndexes)) return 0;
  return selectedIndexes.reduce((accumulator, currentValue) => accumulator + options[parseInt(currentValue)].private, 0);
}

// selectedIndexes is an array of aftermarket indexes
export const getVehicleAccessoriesValue = (aftermarket, selectedIndexes) => {
  if (!Array.isArray(selectedIndexes)) return 0;
  return selectedIndexes.reduce((accumulator, currentValue) => accumulator + aftermarket[parseInt(currentValue)].private, 0);
}

// Redbook currently returns prices for odometer readings in increments of 5000
const ROUND_TO = 5000;
export const roundUp = (number) => {
  return Math.ceil(number/ROUND_TO)*ROUND_TO;
}
