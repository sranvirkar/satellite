import moment from "moment-timezone";
import {
  answerById,
  answerGroupById,
  exposuresSelector,
  fieldGroupsSelector,
  formTypeSelector,
  perilsByAnswerGroupSelector,
  selectedAnswerGroups,
  answerGroupByIdExcludeResponsePayload,
  answerByFieldNameOrDataSourceFieldname } from "redux/selectors";
import { updateAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { isEmptyObject } from "helpers/utils";

// Uses the policyChanges state to construct the update payload for the updateQuote/updateEndorsement callouts
// TODO: make variable names better
export function constructPolicyChangesPayload(payload, getState) {
  const formType = formTypeSelector(getState());

  const response = {
    fieldValues: {},
    addExposures: []
  };

  let addFieldGroups = {};
  let updateFieldGroups = {};
  let removeFieldGroups = {};
  let updateExposures = [];
  let updateExposureFieldValues = {};
  let updateFieldGroupFieldValues = {};
  let removeExposures = [];

  payload.fieldValues.forEach(answerId => {
    const answer = answerById(getState(), answerId);

    const declarationFields = [
      "policyCanceled",
      "claimDenied",
      "conviction",
      "licenseCanceled",
      "insuranceDenied"
    ];

    if (declarationFields.includes(answer.fieldName) && answer.value === "") {
      /*
        FUTURE FIX
        Hardcoded solution to the issue where pressing back on final declarations BEFORE answering all questions then going forwards would throw an error

        Problem:
        - Answers are created when the FormField component mounts AND there is no existing answer for that field
        - I.e. When the final declarations page is loaded for the first time, the declaration answers are created with the default value ""
        - When you navigate backwards/go back to the policyholders page, nothing happens - all good
        - When you next navigate forwards, it will attempt to do an update policy and sends the declaration fields with the value ""
        - Declaration questions are a select type in Socotra (Yes/No) and the value "" does not match either -> error gets thrown here
        - The error response is very hard to parse... so it's not easy to 'catch' this specific error and ignore

        Quick fix (done here):
        - If the field name matches any of the declaration field names AND the answer is "", then DON'T include this answer in the update policy payload
      */
      return;
    } else if (answer.fieldName === "policyStartDate" || answer.fieldName === "endorsementEffectiveDate") {
      // Convert policy start date to UNIX timestamp
      switch (formType) {
        case "Endorsement":
          // response.startTimestamp = moment(answer.value).format('x');
          break;
        default:
          moment.tz.add("Australia/Sydney|AEST AEDT|-a0 -b0|0101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101|-293lX xcX 10jd0 yL0 1cN0 1cL0 1fB0 19X0 17c10 LA0 1C00 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 14o0 1o00 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 U00 1qM0 WM0 1tA0 WM0 1tA0 U00 1tA0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 11A0 1o00 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 11A0 1o00 WM0 1qM0 14o0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0|40e5");


          response.policyStartTimestamp = moment(answer.value).tz("Australia/Sydney").format('x');
          response.policyEndTimestamp = moment(answer.value).tz("Australia/Sydney").add(1, 'months').format('x');

          // TODO: make this dynamic
          response.fieldValues['paymentFrequency'] = 'Monthly';
      }
    } else {
      response.fieldValues[answer.fieldName] = answer.value;
    }
  })
  payload.addFieldGroups.forEach(relationship => {
    const fromAnswerGroup = answerGroupById(getState(), relationship[0]);
    const toAnswerGroup = answerGroupById(getState(), relationship[1]);

    if (fromAnswerGroup && toAnswerGroup) {
      let exposureAnswerGroupId = null;
      let fieldGroupAnswerGroupId = null;

      if (fromAnswerGroup.entity === "exposure" && toAnswerGroup.entity === "person") {
        exposureAnswerGroupId = fromAnswerGroup.id;
        fieldGroupAnswerGroupId = toAnswerGroup.id;
      } else if (fromAnswerGroup.entity === "person" && toAnswerGroup.entity === "exposure") {
        exposureAnswerGroupId = toAnswerGroup.id;
        fieldGroupAnswerGroupId = fromAnswerGroup.id;
      }

      if (exposureAnswerGroupId !== null && fieldGroupAnswerGroupId !== null) {
        if (!payload.addExposures.includes(parseInt(exposureAnswerGroupId)) && !updateExposures.includes(parseInt(exposureAnswerGroupId))) {
          updateExposures.push(parseInt(exposureAnswerGroupId));
        }
        if (addFieldGroups[exposureAnswerGroupId]) {
          addFieldGroups[exposureAnswerGroupId].push(fieldGroupAnswerGroupId);
        } else {
          addFieldGroups[exposureAnswerGroupId] = [fieldGroupAnswerGroupId];
        }
      }
    }
  })
  payload.removeFieldGroups.forEach(relationship => {
    const fromAnswerGroup = answerGroupById(getState(), relationship[0]);
    const toAnswerGroup = answerGroupById(getState(), relationship[1]);

    let exposureAnswerGroup = null;
    let fieldGroupAnswerGroup = null;

    if (fromAnswerGroup.entity === "exposure" && toAnswerGroup.entity === "person") {
      exposureAnswerGroup = fromAnswerGroup;
      fieldGroupAnswerGroup = toAnswerGroup;
    } else if (fromAnswerGroup.entity === "person" && toAnswerGroup.entity === "exposure") {
      exposureAnswerGroup = toAnswerGroup;
      fieldGroupAnswerGroup = fromAnswerGroup;
    }

    if (exposureAnswerGroup.id !== null && fieldGroupAnswerGroup.id !== null) {
      if (!removeExposures.includes(parseInt(exposureAnswerGroup.id)) && !updateExposures.includes(parseInt(exposureAnswerGroup.id))) {
        updateExposures.push(parseInt(exposureAnswerGroup.id));
      }
      const locatorName = `${fieldGroupAnswerGroup.fieldName}Locator`;
      if (removeFieldGroups[exposureAnswerGroup.id]) {
        removeFieldGroups[exposureAnswerGroup.id].push(fieldGroupAnswerGroup[locatorName][exposureAnswerGroup.id]);
      } else {
        removeFieldGroups[exposureAnswerGroup.id] = [fieldGroupAnswerGroup[locatorName][exposureAnswerGroup.id]];
      }
    }
  })
  payload.removeAnswerGroups.forEach(answerGroup => {
    // console.log('remove answer groups answer group id', answerGroupId);
    // const answerGroup = answerGroupById(getState(), answerGroupId);

    if (answerGroup.entity === "exposure") {
      removeExposures.push(answerGroup.exposureLocator);
    } else if (answerGroup.entity === "person") {
      const locatorName = `${answerGroup.fieldName}Locator`;

      if (isEmptyObject(answerGroup[locatorName])) return;

      // remove from ALL exposures that it is related to
      const allExposureIds = payload.removeRelationships[answerGroup.id];
      if (allExposureIds) {
        // if !allExposureIds, that means the field group was removed without being related to an exposure
        allExposureIds.forEach(exposureId => {
          if (!payload.addExposures.includes(parseInt(exposureId)) && !updateExposures.includes(parseInt(exposureId))) {
            updateExposures.push(parseInt(exposureId));
          }
          if (removeFieldGroups[exposureId]) {
            if (!removeFieldGroups[exposureId].includes(answerGroup[locatorName][exposureId])) {
              removeFieldGroups[exposureId].push(answerGroup[locatorName][exposureId]);
            }
          } else {
            removeFieldGroups[exposureId] = [answerGroup[locatorName][exposureId]];
          }
        })
      }
    }
  })
  Object.keys(payload.updateAnswers).forEach(key => {
    const answerId = key;
    const answerGroupId = payload.updateAnswers[key];
    const answerGroup = answerGroupById(getState(), answerGroupId);
    if (answerGroup) {
      if (answerGroup.entity === "exposure") {
        if (!updateExposures.includes(parseInt(answerGroup.id))) updateExposures.push(parseInt(answerGroup.id));

        if (updateExposureFieldValues[answerGroup.id]) {
          updateExposureFieldValues[answerGroup.id].push(answerId);
        } else {
          updateExposureFieldValues[answerGroup.id] = [answerId];
        }
      } else if (answerGroup.entity === "person") {
        const allExposureIds = selectedAnswerGroups(getState(), answerGroup.id);
        allExposureIds.forEach(exposureId => {
          if (!payload.addExposures.includes(parseInt(exposureId)) && !updateExposures.includes(parseInt(exposureId))) {
            updateExposures.push(parseInt(exposureId));
          }

          if (!addFieldGroups[exposureId] || !addFieldGroups[exposureId].includes(answerGroup.id)) {
            if (updateFieldGroups[exposureId]) {
              if (!updateFieldGroups[exposureId].includes(answerGroup.id)) {
                updateFieldGroups[exposureId].push(answerGroup.id);
              }
            } else {
              updateFieldGroups[exposureId] = [answerGroup.id];
            }

            if (updateFieldGroupFieldValues[answerGroup.id]) {
              updateFieldGroupFieldValues[answerGroup.id].push(answerId);
            } else {
              updateFieldGroupFieldValues[answerGroup.id] = [answerId];
            }
          }
        })
      }
    }
  })
  Object.keys(payload.addPerils).forEach(key => {
    const answerGroupId = key;
    if (!payload.addExposures.includes(parseInt(answerGroupId)) && !updateExposures.includes(parseInt(answerGroupId)) && payload.addPerils[key].length) {
      updateExposures.push(parseInt(answerGroupId));
    }
  });
  Object.keys(payload.removePerils).forEach(key => {
    const answerGroupId = key;
    if (!payload.addExposures.includes(parseInt(answerGroupId)) && !updateExposures.includes(parseInt(answerGroupId)) && !payload.removeAnswerGroups.find(answerGroup => answerGroup.id === parseInt(answerGroupId))) {
      updateExposures.push(parseInt(answerGroupId));
    }
  });

  // Construct response payload
  response.addExposures = payload.addExposures.map(exposureId => {
    let addExposure = {};
    const answerGroup = answerGroupByIdExcludeResponsePayload(getState(), exposureId);
    // TODO: ... clean this up
    const convertedAnswers = Object.assign({}, answerGroup.answers);
    Object.keys(convertedAnswers).forEach(key => {
      const answer = answerByFieldNameOrDataSourceFieldname(getState(), { name: key, answerGroup: answerGroup.id });
      convertedAnswers[key] = getPayloadValueForAnswer(answer.ref, getState);
    })
    addExposure[answerGroup.fieldName] = convertedAnswers;
    if (addFieldGroups[exposureId]) {
      addFieldGroups[exposureId].forEach(fieldGroupId => {
        const fieldGroup = answerGroupByIdExcludeResponsePayload(getState(), fieldGroupId);
        const fieldGroupIdName = `${fieldGroup.fieldName}Id`;
        const answerObject = Object.assign(fieldGroup.answers, { [fieldGroupIdName]: fieldGroup[fieldGroupIdName] });
        if (addExposure[answerGroup.fieldName][fieldGroup.fieldName]) {
          addExposure[answerGroup.fieldName][fieldGroup.fieldName].push(answerObject);
        } else {
          addExposure[answerGroup.fieldName][fieldGroup.fieldName] = [answerObject];
        }
      })
    }
    if (payload.addPerils[exposureId]) {
      addExposure.perils = payload.addPerils[exposureId].map(peril => {
        return { name: peril }
      });
    } else {
      addExposure.perils = [];
    }
    addExposure.exposureName = answerGroup.fieldName;
    return addExposure;
  });
  response.updateExposures = updateExposures.map(exposureId => {
    console.log('entered updateExposures');

    let updateExposure = {
      exposureLocator: answerGroupById(getState(), exposureId).exposureLocator
    };
    console.log('exposure', updateExposure);
    if (addFieldGroups[exposureId]) {
      updateExposure.addFieldGroups = addFieldGroups[exposureId].map(fieldGroupId => {
        const answerGroup = answerGroupByIdExcludeResponsePayload(getState(), fieldGroupId);
        const fieldGroupIdName = `${answerGroup.fieldName}Id`;
        let fieldValues = Object.assign(answerGroup.answers, { [fieldGroupIdName]: answerGroup[fieldGroupIdName] });
        console.log('fieldValues', fieldValues);
        return {
          fieldName: answerGroup.fieldName,
          fieldValues
        }
      });
    }
    if (updateFieldGroups[exposureId]) {
      updateExposure.updateFieldGroups = updateFieldGroups[exposureId].map(fieldGroupId => {
        const answerGroup = answerGroupById(getState(), fieldGroupId);
        if (updateFieldGroupFieldValues[fieldGroupId]) {
          const locatorName = `${answerGroup.fieldName}Locator`;
          let fieldValues = {
            [locatorName]: answerGroup[locatorName]

          };
          console.log('fieldValues', fieldValues);
          updateFieldGroupFieldValues[fieldGroupId].forEach(answerId => {
            const answer = answerById(getState(), answerId);
            fieldValues[answer.dataSourceFieldname ? answer.dataSourceFieldname : answer.fieldName] = answer.value;
          })
          return {
            fieldName: answerGroup.fieldName,
            fieldValues
          }
        }

      });
    }
    if (removeFieldGroups[exposureId]) {
      updateExposure.removeFieldGroups = removeFieldGroups[exposureId];
    }
    if (updateExposureFieldValues[exposureId]) {
      updateExposureFieldValues[exposureId].forEach(answerId => {
        const answer = answerById(getState(), answerId);
        const answerGroup = answerGroupById(getState(), answer.answerGroup);
        const value = getPayloadValueForAnswer(answer, getState);
        if (updateExposure[answerGroup.fieldName]) {
          updateExposure[answerGroup.fieldName][answer.dataSourceFieldname ? answer.dataSourceFieldname : answer.fieldName] = value;
        } else {
          updateExposure[answerGroup.fieldName] = {
            [answer.dataSourceFieldname ? answer.dataSourceFieldname : answer.fieldName]: value
          }
        }
      })
    }
    if (payload.addPerils[exposureId]) {
      updateExposure.addPerils = payload.addPerils[exposureId].map(peril => {
        return { name: peril }
      });
    }
    if (payload.removePerils[exposureId]) {
      switch (formType) {
        case "Endorsement":
          updateExposure.endPerils = payload.removePerils[exposureId];
          break;
        default:
          updateExposure.removePerils = payload.removePerils[exposureId];
      }
    }
    return updateExposure;
  });

  switch (formType) {
    case "Endorsement":
      response.endExposures = removeExposures;
      break;
    default:
      response.removeExposures = removeExposures;
  }

  return response;
}

// Extract locators from policy response from Mulesoft
export function getLocatorsFromResponse(responsePayload) {
  return (dispatch, getState) => {
    const answerGroups = exposuresSelector(getState());
    const answerGroupCopies = answerGroups.map(answerGroup => Object.assign({}, answerGroup));
    const exposureName = answerGroupCopies[0].fieldName;

    responsePayload.exposures.forEach(exposure => {
      const exposureLocator = exposure.exposureCharacteristics[0].exposureLocator;
      const exposureCharacteristicsLocator = exposure.exposureCharacteristics[0].locator;
      let group = answerGroupCopies.find(answerGroup => answerGroup.exposureLocator === exposureLocator);

      if (!group) {
        group = answerGroupCopies.find(answerGroup => answerGroup.exposureLocator === null);
        group.exposureLocator = exposureLocator;
        group.exposureCharacteristicsLocator = exposureCharacteristicsLocator;
        dispatch(updateAnswerGroup(group));
      }

      // parse field groups (driver in this case)
      // TODO: better variable names...
      Object.keys(exposure.exposureCharacteristics[0][exposureName]).forEach(key => {
        if (Array.isArray(exposure.exposureCharacteristics[0][exposureName][key])) {

          const fieldGroups = fieldGroupsSelector(getState());
          const fieldGroupCopies = fieldGroups.map(fieldGroup => Object.assign({}, fieldGroup));
          const fieldGroupName = fieldGroupCopies[0].fieldName;
          const fieldGroupLocatorName = `${fieldGroupCopies[0].fieldName}Locator`;
          const fieldGroupIdName = `${fieldGroupCopies[0].fieldName}Id`;
          exposure.exposureCharacteristics[0][exposureName][key].forEach(fieldGroup => {
            const fieldGroupLocator = fieldGroup[fieldGroupLocatorName];

            // find answer group and populate locator if not already exists
            let fGroup = fieldGroupCopies.find(fieldGroupCopy => fieldGroupCopy[fieldGroupIdName] === fieldGroup[fieldGroupIdName]);

            if (!fGroup) {
              // something is wrong here
              console.log('...??');
            } else {
              // get answer group id of exposure
              fGroup[fieldGroupLocatorName][group.id] = fieldGroupLocator;
              dispatch(updateAnswerGroup(fGroup));
            }
          });
        }
      })

      if (exposure.perils) {
        const perils = perilsByAnswerGroupSelector(getState(), group.id);
        const perilCopies = perils.map(peril => Object.assign({}, peril));

        exposure.perils.forEach(perilWithLocator => {
          const perilLocator = perilWithLocator.locator;
          let peril = perilCopies.find(perilCopy => perilCopy.perilLocator === perilLocator);

          if (!peril) {
            peril = perilCopies.find(perilCopy => perilCopy.perilLocator === undefined);
            peril.perilLocator = perilLocator;
            dispatch({
              type: 'UPDATE_PERIL',
              payload: peril
            })
          }
        })
      }

    });
  }
}

// Some answers need to be converted first (e.g. vehicleAccessories and vehicleEquipment from array of indices to JSON array of descriptions)
function getPayloadValueForAnswer(answer, getState) {
  switch (answer.fieldName) {
    case "vehicleAccessories": {
      if (!answer.value) return ""; // TODO: check this
      let vehicle = answerGroupById(getState(), answer.answerGroup);
      return JSON.stringify(answer.value.map(index => vehicle.aftermarket[index]));
    }

    case "vehicleEquipment": {
      if (!answer.value) return ""; // TODO: check this
      let vehicle = answerGroupById(getState(), answer.answerGroup);
      return JSON.stringify(answer.value.map(index => vehicle.options[index]));
    }

    default:
      return answer.value;
  }
}
