import {
  DELETE_GROUP,
  CLEAR_POLICY_CHANGES,
  CREATE_QUOTE_SUCCESS,
  CREATE_ANSWER_GROUP,
  CREATE_RELATIONSHIP,
  DELETE_RELATIONSHIP,
  UPSERT_ANSWER,
  ADD_PERIL,
  REMOVE_PERIL,
  RESET_FORM } from "redux/actionTypes";

const initialState = {
  addExposures: [],
  removeAnswerGroups: [],
  updateAnswers: {},
  addFieldGroups: [],
  removeFieldGroups: [],
  removeRelationships: {},
  fieldValues: [],
  addPerils: {},
  removePerils: {},
};

const policyChanges = (state = initialState, action) => {
  let relationship;
  switch (action.type) {
    case CREATE_QUOTE_SUCCESS:
      return Object.assign({}, state, {
        policyLocator: action.payload.policyId,
      });

    case CREATE_ANSWER_GROUP:
      if (action.payload.entity === "exposure") {
        return Object.assign({}, state, {
          addExposures: [...state.addExposures, action.payload.id]
        })
      }
      return state;

    case DELETE_GROUP:
      const { [action.payload.answerGroup.id]: deletedExposure, ...otherProps } = state.addPerils;
      if (state.addExposures.includes(action.payload.answerGroup.id)) {
        return Object.assign({}, state, {
          addExposures: state.addExposures.filter(answerGroupId => answerGroupId !== action.payload.answerGroup.id),
          addPerils: {
            ...otherProps
          }
        });
      }
      if (action.payload.relationships.length) {
        return Object.assign({}, state, {
          removeAnswerGroups: [...state.removeAnswerGroups, action.payload.answerGroup],
          removeRelationships: {
            ...state.removeRelationships,
            [action.payload.answerGroup.id]: action.payload.relationships
          },
          addPerils: {
            ...otherProps
          }
        });
      } else {
        return Object.assign({}, state, {
          removeAnswerGroups: [...state.removeAnswerGroups, action.payload.answerGroup],
          addPerils: {
            ...otherProps
          }
        });
      }

    case CREATE_RELATIONSHIP:
      relationship = state.removeFieldGroups.find(relationship => {
        return (
          (relationship[0] === action.payload[0] && relationship[1] === action.payload[1]) ||
          (relationship[0] === action.payload[1] && relationship[1] === action.payload[0])
        );
      });
      if (relationship) {
        return Object.assign({}, state, {
          removeFieldGroups: state.removeFieldGroups.filter(fieldGroup => fieldGroup !== relationship)
        })
      }
      if (!state.addFieldGroups.find(relationship => {
        return (
          (relationship[0] === action.payload[0] && relationship[1] === action.payload[1]) ||
          (relationship[0] === action.payload[1] && relationship[1] === action.payload[0])
        );
      })) {
        return Object.assign({}, state, {
          addFieldGroups: [...state.addFieldGroups, [action.payload[0], action.payload[1]]]
        })
      }
      return state;

    case DELETE_RELATIONSHIP:
      relationship = state.addFieldGroups.find(relationship => {
        return (
          (relationship[0] === action.payload[0] && relationship[1] === action.payload[1]) ||
          (relationship[0] === action.payload[1] && relationship[1] === action.payload[0])
        );
      });

      if (relationship) {
        return Object.assign({}, state, {
          addFieldGroups: state.addFieldGroups.filter(fieldGroup => fieldGroup !== relationship)
        })
      }
      return Object.assign({}, state, {
        removeFieldGroups: [...state.removeFieldGroups, [action.payload[0], action.payload[1]]]
      })

    case UPSERT_ANSWER:
      if (action.payload.excludeFromResponsePayload || action.payload.fieldName === undefined) return state;

      const answerId = action.payload.id;
      const answerGroupId = action.payload.answerGroup;
      if (answerGroupId === undefined && !state.fieldValues.includes(answerId)) {
        return Object.assign({}, state, {
          fieldValues: [...state.fieldValues, answerId]
        });
      } else if (answerGroupId !== undefined && !state.addExposures.includes(answerGroupId) && !state.updateAnswers[answerId]) {
        return Object.assign({}, state, {
          updateAnswers: {
            ...state.updateAnswers,
            [answerId]: answerGroupId
          }
        })
      }
      return state;

    case ADD_PERIL:
      if (!state.addPerils[action.payload.answerGroupId]) {
        return Object.assign({}, state, {
          addPerils: {
            ...state.addPerils,
            [action.payload.answerGroupId]: [action.payload.value]
          }
        });
      } else if (state.addPerils[action.payload.answerGroupId] && !state.addPerils[action.payload.answerGroupId].includes(action.payload.value)) {
        return Object.assign({}, state, {
          addPerils: {
            ...state.addPerils,
            [action.payload.answerGroupId]: [...state.addPerils[action.payload.answerGroupId], action.payload.value]
          }
        });
      }
      return state;

    case REMOVE_PERIL:
      if (state.addPerils[action.payload.answerGroupId] && state.addPerils[action.payload.answerGroupId].includes(action.payload.value)) {
        return Object.assign({}, state, {
          addPerils: {
            ...state.addPerils,
            [action.payload.answerGroupId]: state.addPerils[action.payload.answerGroupId].filter(value => value !== action.payload.value)
          }
        });
      }

      if (state.removePerils[action.payload.answerGroupId]) {
        return Object.assign({}, state, {
          removePerils: {
            ...state.removePerils,
            [action.payload.answerGroupId]: [...state.removePerils[action.payload.answerGroupId], action.payload.value]
          }
        });
      } else {
        return Object.assign({}, state, {
          removePerils: {
            ...state.removePerils,
            [action.payload.answerGroupId]: [action.payload.value]
          }
        });
      }

    case CLEAR_POLICY_CHANGES:
      return initialState;

    case RESET_FORM:
      return initialState;

    default:
      return state;
  }
}

export default policyChanges;
