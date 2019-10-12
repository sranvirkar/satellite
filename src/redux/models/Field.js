import { attr, fk, Model } from "redux-orm";
import { RESET_FORM } from "redux/actionTypes";

export default class Field extends Model {
  static modelName = "Field";

  static fields = {
    name: attr(),
    order: attr(),
    title: attr(),
    type: attr(),
    icon: attr(),
    section: fk("Section", "fields"),
    parentField: fk("Field", "subfields")
  };

  static reducer(action, Section, session) {
    const { payload, type } = action;
    switch (type) {
      case RESET_FORM:
        session.Field.all().toModelArray().forEach(item => item.delete());
        break;
      default:
        return;
    }
  }

  static parse(fieldData, sectionId, parentFieldId) {
    const { Field } = this.session;

    const newFieldData = Object.assign({}, fieldData);
    delete newFieldData.fields;
    const parsedData = {
      ...newFieldData,
      section: sectionId,
      parentField: parentFieldId
    };

    const fieldModel = this.upsert(parsedData);
    if (fieldData.fields) {
      fieldData.fields.forEach(field => {

        // if there are conditions on the parent's condition string, concatenate them onto the end of the child strings
        // this way we always have the conditions that affect a given child defined on that child's model
        if (parsedData.conditions) {
          field.conditions = `${field.conditions ? `(${field.conditions}) && `: ''}(${parsedData.conditions})`;
        }

        Field.parse(field, null, fieldModel.id);
      });
    }

    return fieldModel;
  }
}
