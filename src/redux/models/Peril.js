import { attr, fk, many, Model } from "redux-orm";
import { 
  ADD_PERIL,
  UPDATE_PERIL,
  DELETE_PERIL,
  RESET_FORM } from "redux/actionTypes";

export default class Peril extends Model {
  static modelName = "Peril";

  static fields = {
    answerGroup: fk("AnswerGroup", "perils"),
    name: attr(),
    title: attr(),
    perilLocator: attr()
  };

  static reducer(action, Peril, session) {
    const { payload, type } = action;
    switch (type) {
      case ADD_PERIL:
        Peril.create({
          answerGroup: payload.answerGroupId,
          name: payload.value,
          perilLocator: payload.perilLocator
        })
        break;

      case DELETE_PERIL:
        const perilModel = Peril.all().filter({ answerGroup: payload.answerGroupId, name: payload.value }).first();
        Peril.withId(perilModel.id).delete();
        break;

      case UPDATE_PERIL:
        Peril.withId(payload.id).update(payload);
        break;

      case RESET_FORM:
        session.Peril.all().toModelArray().forEach(item => item.delete());
        break;

      default:
        return;
    }
  }
}
