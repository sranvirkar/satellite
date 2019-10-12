import { attr, fk, Model } from "redux-orm";

import {
  UPSERT_ANSWER,
  RESET_FORM } from "redux/actionTypes";

export default class Answer extends Model {
  static modelName = "Answer";

  static fields = {
    fieldName: attr(),
    value: attr(),
    field: fk("Field", "answers"),
    answerGroup: fk("AnswerGroup", "answers")
  };

  static parse(answerData) {
    return this.upsert(answerData);
  }

  static reducer(action, Answer, session) {
    const { payload, type } = action;
    switch (type) {
      case UPSERT_ANSWER:
        Answer.parse(payload);
        break;

      case RESET_FORM:
        session.Answer.all().toModelArray().forEach(item => item.delete());
        break;

      default:
        return;
    }
  }
}
