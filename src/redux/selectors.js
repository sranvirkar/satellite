import { orm } from "./orm";
import { createSelector } from "redux-orm";
import { getPolicyStatus } from "redux/utils";
import moment from 'moment';

import {
  renewalsByPolicyIdSelector,
  nextRenewalSelector
} from "redux/selectors/Renewal";

export const dbStateSelector = state => state.db;

export const answerById = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerId) => {
    return session.Answer.withId(answerId).ref;
  }
)

export const sectionsLength = createSelector(
  orm,
  dbStateSelector,
  session => {
    const policy = session.Policy.first();
    return policy ? policy.sections.toRefArray().length : undefined;
  }
);
//
// export const controlledFieldsSelector = createSelector(
//   orm,
//   dbStateSelector,
//   (state, props) => props,
//   (session, answer) => {
//     const controllingField = session.Answer.withId(answer.id).field;
//     const controlledFields = session.Condition.all().filter({ controllingField }).toRefArray().map(condition => condition.field);
//     return session.Field.all().filter(field => controlledFields.includes(field.id)).toModelArray();
//   }
// )

export const isUWDeclined = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.fieldName,
  (state, props) => props.value,
  (session, fieldName, value) => {
    const policy = session.Policy.first();

    if (policy && policy.underwriting) {
      const declineRules = policy.underwriting.declineRules;
      for (let i = 0; i < declineRules.length; i++) {
        if (fieldName === declineRules[i].field && value === declineRules[i].value) {
          return true;
        }
      }
    }
    return false;
  }
);

export const answerByFieldNameAndAnswerGroup = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.fieldName,
  (state, props) => props.answerGroup,
  (session, fieldName, answerGroup) => {
    const answer = session.Answer.all().filter({ fieldName: fieldName, answerGroup: answerGroup }).first();
    return answer ? answer.ref : null;
  }
)

export const getAnswerGroupData = (answerGroup, excludeFromResponsePayload, dataSource, useDataSourceFieldnames, excludeEmptyString) => {
  let data = {};
  const exclude = excludeFromResponsePayload ? { excludeFromResponsePayload: undefined } : {};
  const source = dataSource === null || dataSource === undefined ? {} : { dataSource };
  answerGroup.answers.filter({ ...exclude, ...source }).toRefArray().forEach(answer => {
    if (answer.fieldName !== undefined && answer.fieldName !== null) {
      if (excludeEmptyString && answer.value === "") {
        // skip
      } else {
        if (useDataSourceFieldnames && answer.dataSourceFieldname) {
          data[answer.dataSourceFieldname] = answer.value;
        } else {
          data[answer.fieldName] = answer.value;
        }
      }

    }
  });
  return data;
}

export const fieldByName = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, fieldName) => {
    return session.Field.all().filter({ name: fieldName }).first();
  }
)

export const answerGroupById = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerGroupId) => {
    const answerGroup = session.AnswerGroup.withId(answerGroupId);
    if (!answerGroup) return null;
    return Object.assign({}, answerGroup.ref, { answers: getAnswerGroupData(answerGroup) });
  }
)

export const answerGroupByIdExcludeResponsePayload = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerGroupId) => {
    const answerGroup = session.AnswerGroup.withId(answerGroupId);
    if (!answerGroup) return null;
    return Object.assign({}, answerGroup.ref, { answers: getAnswerGroupData(answerGroup, true, null, true, true) });
  }
)

const getAnswerGroups = (session, repeatableGroup, excludeFromResponsePayload) => {
  if (repeatableGroup === null || repeatableGroup === undefined) return [];
  const answerGroups = session.AnswerGroup.all().filter({ fieldName: repeatableGroup }).toModelArray();
  return answerGroups.map(answerGroup => Object.assign({}, answerGroup.ref, { answers: getAnswerGroupData(answerGroup, excludeFromResponsePayload) }));
}

export const answerGroups = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, repeatableGroup) => {
    return getAnswerGroups(session, repeatableGroup);
  }
);

export const multipleAnswerGroups = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, repeatableGroups) => {
    let groups = [];
    repeatableGroups.forEach(repeatableGroup => {
      groups = [...groups, ...getAnswerGroups(session, repeatableGroup)];
    })
    return groups;
  }
)

