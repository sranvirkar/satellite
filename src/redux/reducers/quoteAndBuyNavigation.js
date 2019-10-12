import {
  RESET_FORM,
  SET_SECTION_URL_PARAM,
  SET_VALID_SECTION_URL_PARAM,
  REMOVE_VALID_SECTION_URL_PARAM } from "redux/actionTypes";

const initialState = {
  // sectionIndex: 0,
  sectionUrlParam: "",
  validatedSections: []
};

const quoteAndBuyNavigation = (state = initialState, action) => {
  switch (action.type) {
    case SET_SECTION_URL_PARAM:
      return Object.assign({}, state, {
        sectionUrlParam: action.payload
      });

    case SET_VALID_SECTION_URL_PARAM:
      return Object.assign({}, state, {
        validatedSections: state.validatedSections.includes(action.payload) ? state.validatedSections : [...state.validatedSections, action.payload]
      });

    case REMOVE_VALID_SECTION_URL_PARAM:
      return Object.assign({}, state, {
        validatedSections: state.validatedSections.filter(sectionUrlParam => sectionUrlParam !== action.payload)
      });

    // case 'NEXT_SECTION':
    //   const sectionIndex = state.sectionIndex;
    //   const completedSectionIndexes = state.completedSectionIndexes;
    //   return Object.assign({}, state, {
    //     sectionIndex: sectionIndex + 1,
    //     completedSectionIndexes: completedSectionIndexes.includes(sectionIndex + 1) ? completedSectionIndexes : [...completedSectionIndexes, sectionIndex + 1]
    //   });
    // case 'PREV_SECTION':
    //   return Object.assign({}, state, {
    //     sectionIndex: state.sectionIndex - 1
    //   });
    // case 'NAVIGATE_TO_SECTION':
    //   return Object.assign({}, state, {
    //     sectionIndex: action.payload
    //   });
    case RESET_FORM:
      return initialState;
    default:
      return state
  }
}

export default quoteAndBuyNavigation;
