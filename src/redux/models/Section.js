import { fk, Model } from "redux-orm";
import { RESET_FORM } from "redux/actionTypes";

export default class Section extends Model {
  static modelName = "Section";

  static fields = {
    policy: fk("Policy", "sections")
  };

  static reducer(action, Section, session) {
    const { payload, type } = action;
    switch (type) {
      case RESET_FORM:
        session.Section.all().toModelArray().forEach(item => item.delete());
        break;
      default:
        return;
    }
  }

  static parse(sectionData, policyId) {
    const { Field } = this.session;

    const newSectionData = Object.assign({}, sectionData);
    delete newSectionData.fields;
    const parsedData = {
      ...newSectionData,
      policy: policyId
    };
    const sectionModel = this.upsert(parsedData);

    sectionData.fields.map((field) => {
      // console.log('test', field);
      Field.parse(field, sectionModel.id, null);
    })

    return sectionModel;
  }
}