const getSelectedAnswerGroups = (session, answerGroupId) => {
  const answerGroup = session.AnswerGroup.withId(answerGroupId);
  return [...answerGroup.answerGroups.toRefArray().map(relation => relation.id), ...answerGroup.relatedAnswerGroups.toRefArray().map(relation => relation.id)];
}

export const selectedAnswerGroups = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerGroupId) => {
    return getSelectedAnswerGroups(session, answerGroupId);
  }
)

export const answerGroupIds = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.field.id,
  (session, fieldId) => {
    return session.Field.idExists(fieldId) ? session.Field.withId(fieldId).answerGroups.toModelArray().map(answerGroup => answerGroup.id) : [];
  }
)

export const answer = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.field.id,
  (state, props) => props.answerGroupId,
  (session, fieldId, answerGroupId) => {
    const answer = session.Answer.all().filter({ field: fieldId, answerGroup: answerGroupId }).first();
    return answer ? Object.assign({}, answer.ref) : null;
  }
)

export const perilByNameAndAnswerGroup = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.name,
  (state, props) => props.answerGroupId,
  (session, perilName, answerGroupId) => {
    const peril = session.Peril.all().filter({ name: perilName, answerGroup: answerGroupId }).first();
    return peril ? peril.ref : null;
  }
)

export const fieldGroupsSelector = createSelector(
  orm,
  dbStateSelector,
  session => {
    return [...session.AnswerGroup.all().filter({ entity: "person" }).toRefArray()];
  }
)

export const perilsByAnswerGroupSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerGroupId) => {
    return session.Peril.all().filter({ answerGroup: answerGroupId }).toRefArray();
  }
)

export const includedPerilsSelector = createSelector(
  orm,
  dbStateSelector,
  session => {
    const policy = session.Policy.first();
    return policy ? policy.includedPerils : [];
  }
)

export const optionalPerilsSelector = createSelector(
  orm,
  dbStateSelector,
  session => {
    const policy = session.Policy.first();
    return policy ? policy.optionalPerils : [];
  }
)

export const exposuresSelector = createSelector(
  orm,
  dbStateSelector,
  session => {
    return [...session.AnswerGroup.all().filter({ entity: "exposure" }).toRefArray()];
  }
)

export const answersByField = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, fieldId) => {
    return session.Field.withId(fieldId).answers.toModelArray();
  }
)

export const fieldGroupSocotraIdSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, filterObj) => {
    const answerGroup = session.AnswerGroup.all().filter(filterObj).first();
    return answerGroup ? answerGroup.ref : null;
  }
)

export const formTypeSelector = state => state.response.type;

export const leadIdSelector = state => state.response.leadId;

export const accountIdSelector = state => state.response.accountId;
export const quoteCreatedSelector = state => state.response.quoteCreated;

export const policyFinalised = state => state.response.policyFinalised;
export const creditCardTokenSelector = state => state.response.creditCardToken;
export const invoiceSelector = state => state.response.invoice;

export const endorsementCreatedSelector = state => state.response.endorsementCreated;
export const endorsementIdSelector = state => state.response.endorsementId;
export const endorsementFinalisedSelector = state => state.response.endorsementFinalised;
export const underwritingSelector = state => state.response.underwriting;
export const editPolicySelector = state => state.oss.editPolicy;
export const globalErrorSelector = state => state.error.global;
export const globalLoadingSelector = state => state.loading.global;
export const loadingSelector = (state, props) => state.loading[props];

// export const policiesSelector = state => state.oss.policies;

// export const policiesFetchedSelector = state => state.oss.policiesFetched;

export const policyholdersSelector = state => state.oss.policyholders;

export const claimSubmittedSelector = state => state.response.claimSubmitted;
export const contactUsSubmittedSelector = state => state.response.contactUsSubmitted;

// Endorsement
export const endorsementPriceSelector = state => state.endorsement.price;

// Vehicle premiums in quote and buy
export const quoteVehiclePriceSelector = (state, exposureLocator) => state.pricing.newPrice ? state.pricing.newPrice.exposures[exposureLocator] : 0;

export const answersByAnswerGroup = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerGroupId) => {
    return session.Answer.all().filter({ answerGroup: answerGroupId }).toRefArray();
  }
)

// Temporary conversion until fields are updated in Socotra
export const fieldByNameOrDataSourceFieldname = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, fieldName) => {
    return session.Field.all().filter(field => field.name === fieldName || field.dataSourceFieldname === fieldName).first();
  }
)

// Cleaned up ones below

