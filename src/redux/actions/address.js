import { apexRequest } from "redux/actions";
import { upsertAnswer } from "redux/actions/orm/Answer";
import { answerGroupById, answerByFieldNameAndAnswerGroup, fieldByName } from "redux/selectors";
import { getNextAnswerId } from "redux/utils";

export function updateAddressDetails(field, answerGroupId, address) {
  return (dispatch, getState) => {

    // answerGroupId is grabbed from repeatableIndex and might not be correct (might be vehicleIndex not answerGroupIndex)
    if (answerGroupId === null) return Promise.resolve();

    const answerGroup = answerGroupById(getState(), answerGroupId);

    const subFields = field.validations.filter(rule => rule.type === "subFields")[0].fields;

    let mapping;
    if (subFields.includes("vehicleStreetNumber")) {
      mapping = {
        // vehicleAptNumber: '',
        vehicleStreetNumber: 'street_number',
        vehicleStreetName: 'route',
        vehicleSuburb: 'locality',
        vehicleState: 'administrative_area_level_1',
        vehiclePostcode: 'postal_code'
      };
    } else {

      mapping = {
        // phPostalAptNumber: '',
        phPostalStreetNumber: 'street_number',
        phPostalStreetName: 'route',
        phPostalSuburb: 'locality',
        phPostalState: 'administrative_area_level_1',
        phPostalPostcode: 'postal_code'
      };
    }

    Object.keys(mapping).forEach(key => {
      const answer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: key, answerGroup: answerGroupId });
      const valueObject = address.address_components.filter(cmp => cmp.types.includes(mapping[key]));
      const value = valueObject[0].short_name;

      if (answer) {
        dispatch(upsertAnswer(Object.assign({}, answer, {
          value: value,
          validationErrors: false,
          disabled: true
        })));

      } else {
        const field = fieldByName(getState(), key);
        dispatch(upsertAnswer({
          answerGroup: answerGroupId,
          id: getNextAnswerId(),
          field: field.id,
          fieldName: field.name,
          value: value,
          excludeFromResponsePayload: field.excludeFromResponsePayload,
          dataSource: field.dataSource,
          dataSourceFieldname: field.dataSourceFieldname,
          disabled: true
        }));
      }
    });

  }
}

export function resetSubFields(subFields, answerGroupId) {
  return (dispatch, getState) => {
    console.log('reset subfields for', answerGroupId);
    subFields.forEach(fieldName => {
      const field = fieldByName(getState(), fieldName);
      const answer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: fieldName, answerGroup: answerGroupId }) || '';

      if (answer) {
        dispatch(upsertAnswer(Object.assign({}, answer, {
          value: '',
          validationErrors: false,
          disabled: false
        })));

      } else {
        const field = fieldByName(getState(), fieldName);
        dispatch(upsertAnswer({
          answerGroup: answerGroupId,
          id: getNextAnswerId(),
          field: field.id,
          fieldName: field.name,
          value: '',
          excludeFromResponsePayload: field.excludeFromResponsePayload,
          dataSource: field.dataSource,
          dataSourceFieldname: field.dataSourceFieldname,
          disabled: false
        }));
      }
    })
  }
}

export function toggleManualAddressEntry(answerGroupId, forcedValue) {
  return (dispatch, getState) => {

    const answerGroup = answerGroupById(
      getState(),
      answerGroupId
    )

    let controllingFieldName;
    switch (answerGroup.fieldName) {
      case "vehicle":
        controllingFieldName = "vehicleManualAddressEntry";
        break;

      case "policyHolder":
        controllingFieldName = "phPostalManualAddressEntry";
        break;

      default:
        // console.log('add new controllingFieldname to redux/actions/address.js');
        return;
    }

    const conditionAnswer = answerByFieldNameAndAnswerGroup(
      getState(),
      {
        fieldName: controllingFieldName,
        answerGroup: answerGroupId
      }
    );

    let newAnswerValue = forcedValue;
    if (!forcedValue) {
      newAnswerValue = conditionAnswer.value === "true" ? "false" : "true";
    }

    if (conditionAnswer) {
      dispatch(upsertAnswer({
        id: conditionAnswer.id,
        value: newAnswerValue
      }));
    }
  }
}
