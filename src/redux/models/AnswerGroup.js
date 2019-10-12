import { attr, fk, many, Model } from "redux-orm";

import { 
  CREATE_ANSWER_GROUP, 
  DELETE_ANSWER_GROUP, 
  CREATE_RELATIONSHIP, 
  DELETE_RELATIONSHIP, 
  UPDATE_ANSWER_GROUP, 
  CREATE_LEAD_SUCCESS, 
  UPDATE_LEAD_SUCCESS, 
  RESET_FORM } from "redux/actionTypes";

export default class AnswerGroup extends Model {
  static modelName = "AnswerGroup";

  static fields = {
    field: fk("Field", "answerGroups"),
    answerGroups: many("AnswerGroup", "relatedAnswerGroups"),
    fieldName: attr()
  };

  // TODO: add {} around each case statement
  static reducer(action, AnswerGroup, session) {
    const { payload, type } = action;
    switch (type) {
      case CREATE_ANSWER_GROUP:
        AnswerGroup.create(payload);
        break;

      case UPDATE_ANSWER_GROUP:
        AnswerGroup.withId(payload.id).update(payload);
        break;

      case DELETE_ANSWER_GROUP:
        AnswerGroup.withId(payload).answers.toModelArray().forEach(answer => answer.delete());
        AnswerGroup.withId(payload).delete();
        break;

      case CREATE_RELATIONSHIP:
        AnswerGroup.withId(payload[0]).answerGroups.add(payload[1]);
        break;

      case DELETE_RELATIONSHIP:
        try { AnswerGroup.withId(payload[0]).answerGroups.remove(payload[1]); } catch (error) {}
        try { AnswerGroup.withId(payload[1]).answerGroups.remove(payload[0]); } catch (error) {}
        break;

      case RESET_FORM:
        AnswerGroup.all().toModelArray().forEach(item => item.delete());
        break;

      case CREATE_LEAD_SUCCESS: {
        const answerGroup = AnswerGroup.all().filter({ entity: "policyholder", leadId: null, accountId: null }).first();
        if (answerGroup) {
          answerGroup.update(Object.assign({}, answerGroup.ref, {
            leadId: payload
          }));
        }
        break;
      }

      case UPDATE_LEAD_SUCCESS: {
        const answerGroup = AnswerGroup.withId(payload.answerGroupId);
        if (answerGroup) {
          answerGroup.update(Object.assign({}, answerGroup.ref, {
            previousUpdateLeadPayload: payload.leadPayload
          }));
        }
        break;
      }

      default:
        return;
    }
  }
}