import { constructDataObject } from "./utils";

export const answerByIdSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerId) => {
    return session.Answer.withId(answerId);
  }
)

export const answerGroupByIdSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerGroupId) => {
    return session.AnswerGroup.withId(answerGroupId);
  }
)

export const answerGroupRefByIdSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, answerGroupId) => {
    return session.AnswerGroup.withId(answerGroupId).ref;
  }
)

export const answerGroupByEntitySelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, entity) => {
    return session.AnswerGroup.all().filter({ entity }).toModelArray();
  }
)

export const answerGroupDataSelector = createSelector(
  orm,
  [
    dbStateSelector,
    (state, props) => props.answerGroupId,
    (state, props) => props.options
  ],
  (session, answerGroupId, options) => {
    // TODO: why does answerGroupModel.answers.toRefArray() not work? not actually a todo... the below works
    const answers = session.Answer.all().filter({ answerGroup: answerGroupId }).toRefArray();
    return constructDataObject(answers, options);
  }
)

export const answerGroupAllDataSelector = createSelector(
  orm,
  [
    dbStateSelector,
    (state, props) => props.answerGroupId,
    (state, props) => props.options
  ],
  (session, answerGroupId, options) => {
    const answerGroup = session.AnswerGroup.withId(answerGroupId);
    const answers = session.Answer.all().filter({ answerGroup: answerGroupId }).toRefArray();
    return Object.assign({}, answerGroup.ref, { answers: constructDataObject(answers, options) });
  }
)

export const answersDataSelector = createSelector(
  orm,
  dbStateSelector,
  session => {
    const answers = session.Answer.all().toRefArray();
    return constructDataObject(answers);
  }
)

export const fieldsSelector = createSelector(
  orm,
  dbStateSelector,
  session => session.Field.all().toRefArray()
)

export const sectionsSelector = createSelector(
  orm,
  dbStateSelector,
  session => session.Section.all().toRefArray().filter(s => !s.hidden)
)

export const answerByFieldNameOrDataSourceFieldname = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.answerGroup,
  (state, props) => props.name,
  (session, answerGroupId, name) => {
    return session.Answer.all().filter(answer => answer.answerGroup === answerGroupId && (answer.fieldName === name || answer.dataSourceFieldname === name)).first();
  }
)

export const linkedPolicyholdersSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.fieldName,
  (state, props) => props.answerGroupId,
  (session, fieldName, answerGroupId) => {
    return session.Answer.all().filter({ fieldName, value: answerGroupId }).toRefArray().map(answer => answer.answerGroup);
  }
)

export const exposureByExposureCharacteristicsLocatorSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, exposureCharacteristicsLocator) => {
    const match = session.AnswerGroup.all().filter({ exposureCharacteristicsLocator }).first();
    return match ? match.ref : null;
  }
)

export const exposureByExposureLocatorSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, exposureLocator) => {
    const match = session.AnswerGroup.all().filter({ exposureLocator }).first();
    return match ? match.ref : null;
  }
)

export const policyByPolicyLocatorSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => state.oss,
  (state, props) => props,
  (session, oss, policyLocator) => {
    return oss.allPolicies.find(policy => policy.locator === policyLocator);
  }
)

export const firstExposureWithNoLocatorSelector = createSelector(
  orm,
  dbStateSelector,
  session => {
    const match = session.AnswerGroup.all().filter({ entity: 'exposure', exposureLocator: null }).first();
    return match ? match.ref : null;
  }
)

export const policyIdSelector = createSelector(
  orm,
  dbStateSelector,
  formTypeSelector,
  state => state.response.policyId,
  editPolicySelector,
  (session, formType, quotePolicyId, editPolicyId) => {
    switch (formType) {
      case "Quote":
        return quotePolicyId;

      default:
        return editPolicyId;
    }
  }
)

export const policyAndPolicyholderIds = state => state.oss.policyAndPolicyholderIds;
export const policyholderIdByPolicySelector = (state, policyId) => {
  const matchingPolicy = policyAndPolicyholderIds(state).find(obj => obj.policyId === policyId);
  return matchingPolicy ? matchingPolicy.policyholderId : null;
}
// export const policyholderIdSelector = state => state.response.policyholderId;
export const policyholderIdSelector = createSelector(
  orm,
  dbStateSelector,
  formTypeSelector,
  state => state.response.policyholderId,
  state => policyholderIdByPolicySelector(state, editPolicySelector(state)),
  (session, formType, quotePolicyholderId, editPolicyholderId) => {
    switch (formType) {
      case "Quote":
        return quotePolicyholderId;

      default:
        return editPolicyholderId;
    }
  }
)

