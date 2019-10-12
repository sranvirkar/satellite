import { orm } from "../orm";
import { createSelector } from "redux-orm";
import { dbStateSelector } from "../selectors";

export const getSubFields = (field) => {
  return {
    ...field.ref,
    subfields: field.subfields
      .toModelArray()
      .map(subfield => getSubFields(subfield))
  }
}

export const getFlatSubfields = (fieldModel) => {
  let queue = [...fieldModel.subfields.toModelArray()];
  let subfields = [];
  while (queue.length) {
    const model = queue.shift();
    if (model.ref.name && model.ref.type !== "group") subfields.push(model.ref);
    queue = queue.concat(model.subfields.toModelArray());
  }
  return subfields;
}

export const getFieldById = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, fieldId) => {
    return session.Field.withId(fieldId).ref;
  }
)

export const getFieldByName = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, fieldName) => {
    return session.Field
      .all()
      .filter({ name: fieldName })
      .toModelArray()
      .map(field => getSubFields(field))[0];
  }
)

export const getFieldModelById = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, fieldId) => {
    return session.Field.withId(fieldId);
  }
)

export const getNestedFieldsAndSubfieldsForSection = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, id) => {
    return session.Field
      .all()
      .filter({ section: id })
      .toModelArray()
      .map(field => getSubFields(field));
  }
)

export const getFlatFieldsAndSubfieldsForSection = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props,
  (session, id) => {

    let singleLayerArrayOfFields = [];

    const getFields = (field) => {
      singleLayerArrayOfFields.push(field.ref);
      field.subfields
        .toModelArray()
        .map(subfield => getFields(subfield));
    }

    session.Field
      .all()
      .filter({ section: id })
      .toModelArray()
      .map(field => getFields(field));

    return singleLayerArrayOfFields;
  }
)

export const isFieldVisibleInThisAnswerGroup = createSelector(
  orm,
  dbStateSelector,
  (state, props) => props.fieldId,
  (state, props) => props.answerGroup,
  (session, fieldId, answerGroup) => {
    const field = session.Field.withId(fieldId).ref;

    if (!field.conditions) return true;

    let conditionString = field.conditions;
    // console.log('conditionString', conditionString);

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    // gotta replace the field.name reference in this string with the right answer.value and then eval() it
    const allFields = session.Field.all().toRefArray();
    let fieldsReferencedInConditionString = allFields.filter(field => field.name && conditionString.includes(`${field.name} `));

    // console.log('fieldsReferencedInConditionString', fieldsReferencedInConditionString);
    //for all the fields that are directly referenced, make sure you also include all their parents.
    // using array.push()
    fieldsReferencedInConditionString.forEach(f => {
      if (f.parentField) {
        const parentFieldToAlsoInclude = session.Field.withId(f.parentField);
        // console.log('parentFieldToAlsoInclude', parentFieldToAlsoInclude);
        if (parentFieldToAlsoInclude) {
          fieldsReferencedInConditionString.push(parentFieldToAlsoInclude.ref);
        }
      }
    })

    // console.log("fieldsReferencedInConditionString", fieldsReferencedInConditionString);

    // TODO: refactor the below, {ref:{value:""}} is terrible, but i'm in a rush - RV 17/
    fieldsReferencedInConditionString.forEach(controllingField => {
      let answerToReplaceWith = session.Answer.all().filter({ field: controllingField.id, answerGroup: answerGroup }).first() || {ref:{value:""}};

      conditionString = conditionString.replaceAll(RegExp(`${controllingField.name} `), `'${answerToReplaceWith.ref.value}'`);
    })

    // console.log("conditionString after manipulation", conditionString, 'for field', field.name, 'returning:', eval(conditionString));

    return eval(conditionString);
  }
)
