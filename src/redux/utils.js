import moment from "moment";

export const getNextAnswerId = (function() {
    let nextAnswerId = 0;
    return function() { 
        return nextAnswerId++; 
    };
})();

export const getNextAnswerGroupId = (function() {
    let nextAnswerGroupId = 0;
    return function () {
        return nextAnswerGroupId++;
    };
})();

export const getNextFieldGroupId = (function () {
    let nextFieldGroupId = 0;
    return function () {
        return nextFieldGroupId++;
    };
})();

export const getDefaultValue = (field) => {
  if (field.defaultValue) return field.defaultValue;
  
  switch(field.type) {
    case "policyholders":
      return [];
    case "range":
      return "400"; // TODO: make this dynamic?
    default:
      return "";
  }
}

// Returns number if string is a number, else returns original string
export const parseIntIfNumber = (str) => {
  return isNaN(parseInt(str)) ? str : parseInt(str);
}

export const getRef = (ormModel) => {
  return ormModel.ref;
}

// Returns the fields (property) and values (key) for an answer group
export const constructDataObject = (answers, options) => {
  const defaults = {
    showExcludeFromResponsePayload: false, // [boolean] include fields that have "excludeFromResponsePayload: true" in QuestionSetPayload
    dataSource: null, // [string] only include fields that have matching dataSource in QuestionSetPayload
    useDataSourceFieldnames: false, // [boolean] use "dataSourceFieldname" instead of "name" in QuestionSetPayload as property name
    excludeEmptyString: false // [boolean] exclude fields that have an empty string as the value
  }

  const applyOptions = Object.assign(defaults, options);

  let data = {};

  answers.forEach(answer => {
    if (answer.fieldName === undefined || answer.fieldName === null) return;
    if (!applyOptions.showExcludeFromResponsePayload && answer.excludeFromResponsePayload === true) return;
    if (applyOptions.dataSource !== null && answer.dataSource !== applyOptions.dataSource) return;
    if (applyOptions.excludeEmptyString && answer.value === "") return;

    if (applyOptions.useDataSourceFieldnames && answer.dataSourceFieldname) {
      data[answer.dataSourceFieldname] = answer.value;
    } else {
      data[answer.fieldName] = answer.value;
    }
  })

  return data;
}

// Return new object with property keys in caseFieldIds mapping
export const constructWebToCasePayload = (payload, caseType, fieldsMap) => {
  // orgId is global variable and is needed for web to case
  let data = {
    orgid: orgId,
    type: caseType
  };

  // Use fieldnames from caseFieldIds 
  Object.keys(payload).forEach(key => {
    if (caseFieldIds[key]) {
      // Booleans in web to case must have value 1 if true... anything else is false
      if (fieldsMap[key] && fieldsMap[key].type.match(/^radio-group/) && payload[key] === "Yes") {
        data[caseFieldIds[key]] = 1;
      } else if (fieldsMap[key] && fieldsMap[key].type.match(/^date/)) {
        // Web to case accepts date format in DD/MM/YYYY
        data[caseFieldIds[key]] = moment(payload[key], "YYYY-MM-DD").format("DD/MM/YYYY");
      } else {
        data[caseFieldIds[key]] = payload[key];
      }
    } else {
      data[key] = payload[key];
    }
  });

  // Convert to querystring
  return Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
}

// isGrace and isLapse are returned as strings in Socotra policy data - expecting parameters to be strings
export const getPolicyStatus = (isGrace, isLapse) => {
  if (isLapse === "true") {
    return "lapse";
  } else if (isGrace === "true") {
    return "grace";
  } else {
    return "active";
  }
}