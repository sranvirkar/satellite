import React, { Component } from "react";
import ReactDOM from "react-dom";
import Section from "components/app-shared/FormSection";
import FormField from "components/app-shared/FormField";
import FormContainer from "components/app-shared/FormContainer";
import VehicleSummary from "components/app-shared/VehicleSummary";
import RefundSidebar from "components/route-online-self-service/EditPolicy/RefundSidebar";
import { connect } from "react-redux";
import moment from 'moment';

import { getGlobalAnswerByFieldName } from "redux/selectors/Answer";
import { getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";
import { fieldByName, answerByFieldNameAndAnswerGroup } from "redux/selectors";

class FinaliseSection extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isEditingPolicyStartDate: false,
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
      this.setState({sidebarPositionElement: 'endo-finalise-mobile-wrapper'});
    }
  }

  render() {
    const {
      endorsementEffectiveDateAnswer,
      vehicleAnswerGroups,
      policyHolderAnswerGroups,
      navigateToNextSection,
      submitForm
    } = this.props;

    const { sidebarPositionElement } = this.state;

    return (
      <React.Fragment>
        <div id="endo-finalise-desktop-wrapper" />

        <div className="Route-OnlineSelfService-EditPolicy-FinaliseSection">
          <FormContainer
            headerTitle={`Endorsement effective date`}>
            <p className="endorsement-effective-date poncho-h5">
              {moment(endorsementEffectiveDateAnswer.value).format("dddd D MMMM YYYY")}
            </p>
          </FormContainer>

          {
            vehicleAnswerGroups && vehicleAnswerGroups.map((vehicle, index) =>
              <VehicleSummary
                summaryTypes={["finalise"]}
                key={`key-${index}`}
                index={index}
                answerGroup={vehicle} />
            )
          }
        </div>

        <div id="endo-finalise-mobile-wrapper" />

        {
          sidebarPositionElement &&
          ReactDOM.createPortal(
            <RefundSidebar
              isMobile={sidebarPositionElement == "endo-finalise-mobile-wrapper"}/>,
            document.getElementById(sidebarPositionElement)
          )
        }

      </React.Fragment>
    )
  }
}

function stateToProps(state, props) {
  return {
    endorsementEffectiveDateAnswer: answerByFieldNameAndAnswerGroup(state, { fieldName: 'endorsementEffectiveDate' }),
    vehicleAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'vehicle' }),
    policyHolderAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'policyHolder' }),
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(FinaliseSection);
