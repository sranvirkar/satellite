import React, { Component } from "react";
import { connect } from "react-redux";
import { navigateSectionForwards } from "redux/actions/navigation";
import { answerGroups } from "redux/selectors";
import { quotePolicyPriceSelector } from "redux/selectors/pricing/quote";

import ExposureSummaryVehicle from "components/app-shared/ExposureSummaryVehicle";
import BannerTotals from "components/app-shared/BannerTotals";
import Tooltip from "components/app-shared/Tooltip";
import QuoteProduct from "components/quote-and-buy/QuoteProduct";

class PricingSection extends Component {

  // TODO: Delete toFixed once Earnix does the rounding
  roundedPrice = (number) => `$${number.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  render() {
    const { exposureSections, quotePrice, navigateSectionForwards, allPerils } = this.props;

    if (!quotePrice) return null;

    const totals = (
      <ul className="totals-tooltip-inner ui-kit-body-small">
        <li>
          <p>Monthly Premium:</p>
          <span>{this.roundedPrice(quotePrice.premiumStreet)}</span>
        </li>
        <li>
          <p>Fire State Levy:</p>
          <span>{this.roundedPrice(quotePrice.premiumFsl)}</span>
        </li>
        <li>
          <p>Goods and Services Tax:&nbsp;&nbsp;</p>
          <span>{this.roundedPrice(quotePrice.premiumGst)}</span>
        </li>
        <li>
          <p>Stamp Duty:</p>
          <span>{this.roundedPrice(quotePrice.premiumStampDuty)}</span>
        </li>
      </ul>
    )

    return (
      <ul className="shared-QuoteAndBuyAdjust">

        <BannerTotals>
          <p className="ui-kit-label-bold">Our best price for you</p>
          <span>{this.roundedPrice(quotePrice.premiumPayable)}</span>

          <p className="ui-kit-body-small">
            Monthly Incl GST & Gov charges
            <Tooltip
              size="tiny"
              color="grey"
              down="true"
              width="170"
              uniqueId="totals-monthly">
              {totals}
            </Tooltip>
          </p>
        </BannerTotals>

        <span
          onClick={() => {navigateSectionForwards();}}
          className="proceed-to-payment ui-kit-label-bold">
          Proceed to payment
        </span>

        <QuoteProduct exposureSections={exposureSections} allPerils={allPerils}/>

        {
          exposureSections &&
          exposureSections.map((exposure, index) =>
            <ExposureSummaryVehicle
              key={`${exposure.fieldName}-${index + 1}-summary`}
              answerGroupId={exposure.id}
              index={index}
              section={exposure} />
          )
        }

        <p className="ui-kit-body-small">
          Coles Insurance is issued by IAG Australia
        </p>
      </ul>
    );
  }
}

function stateToProps(state) {
  return {
    exposureSections: answerGroups(state, 'vehicle'),
    quotePrice: quotePolicyPriceSelector(state)
  };
}

const dispatchToProps = {
  navigateSectionForwards
};

export default connect(
  stateToProps,
  dispatchToProps
)(PricingSection);
