import React, { Component } from "react";
import { connect } from "react-redux";
import FormContainer from "components/app-shared/FormContainer";
import MonthlyPremium from "components/app-shared/MonthlyPremium";
import PriceBreakdown from "components/app-shared/PriceBreakdown";
import { navigateToNextSection } from "redux/actions/navigation";
import { quotePolicyPriceSelector } from "redux/selectors/pricing/quote";
import { getAnswerGroupsByFieldName } from "redux/selectors/AnswerGroups";
import AsideReasonsToBuy from "components/route-free-quote/AsideReasonsToBuy";
import { calculateVerticalPosition }  from "helpers/sidebar-positioning";
import { debounce }  from "helpers/debounce";

class AsideOurBestPrice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scrollY: 0
    }
  }

  componentDidMount() {
    this._debouncedCalculateWidth = debounce(() => this.calculateWidth(), 50);
    this._debouncedCalculateVerticalPosition = debounce(() => this.calculateVerticalPosition(), 50);

    this.addResizeListener();
    this.addScrollListener();
    this.calculateWidth();
    this.calculateVerticalPosition();
  }

  componentWillUnmount() {
    this.removeResizeListener();
    this.removeScrollListener();
  }

  addResizeListener = () => window.addEventListener('resize', this._debouncedCalculateWidth)
  removeResizeListener = () => window.removeEventListener('resize', this._debouncedCalculateWidth)

  calculateWidth = () => {
    const { isMobile } = this.props;
    if (isMobile) {
      document.getElementById('free-quote-AsideOurBestPrice').style.width = `100%`;
      return;
    }

    // not debounced (can debounce for performance improvement)
    const value = document.getElementById('sidebar').parentElement.getBoundingClientRect().width;
    document.getElementById('free-quote-AsideOurBestPrice').style.width = value;
  }

  addScrollListener = () => window.addEventListener('scroll', this._debouncedCalculateVerticalPosition)
  removeScrollListener = () => window.removeEventListener('scroll', this._debouncedCalculateVerticalPosition)

  calculateVerticalPosition = () => {
    const { isMobile } = this.props;

    const { storedScrollY } = this.state;
    const direction = window.scrollY < storedScrollY ? "up" : "down";
    this.setState({storedScrollY: window.scrollY});

    const areElementsPresent =
      document.getElementById('free-quote-AsideOurBestPrice') &&
      document.querySelector('.shared-FormSection');
    if (isMobile || !areElementsPresent) { return; }

    calculateVerticalPosition(
      direction,
      'free-quote-AsideOurBestPrice',
      '.shared-FormSection'
    );
  }

  render() {
    const {
      navigateToNextSection,
      quotePrice,
      vehicleAnswerGroups,
      isMobile
    } = this.props;

    const roundedPrice = (number) => `${number.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
      <div
        id={`free-quote-AsideOurBestPrice`}
        className={`free-quote-AsideOurBestPrice`}
        style={{
          position: isMobile ? "static" : "absolute",
          top: isMobile ? "0" : "unset"
        }}>
        <FormContainer
          footerText="Confirm Policy"
          footerAction={quotePrice && quotePrice.premiumPayable ? navigateToNextSection : null}
          mainElementStyleRule="sidebar">
          <h3 className="poncho-lead bold">
            Our best price for you!
          </h3>
          <div id ="rtbContainer" className="reasonsToBuy">
            <AsideReasonsToBuy/>
          </div>

          {
            quotePrice &&
            <MonthlyPremium price={quotePrice.premiumPayable ? roundedPrice(quotePrice.premiumPayable) : false} colour="orange" />
          }

          {
            quotePrice &&
            <PriceBreakdown
              breakdownObject={{
                "Vehicles:": vehicleAnswerGroups.length,
                "Monthly Premium:": `$${roundedPrice(quotePrice.premiumStreet || 0)}`,
                "Fire State Levy:": `$${roundedPrice(quotePrice.premiumFsl || 0)}`,
                "Goods and Services Tax:" : `$${roundedPrice(quotePrice.premiumGst || 0)}`,
                "Stamp Duty:": `$${roundedPrice(quotePrice.premiumStampDuty || 0)}`
              }}
            />
          }

        </FormContainer>
      </div>
    )
  }
}

function stateToProps(state, props) {
  return {
    vehicleAnswerGroups: getAnswerGroupsByFieldName(state, { fieldName: 'vehicle' }),
    quotePrice: quotePolicyPriceSelector(state)
  };
}

const dispatchToProps = {
  navigateToNextSection
};

export default connect(
  stateToProps,
  dispatchToProps
)(AsideOurBestPrice);
