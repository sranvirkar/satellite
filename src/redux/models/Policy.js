import { Model, attr } from "redux-orm";
import {
  CREATE_QUOTE_AND_BUY_FORM,
  CREATE_CONTACT_FORM,
  CREATE_ENDORSEMENT_FORM,
  CREATE_CLAIMS_FORM,
  RESET_FORM } from "redux/actionTypes";

export default class Policy extends Model {
  static modelName = "Policy";
  static options = {
    idAttribute: "name"
  };

  static fields = {
    name: attr(),
    termsAndConditions: attr()
  };

  static parse(policyData, usage) {
    const policyId = policyData.name;
    const { Section } = this.session;

    const newPolicyData = Object.assign({}, policyData);
    delete newPolicyData.sections;
    delete newPolicyData.quoteAndBuyStartDateSection;
    delete newPolicyData.endorsementEffectiveDateSection;


    const parsedData = {
      ...newPolicyData
    };

    switch (usage) {
      case "Quote":
        const quoteAndBuy = [
          policyData.quoteAndBuyStartDateSection,

          policyData.vehicleSection,
          policyData.driverSection,
          policyData.policyholderSection,

          policyData.declarationsSection,
          policyData.quoteQuoteSection,
          policyData.quotePaySection,
          policyData.quoteConfirmationSection
        ];
        quoteAndBuy.map((section) =>
          Section.parse(section, policyId)
        );
        break;

      case "Endorsement":
        const endorsement = [
          policyData.endorsementEffectiveDateSection,
          policyData.endorsementEditPolicySection,
          policyData.declarationsSection,
          policyData.endorsementFinaliseSection,

          //hidden sections
          {...policyData.vehicleSection, hidden: true},
          {...policyData.driverSection, hidden: true},
          {...policyData.policyholderSection, hidden: true}
        ];

        endorsement.map((section) =>
          Section.parse(section, policyId)
        );
        break;

      case "Claims":
        policyData.sections.map((section) =>
          Section.parse(section, policyId)
        );
        break;

      case "Contact":
        policyData.sections.map((section) =>
          Section.parse(section, policyId)
        );
        break;
      default:
    }

    return this.upsert(parsedData);
  }

  static reducer(action, Policy, session) {
    const { payload, type } = action;
    switch (type) {
      case CREATE_QUOTE_AND_BUY_FORM:
        Policy.parse(payload, "Quote");
        break;

      case CREATE_ENDORSEMENT_FORM:
        Policy.parse(payload, "Endorsement");
        break;

      case CREATE_CLAIMS_FORM:
        Policy.parse(payload, "Claims");
        break;

      case CREATE_CONTACT_FORM:
        Policy.parse(payload, "Contact");
        break;

      case RESET_FORM:
        session.Policy.all().toModelArray().forEach(item => item.delete());
        break;

      default:
        return;
    }
  }
}