export const errorSelector = state => state.error;

export const sectionByUrlParamSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, urlParam) => {
    return session.Section.get({ urlParam });
  }
)

export const previousSectionsSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, urlParam) => {
    const sections = session.Section.all().toRefArray().filter(s => !s.hidden);
    const previousSections = [];
    for (var i=0; i<sections.length; i++) {
      if (sections[i].urlParam === urlParam) return previousSections;
      previousSections.push(sections[i]);
    }
    return previousSections;
  }
)

export const validatedSectionsSelector = state => state.quoteAndBuyNavigation.validatedSections;

// export const currentSectionUrlParamSelector = state => state.quoteAndBuyNavigation.sectionUrlParam;

export const currentSectionUrlParamSelector = createSelector(
  orm,
  dbStateSelector,
  state => state,
  (session, state) => {
    return state.quoteAndBuyNavigation.sectionUrlParam || (session.Section.all().first() && session.Section.all().first().ref.urlParam);
  }
)

export const currentSectionSelector = createSelector(
  orm,
  dbStateSelector,
  currentSectionUrlParamSelector,
  (session, currentSectionUrlParam) => session.Section.get({ urlParam: currentSectionUrlParam })
)

export const nextSectionUrlParamSelector = createSelector(
  orm,
  dbStateSelector,
  currentSectionUrlParamSelector,
  (session, currentSectionUrlParam) => {
    const sections = session.Section.all().toRefArray().filter(s => !s.hidden); // always ignore hidden sections
    for (var i=0; i<sections.length; i++) {
      if (sections[i].urlParam === currentSectionUrlParam && i !== sections.length-1) return sections[i+1].urlParam;
    }
    return null;
  }
)

export const prevSectionUrlParamSelector = createSelector(
  orm,
  dbStateSelector,
  currentSectionUrlParamSelector,
  (session, currentSectionUrlParam) => {
    const sections = session.Section.all().toRefArray().filter(s => !s.hidden); // always ignore hidden sections
    for (var i=0; i<sections.length; i++) {
      if (i+1 < sections.length && sections[i+1].urlParam === currentSectionUrlParam) return sections[i].urlParam;
    }
    return null;
  }
)

export const isLastSectionSelector = createSelector(
  orm,
  dbStateSelector,
  currentSectionSelector,
  (session, currentSection) => {
    return currentSection.id === session.Section.last().id;
  }
)

export const sectionIdByUrlParamSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, sectionUrlParam) => {
    return session.Section.all().filter({ urlParam: sectionUrlParam }).first().id;
  }
)

export const answerByMatchSelector = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, matchObj) => {
    const matchingAnswer = session.Answer.get(matchObj);
    return matchingAnswer ? matchingAnswer.ref : null;
  }
)

export const customerClientTokenSelector = state => state.response.customerClientToken;


// Policy
export const policiesSelector = state => state.oss.policies;
export const policyIdsSelector = state => policiesSelector(state).allIds;
export const policyByIdSelector = (state, policyId) => policiesSelector(state).byId[policyId];

// Policyholder
export const policyholdersByPolicyIdSelector = (state, policyId) => state.oss.policyholdersByPolicyId[policyId];

// Renewal

