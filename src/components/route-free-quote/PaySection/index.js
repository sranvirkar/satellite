import React, { Component } from "react";
import Section from "components/app-shared/FormSection";
import FormField from "components/app-shared/FormField";
import FormContainer from "components/app-shared/FormContainer";
import VehicleSummary from "components/app-shared/VehicleSummary";
import PolicyholderCard from "components/app-shared/PolicyholderCard";
import { connect } from "react-redux";
import moment from 'moment';
import ReactDOM from "react-dom";

import { answerByFieldNameAndAnswerGroup } from "redux/selectors";
import { getGlobalAnswerByFieldName } from "redux/selectors/Answer";
import { navigateToRoute } from "redux/actions/navigation";
import { getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";
import BraintreePaymentForm from "../../app-shared/BraintreePaymentForm";
import AsideCardPayment from "components/route-free-quote/AsideCardPayment";

import { navigateToPrevSection } from "redux/actions/navigation";

class PaySection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sidebarPositionElement: null
    }
  }

  componentDidMount() {
    this.addResizeListener();
    this.calculateSidebarPosition();
  }

  componentWillUnmount() {
    this.removeResizeListener();
  }

  addResizeListener = () => window.addEventListener('resize', this.calculateSidebarPosition)
  removeResizeListener = () => window.removeEventListener('resize', this.calculateSidebarPosition)

  calculateSidebarPosition = () => {
    if (window.innerWidth > 650 && document.getElementById('sidebar')) {
      this.setState({sidebarPositionElement: 'sidebar'});
    } else {
      this.setState({sidebarPositionElement: 'cc-form-mobile-wrapper'});
    }
  }

  render() {
    const {
      policyStartDateAnswer,
      vehicleAnswerGroups,
      policyHolderAnswerGroups,
      navigateToPrevSection,
      navigateToRoute,
      summaryType
    } = this.props;

    const { sidebarPositionElement } = this.state;

    return (
      <React.Fragment>
        <div className="FreeQuote-PaySection">
          <div id="cc-form-mobile-wrapper" />
          {
            sidebarPositionElement &&
            ReactDOM.createPortal(
              <AsideCardPayment
                isMobile={sidebarPositionElement == "cc-form-mobile-wrapper"}/>,
              document.getElementById(sidebarPositionElement)
            )
          }

          <FormContainer
            headerTitle={`Policy start date`}
            headerActionText={'Edit'}
            headerAction={() => navigateToRoute("quote")}>
            <p className="policy-start-date poncho-h5">{moment(policyStartDateAnswer.value).format("dddd D MMMM YYYY")}</p>
          </FormContainer>

          {
            vehicleAnswerGroups && vehicleAnswerGroups.map((vehicle, index) =>
              <VehicleSummary
                summaryTypes={["pay"]}
                key={`key-${index}`}
                index={index}
                answerGroup={vehicle} />
            )
          }

          {
            policyHolderAnswerGroups.map((ph, index) =>
              <FormContainer
                key={index}
                headerTitle={`Policy holder`}
                headerActionText={'Edit'}
                headerAction={() => navigateToRoute("policyholder")}>
                <div className="policyholder-card-wrapper">
                  <PolicyholderCard answerGroupId={ph.id} isSelected="false"/>
                </div>
              </FormContainer>
            )
          }
        </div>
      </React.Fragment>

    )
  }
}

function stateToProps(state, props) {
  return {
    policyStartDateAnswer: answerByFieldNameAndAnswerGroup(state, { fieldName: 'policyStartDate' }),
    vehicleAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'vehicle' }),
    policyHolderAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'policyHolder' }),
  };
}

const dispatchToProps = {
  navigateToPrevSection,
  navigateToRoute
};

export default connect(
  stateToProps,
  dispatchToProps
)(PaySection);
