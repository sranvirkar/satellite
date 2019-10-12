import React, { Component } from "react";
import ReactDOM from "react-dom";
import { calculateVerticalPosition }  from "helpers/sidebar-positioning";
import { debounce }  from "helpers/debounce";

import BraintreePaymentFormContainer from "components/app-shared/BraintreePaymentFormContainer";

class AsideCardPayment extends Component {
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
      document.getElementById('free-quote-AsideCardPayment').style.width = `100%`;
      return;
    }

    // not debounced (can debounce for performance improvement)
    const value = document.getElementById('sidebar').parentElement.getBoundingClientRect().width;
    document.getElementById('free-quote-AsideCardPayment').style.width = value;
  }

  addScrollListener = () => window.addEventListener('scroll', this._debouncedCalculateVerticalPosition)
  removeScrollListener = () => window.removeEventListener('scroll', this._debouncedCalculateVerticalPosition)

  calculateVerticalPosition = () => {
    const { isMobile } = this.props;

    const { storedScrollY } = this.state;
    const direction = window.scrollY < storedScrollY ? "up" : "down";
    this.setState({storedScrollY: window.scrollY});

    const areElementsPresent =
      document.getElementById('free-quote-AsideCardPayment') &&
      document.querySelector('.shared-FormSection');
    if (isMobile || !areElementsPresent) { return; }

    calculateVerticalPosition(
      direction,
      'free-quote-AsideCardPayment',
      '.shared-FormSection'
    );
  }

  render() {
    const { isMobile } = this.props;
    const { topOffset } = this.state;

    return (
      <div
        id={`free-quote-AsideCardPayment`}
        className={`free-quote-AsideCardPayment`}
        style={{
          position: isMobile ? "static" : "absolute",
          top: isMobile ? "0" : "unset"
        }}>
        <BraintreePaymentFormContainer />
        <div className="secure-checkout poncho-body light-grey">
          <i className="material-icons">lock</i>
          <span>100% SSL secure checkout</span>
        </div>
      </div>
    )
  }
}

export default AsideCardPayment;
