import {
  answerByFieldNameAndAnswerGroup,
  currentSectionIndexSelector,
  getFirstChildFieldsForSection,
  answerGroupIds,
  answersByField,
  underwritingSelector,
  formTypeSelector,
  policyFinalised,
  quoteCreatedSelector,
  endorsementCreatedSelector,
  currentSectionSelector,
  sectionsSelector,
  endorsementFinalisedSelector,
  sectionByUrlParamSelector,
  previousSectionsSelector,
  validatedSectionsSelector,
  currentSectionUrlParamSelector,
  nextSectionUrlParamSelector,
  prevSectionUrlParamSelector,
  sectionIdByUrlParamSelector,
  editPolicySelector
  } from "redux/selectors";
import { userFormattedDate, validation } from "helpers/fieldValidations";
import { shouldUpdateQuote, submitForm } from "redux/actions";
import { getFlatFieldsAndSubfieldsForSection } from "redux/selectors/Field";
import { upsertAnswer, upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import {  createAnswerGroupFromField } from "redux/actions/orm/AnswerGroup";
import { updateLeads } from "redux/actions/lead";
import { validateAnswer } from "redux/actions/validation";
import { createEndorsement, updateEndorsement } from "redux/actions/endorsement";
import { getQuotePrice, getEndorsementPrice } from "redux/actions/price";
import { processUnderwriting } from "redux/actions/underwriting";
import { fraudCheck } from "redux/actions/fraud";
import { getRef } from "redux/utils";
import { getFieldById, isFieldVisibleInThisAnswerGroup } from "redux/selectors/Field";
import { getAnswersForFieldIds } from "redux/selectors/Answer";
import {
  NEXT_SECTION,
  PREV_SECTION,
  NAVIGATE_TO_SECTION,
  SET_VALID_SECTION_URL_PARAM,
  SET_SECTION_URL_PARAM,
  REMOVE_VALID_SECTION_URL_PARAM
} from "redux/actionTypes";
import history from "helpers/history";
import { fieldByName } from "redux/selectors";
import { initialiseQuote, initialiseClaim, initialiseContact } from "helpers/navigation";

export async function isValidSection(dispatch, getState, id) {
  // returns an array of the field errors in a section OR false without manipulating the answer models
  const allFieldsInSection = getFlatFieldsAndSubfieldsForSection(getState(), id);
  const fieldIndexesWithValidations = allFieldsInSection.filter(field => field.validations).map(field => field.id);
  // console.log('field indexes with validations', fieldIndexesWithValidations);

  const answers = getAnswersForFieldIds(getState(), fieldIndexesWithValidations);
  // console.log('all answers in this section:', answers);
  const answersInsideVisibleFields = answers.filter(a => isFieldVisibleInThisAnswerGroup(getState(), {fieldId: a.field, answerGroup: a.answerGroup}));
  // console.log('only the relevant answers for validating:', answersInsideVisibleFields);

  // run validations to filter out field/AG combinations which don't need validating

  let arraySectionAnswerErrors = await new Promise(async (resolve, reject) => {
    await Promise.all(answersInsideVisibleFields.map(async answer => {
      let value = answer.value;
      const field = getFieldById(getState(), answer.field);
      // console.log('field', field);
      // console.log('answer', answer);
      const answerGroupId = answer.answerGroup;

      if (field.type === "date-single-day" || field.type === "date") {
        value = userFormattedDate(value);
      }

      const errors = await validation(
        field.validations,
        value,
        getState(),
        answerGroupId,
        e => dispatch(e)
      );

      if (errors.filter(e => e).length) {
        // console.log('validation error', field.name, errors);
        dispatch(
          validateAnswer(answer.value, answer, true)
        );
      }
      return errors.filter(e => e).length > 0;

    })).then(fieldsInSectionWithErrors => {
      // take an array with true/false for each field in the section (based on if there are errors)
      // if there are fields with errors in this section, return FALSE (the section is NOT valid)
      resolve(fieldsInSectionWithErrors.filter(f => f));
    });
  });

  const isValidSection = arraySectionAnswerErrors.filter(e => e).length > 0 ? false : true;

  return isValidSection ? Promise.resolve() : Promise.reject();
}

export function setSectionUrlParam(urlParam) {
  return {
    type: SET_SECTION_URL_PARAM,
    payload: urlParam
  }
}

export function setValidSectionUrlParam(urlParam) {
  return {
    type: SET_VALID_SECTION_URL_PARAM,
    payload: urlParam
  }
}

export function validateSectionUrlParam(urlParam) {
  return (dispatch, getState) => {
    //console.log('checking section url param:', urlParam);
    const section = sectionByUrlParamSelector(getState(), urlParam);
    if (section) {
      // console.log('valid section url param!');
      return Promise.resolve();
    } else {
      return Promise.reject(`no section with url param ${urlParam}`);
    }
  }
}

export function validateAllPreviousSections(urlParam) {
  return (dispatch, getState) => {
    const previousSections = previousSectionsSelector(getState(), urlParam).filter(s => !s.hidden);
    // console.log('previous sections', previousSections);
    if (!previousSections.length) return Promise.resolve();

    const validatedSections = validatedSectionsSelector(getState());
    // console.log('validated sections', validatedSections);
    const firstInvalidSection = previousSections.find(section => !validatedSections.includes(section.urlParam));
    // console.log('first invalid section', firstInvalidSection);
    if (firstInvalidSection) {
      return Promise.reject(firstInvalidSection);
    } else {
      return Promise.resolve();
    }
  }
}

function validateCurrentSection() {
  return async (dispatch, getState) => {
    const currentSectionUrlParam = currentSectionUrlParamSelector(getState());
    // console.log('validating current section', currentSectionUrlParam);

    try {
      const sectionId = sectionIdByUrlParamSelector(getState(), currentSectionUrlParam);
      await isValidSection(dispatch, getState, sectionId);
    } catch (error) {
      // console.log('current section is invalid');
      return Promise.reject(error);
    }

    // console.log('current section is valid');
    dispatch(setValidSectionUrlParam(currentSectionUrlParam));
    return Promise.resolve();
  }
}

// Before navigation on current validated section
export function preNavigationActions() {
  return async (dispatch, getState) => {
    try {
      const formType = formTypeSelector(getState());
      switch (formType) {
        case "Quote":
          if (!quoteCreatedSelector(getState())) {
            await dispatch(initialiseQuote());
          } else if (!policyFinalised(getState())) {
            await Promise.all([
              dispatch(updateLeads()),
              dispatch(shouldUpdateQuote())
            ]);
          }
          break;

        case "Endorsement":
          if (!endorsementCreatedSelector(getState())) {
            dispatch(createEndorsement());
          } else if (!endorsementFinalisedSelector(getState())) {
            dispatch(updateLeads());
            return dispatch(updateEndorsement());
          }
          break;

        case "Claims":
        const currentSection = getRef(currentSectionSelector(getState()));
        if (currentSection.submitOnNext) {
          dispatch(submitForm());
        }
        break;

        case "Contact":
        const currentContactSection = getRef(currentSectionSelector(getState()));
          if (currentContactSection.submitOnNext) {
            dispatch(submitForm());
            }  
          break;
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

// After navigation to new unvalidated section
export function postNavigationActions() {
  return async (dispatch, getState) => {
    const currentSection = getRef(currentSectionSelector(getState()));
    // console.log('current section in post navigation actions', currentSection);
    try {
      if (currentSection.navigationName === "Quote") {
        await Promise.all([
          dispatch(fraudCheck()),
          dispatch(processUnderwriting())
        ]);

        const formType = formTypeSelector(getState());
        if (formType === "Quote") {
          await dispatch(getQuotePrice());
        } else if (formType === "Endorsement") {
          await dispatch(getEndorsementPrice());
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.error(error);
    } finally {
      window.scrollTo(0, 0);
    }
  }
}

const QUOTE_AND_BUY_ROUTE = "free-quote";
// const ENDORSEMENT_ROUTE = `oss/${policyId}/edit`;
const endorsementRoute = (policyId) => `oss/${policyId}/edit`;
const CLAIMS_ROUTE = "oss/claims";
const CONTACT_ROUTE = "oss/contact";

export function navigateToRoute(sectionUrlParam) {
  //console.log('navigating to section', sectionUrlParam);
  return (dispatch, getState) => {
    const formType = formTypeSelector(getState());
    switch (formType) {
      case "Quote":
        history.push(`${reactRoute}/${QUOTE_AND_BUY_ROUTE}/${sectionUrlParam}`);
        break;

      case "Endorsement":
        history.push(`${reactRoute}/${endorsementRoute(editPolicySelector(getState()))}/${sectionUrlParam}`);
        break;

      case "Claims":
        history.push(`${reactRoute}/${CLAIMS_ROUTE}/${sectionUrlParam}`);
        break;

      case "Contact":
        history.push(`${reactRoute}/${CONTACT_ROUTE}/${sectionUrlParam}`);
        break;
    }
  }
}

export function resetRoute() {
  return (dispatch, getState) => {
    const formType = formTypeSelector(getState());
    switch (formType) {
      case "Quote":
        history.push(`${reactRoute}`);
        break;

      case "Endorsement":
        history.push(`${reactRoute}/oss/${editPolicySelector(getState())}`);
        break;

      case "Claims":
        history.push(`${reactRoute}/oss`);
        break;

      case "Contact":
        history.push(`${reactRoute}`);
        break;
    }
  }
}

export function navigateToNextSection() {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: 'START_NAVIGATION' });

      // Do validation on current section
      try {
        await dispatch(validateCurrentSection());
      } catch (error) {
        window.requestAnimationFrame(() => {
          const invalidField = document.querySelector(".validation-error");
          invalidField && invalidField.scrollIntoView();
        })
        throw error;
      }

      // Check if there is a next section
      const nextSectionUrlParam = nextSectionUrlParamSelector(getState());
      if (!nextSectionUrlParam) return Promise.reject('there is no next section. abort.');

      // TODO: Prob return preNavigationActionsPromise and show loading state on PricingSection for updateQuote loading
      // RV: yes, lets put this in the navigation button action, so we have 3 promises where we do Pre, Action, Post nav actions
      try {
        await dispatch(preNavigationActions());
        dispatch(navigateToRoute(nextSectionUrlParam));
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch({ type: 'END_NAVIGATION' });
    }
  }
}

export function navigateToPrevSection() {
  return async (dispatch, getState) => {

    const prevSectionUrlParam = prevSectionUrlParamSelector(getState());
    if (!prevSectionUrlParam) return Promise.reject('there is no prev section. abort.');

    dispatch(navigateToRoute(prevSectionUrlParam));

    return Promise.resolve();
  }
}

export function removeValidSectionUrlParam(urlParam) {
  return {
    type: REMOVE_VALID_SECTION_URL_PARAM,
    payload: urlParam
  }
}

export function removeCurrentOnwardsFromValidatedSections() {
  return (dispatch, getState) => {
    const currentSectionUrlParam = currentSectionUrlParamSelector(getState());
    const sections = sectionsSelector(getState()).filter(s => !s.hidden);
    let removeFlag = false;
    sections.forEach(section => {
      if (section.urlParam === currentSectionUrlParam) removeFlag = true;
      if (removeFlag) dispatch(removeValidSectionUrlParam(section.urlParam));
    })
  }
}