// Formatted view of a policy (vehicles, drivers, policyholders, next payment information) at a given timestamp
export const policySummarySelector = (state, policyId, timestamp) => {
  const policy = policyByIdSelector(state, policyId);
  const policyholders = policyholdersByPolicyIdSelector(state, policyId);
  // Array.sort() sorts the array in place, so make a copy of the array
  const invoices = [...policyInvoicesSelector(state, policyId)];
  // Want to show the latest invoices first so sort in descending due date order
  invoices.sort((a, b) => b.dueTimestamp - a.dueTimestamp);

  // Build an array of policy partitions based on coverage start and end timestamps of peril characteristics
  // This will give us an array of policy time periods and the vehicles, drivers and perils/coverages that are active at that time
  let perilCharacteristics = [];
  let exposureCharacteristicMap = {};
  let policyCharacteristicsMap = {};
  let perilsMap = {};
  let partitions = [];

  policy.policyCharacteristics.forEach(policyCharacteristic => {
    policyCharacteristicsMap[policyCharacteristic.locator] = policyCharacteristic;
  })

  policy.exposures.forEach(exposure => {
    exposure.perils.forEach(peril => {
      peril.characteristics.forEach(perilCharacteristic => {
        if (!perilCharacteristic.replacedTimestamp) {
          perilCharacteristics = [...perilCharacteristics, perilCharacteristic];
        }
      })
      perilsMap[peril.locator] = peril.name;
    })

    exposure.exposureCharacteristics.forEach(exposureCharacteristic => {
      exposureCharacteristicMap[exposureCharacteristic.locator] = exposureCharacteristic;
    })
  })

  perilCharacteristics.forEach(perilCharacteristic => {
    let partition = partitions.find(partition => partition.startTimestamp === perilCharacteristic.coverageStartTimestamp && partition.endTimestamp === perilCharacteristic.coverageEndTimestamp);
    if (partition) {
      partition.perilCharacteristics = [...partition.perilCharacteristics, perilCharacteristic];
    } else {
      partition = {
        startTimestamp: perilCharacteristic.coverageStartTimestamp,
        endTimestamp: perilCharacteristic.coverageEndTimestamp,
        perilCharacteristics: [perilCharacteristic],
        vehicles: {
          byId: {},
          allIds: []
        },
        drivers: {
          byId: {},
          byVehicleId: {},
          allIds: []
        },
        perils: {
          byId: {},
          byVehicleId: {},
          allIds: []
        },
        policy: policyCharacteristicsMap[perilCharacteristic.policyCharacteristicsLocator]
      }
      partitions.push(partition);
    }
  })

  // Try to sort partitions in ascending time order
  partitions.sort((a, b) => {
    return a.startTimestamp - b.startTimestamp || a.endTimestamp - b.endTimestamp;
  })
  // partitions.sort();

  // console.log('partitions', partitions);

  partitions.forEach(partition => {
    partition.perilCharacteristics.forEach(perilCharacteristic => {
      const exposureCharacteristic = exposureCharacteristicMap[perilCharacteristic.exposureCharacteristicsLocator];
      const exposureLocator = exposureCharacteristic.exposureLocator;
      if (!partition.vehicles.byId[exposureLocator]) {
        let vehicle = Object.assign({}, exposureCharacteristic.vehicle);
        vehicle.exposureLocator = exposureLocator;
        vehicle.monthlyPrice = '12.75'; // TODO: how to get this?
        partition.vehicles.byId[exposureLocator] = vehicle;
        partition.vehicles.allIds.push(exposureLocator);

        // Use driverId to identify the same drivers (who may have different Socotra driverLocators)
        vehicle.driver.forEach(driver => {
          const driverId = driver.driverId;
          if (!partition.drivers.byId[driverId]) {
            partition.drivers.byId[driverId] = Object.assign({}, driver);
            partition.drivers.allIds.push(driverId);
          }
          if (!partition.drivers.byVehicleId[exposureLocator]) {
            partition.drivers.byVehicleId[exposureLocator] = [driverId];
          } else {
            partition.drivers.byVehicleId[exposureLocator].push(driverId);
          }
        })

        // Want to keep an array of the drivers of the vehicle on the vehicle object (as driverIds)
        delete vehicle.driver;
        vehicle.driver = partition.drivers.byVehicleId[exposureLocator];
      }

      let perilId = perilCharacteristic.perilLocator;
      let peril = perilsMap[perilId];
      if (!partition.perils.byId[perilId]) {
        partition.perils.byId[perilId] = peril;
        partition.perils.allIds.push(perilId);
      }
      if (!partition.perils.byVehicleId[exposureLocator]) {
        partition.perils.byVehicleId[exposureLocator] = [perilId];
      } else {
        partition.perils.byVehicleId[exposureLocator].push(perilId);
      }
    })
    delete partition.perilCharacteristics;
  })

  // Use timestamp if given, else either use current timestamp or policy start timestamp, whichever one is later
  let policyTimestamp;
  if (!timestamp) {
    const currentTimestamp = new Date().getTime();
    const policyStartTimestamp = policy.originalContractStartTimestamp;
    policyTimestamp = currentTimestamp > policyStartTimestamp ? currentTimestamp : policyStartTimestamp;
  } else {
    policyTimestamp = timestamp;
  }

  // Now filter partitions to get only those where the timestamp falls in the time range
  let filteredPartitions = partitions.filter(partition => policyTimestamp < partition.endTimestamp && policyTimestamp >= partition.startTimestamp);

  // If there are no partitions falling within the time range, it means the policy is either in grace or lapsed - just grab all partitions in that case
  if (!filteredPartitions.length) filteredPartitions = partitions;
  // console.log('filteredPartitions', filteredPartitions);

  const nextRenewal = nextRenewalSelector(state, policyId);

  let policySummary = {
    startDate: moment(parseInt(policy.originalContractStartTimestamp)).format("DD/MM/YYYY"),
    nextPaymentDate: nextRenewal && nextRenewal.invoice ? moment(parseInt(nextRenewal.invoice.dueTimestamp)).format("DD/MM/YYYY") : "",
    nextPaymentAmount: nextRenewal && nextRenewal.price ? nextRenewal.price.newTotal : "",
    // nextPaymentAmount: nextRenewal && nextRenewal.invoice ? nextRenewal.invoice.totalDue : "",
    invoices,
    policyId,
    policyholders,
    status: getPolicyStatus(policy.isGrace, policy.isLapse),
    usingTimestamp: policyTimestamp, // debugging
    usingDate: moment(parseInt(policyTimestamp)).format('DD/MM/YYYY') // debugging
  };

  // Merge all the vehicle, driver, peril data into one object
  const mergedData = filteredPartitions.reduce((accumulator, currentValue) => {
    Object.keys(currentValue.vehicles.byId).forEach(vehicleId => { if (!accumulator.vehicles.byId[vehicleId]) accumulator.vehicles.byId[vehicleId] = currentValue.vehicles.byId[vehicleId]; })
    accumulator.vehicles.allIds = [...new Set([...accumulator.vehicles.allIds, ...currentValue.vehicles.allIds])]
    Object.keys(currentValue.drivers.byId).forEach(driverId => { if (!accumulator.drivers.byId[driverId]) accumulator.drivers.byId[driverId] = currentValue.drivers.byId[driverId]; })
    Object.keys(currentValue.drivers.byVehicleId).forEach(driverId => { if (!accumulator.drivers.byVehicleId[driverId]) accumulator.drivers.byVehicleId[driverId] = currentValue.drivers.byVehicleId[driverId]; })
    accumulator.drivers.allIds = [...new Set([...accumulator.drivers.allIds, ...currentValue.drivers.allIds])]
    Object.keys(currentValue.perils.byId).forEach(perilId => { if (!accumulator.perils.byId[perilId]) accumulator.perils.byId[perilId] = currentValue.perils.byId[perilId]; })
    Object.keys(currentValue.perils.byVehicleId).forEach(perilId => { if (!accumulator.perils.byVehicleId[perilId]) accumulator.perils.byVehicleId[perilId] = currentValue.perils.byVehicleId[perilId]; })
    accumulator.perils.allIds = [...new Set([...accumulator.perils.allIds, ...currentValue.perils.allIds])]
    return accumulator;
  }, {
    vehicles: {
      byId: {},
      allIds: []
    },
    drivers: {
      byId: {},
      byVehicleId: {},
      allIds: []
    },
    perils: {
      byId: {},
      byVehicleId: {},
      allIds: []
    },
  });

  // For policy - this should be the same across all the partitions, so just get the first one
  policySummary = Object.assign(policySummary, mergedData, { policy: filteredPartitions.length ? filteredPartitions[0].policy : null });

  // console.log('policySummary', policySummary);
  return policySummary;
}

// Array of policy summaries - used in OSS dashboard
export const policySummariesSelector = (state, timestamp) => {
  const policyIds = policyIdsSelector(state);
  return policyIds.map(policyId => policySummarySelector(state, policyId, timestamp));
}

export const policyDocumentsSelector = (state, policyId) => {
  const policy = policyByIdSelector(state, policyId);
  const documents = [];
  policy.documents.forEach(document => {
    const modification = policy.modifications.find(modification => modification.locator === document.policyModificationLocator);
    if (modification) documents.push(Object.assign({}, document, { effectiveTimestamp: modification.effectiveTimestamp }));
  });
  return documents;
}

export const policyInvoicesSelector = (state, policyId) => {
  const policy = policyByIdSelector(state, policyId);
  return policy.invoices;
}
