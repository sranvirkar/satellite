import React, { Component } from "react";
import { connect } from "react-redux";
import FormContainer from "components/app-shared/FormContainer";
import MonthlyPremium from "components/app-shared/MonthlyPremium";
import PriceBreakdown from "components/app-shared/PriceBreakdown";
import LoadingSpinner from "components/app-global/LoadingSpinner";
import { endorsementPolicyPriceSelector } from "redux/selectors/pricing/endorsement";
import { calculateVerticalPosition }  from "helpers/sidebar-positioning";
import { debounce }  from "helpers/debounce";
import { submitForm } from "redux/actions.js";

class RefundSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storedScrollY: 0
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
      document.getElementById('oss-edit-RefundSidebar').style.width = `100%`;
      return;
    }
    // not debounced (can debounce for performance improvement)
    const value = document.getElementById('sidebar').parentElement.getBoundingClientRect().width;
    document.getElementById('oss-edit-RefundSidebar').style.width = `${value}px`;
  }

  addScrollListener = () => window.addEventListener('scroll', this._debouncedCalculateVerticalPosition)
  removeScrollListener = () => window.removeEventListener('scroll', this._debouncedCalculateVerticalPosition)

  calculateVerticalPosition = () => {
    const { isMobile } = this.props;

    const { storedScrollY } = this.state;
    const direction = window.scrollY < storedScrollY ? "up" : "down";
    this.setState({storedScrollY: window.scrollY});

    const areElementsPresent =
      document.getElementById('endo-finalise-desktop-wrapper') &&
      document.querySelector('.shared-FormSection');
    if (isMobile || !areElementsPresent) { return; }

    calculateVerticalPosition(
      direction,
      'oss-edit-RefundSidebar',
      '.shared-FormSection'
    );
  }

  render() {
    const {
      endorsementPolicyPrice,
      isMobile,
      submitForm
    } = this.props;

    const roundedPrice = (number) => `${number.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
      <div
        id={`oss-edit-RefundSidebar`}
        className={`oss-edit-RefundSidebar`}
        style={{
          position: isMobile ? "static" : "absolute",
          top: isMobile ? "0" : "unset"
        }}>

        <FormContainer
          footerText={endorsementPolicyPrice ? "Confirm Policy" : ''}
          footerAction={endorsementPolicyPrice ? submitForm : null}
          mainElementStyleRule="sidebar">

          {
            endorsementPolicyPrice ?
              endorsementPolicyPrice.totalChange > 0 ? <h3 className="poncho-lead bold">Upfront payment</h3> :
              endorsementPolicyPrice.totalChange == 0 ?
              <React.Fragment>
                <h3 className="poncho-lead bold">Your policy</h3>
                <p className="poncho-caption">No additional deductions or additions will be made to your monthly fee.</p>
              </React.Fragment>:
              <h3 className="poncho-lead bold">Total refund:</h3>
             :
            <LoadingSpinner />
          }

          {
            endorsementPolicyPrice &&
            <MonthlyPremium
              price={endorsementPolicyPrice.totalChange ? roundedPrice(endorsementPolicyPrice.totalChange) : false}
              notMonthly={true}
              hideCaption={true}
              colour="green" />
          }

          {
            endorsementPolicyPrice &&
            <PriceBreakdown
              breakdownObject={{
                "Base Premium Change:": `$${roundedPrice(endorsementPolicyPrice.grossPremiumChange || 0)}`,
                "Fire State Levy Change:": `$${roundedPrice(endorsementPolicyPrice.taxGroups.find(g => g.name == 'fsl').change || 0)}`,
                "Goods and Services Tax Change:" : `$${roundedPrice(endorsementPolicyPrice.taxGroups.find(g => g.name == 'gst').change || 0)}`,
                "Stamp Duty Change:": `$${roundedPrice(endorsementPolicyPrice.taxGroups.find(g => g.name.includes('stamp') && (g.change > 0 || g.change < 0)).change || 0)}`
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
    endorsementPolicyPrice: endorsementPolicyPriceSelector(state)
  };
}

const dispatchToProps = {
  submitForm
};

export default connect(
  stateToProps,
  dispatchToProps
)(RefundSidebar);
