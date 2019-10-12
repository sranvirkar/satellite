import React, { Component } from "react";
import ReactDOM from "react-dom";
import Section from "components/app-shared/FormSection";
import FormField from "components/app-shared/FormField";
import FormContainer from "components/app-shared/FormContainer";
import VehicleSummary from "components/app-shared/VehicleSummary";
import AsideOurBestPrice from "components/route-free-quote/AsideOurBestPrice";
import { connect } from "react-redux";
import moment from 'moment';

import { getGlobalAnswerByFieldName } from "redux/selectors/Answer";
import { getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";
import { fieldByName, answerByFieldNameAndAnswerGroup } from "redux/selectors";

import { navigateToNextSection } from "redux/actions/navigation";

class QuoteSection extends Component {

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
      this.setState({sidebarPositionElement: 'quote-summary-mobile-wrapper'});
    }
  }


  render() {
    const {
      policyStartDate,
      policyStartDateAnswer,
      vehicleAnswerGroups,
      policyHolderAnswerGroups,
      navigateToNextSection,
      summaryType
    } = this.props;

    const {
      isEditingPolicyStartDate,
      sidebarPositionElement
    } = this.state;

    return (
      <React.Fragment>
        <div id="quote-summary-desktop-wrapper" />

        <div className="FreeQuote-QuoteSection">
          <FormContainer
            headerTitle={`Policy start date`}
            headerAction={!isEditingPolicyStartDate ? () => this.setState({isEditingPolicyStartDate: true}) : null}
            headerActionText={'Edit'}>
            {
              isEditingPolicyStartDate ?
              <div className="policy-start-date-field"><FormField field={policyStartDate}/></div>:
              <p className="policy-start-date poncho-h5">{moment(policyStartDateAnswer.value).format("dddd D MMMM YYYY")}</p>
            }
          </FormContainer>

          {
            vehicleAnswerGroups && vehicleAnswerGroups.map((vehicle, index) =>
              <VehicleSummary
                summaryTypes={["quote"]}
                key={`key-${index}`}
                index={index}
                answerGroup={vehicle} />
            )
          }
        </div>

        <div id="quote-summary-mobile-wrapper" />

        {
          sidebarPositionElement &&
          ReactDOM.createPortal(
            <AsideOurBestPrice
              isMobile={sidebarPositionElement == "quote-summary-mobile-wrapper"}/>,
            document.getElementById(sidebarPositionElement)
          )
        }

      </React.Fragment>
    )
  }
}

function stateToProps(state, props) {
  return {
    policyStartDate: fieldByName(state, 'policyStartDate'),
    policyStartDateAnswer: answerByFieldNameAndAnswerGroup(state, { fieldName: 'policyStartDate' }),
    vehicleAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'vehicle' }),
    policyHolderAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'policyHolder' }),
  };
}

const dispatchToProps = {
  navigateToNextSection
};

export default connect(
  stateToProps,
  dispatchToProps
)(QuoteSection);
