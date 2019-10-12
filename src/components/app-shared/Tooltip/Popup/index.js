import React, { Component } from "react";
import ReactDOM from "react-dom";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollY: 0
    };

    this._unmountThisElement = this.unmountThisElement.bind(this);
    this._updateTooltipPosition = this.updateTooltipPosition.bind(this);
  }

  componentWillUnmount() {
    this.removeAllEventListeners();
  }

  componentDidMount() {
    this.addAllEventListeners();
    this._updateTooltipPosition();
  }

  updateTooltipPosition = (e) => {
    this.setState({scrollY: window.scrollY});
  }

  unmountThisElement = (e) => {
    const { unmountToggle } = this.props;

    if (
      e &&
      e.type === "resize") {
        unmountToggle();
        this.removeAllEventListeners();
        return;
    }

    if (
      e &&
      e.target &&
      //!e.target.classList.contains("shared-Tooltip-Popup") ||
      !e.target.closest('.shared-Tooltip-Popup') ||
      e.target &&
      e.target.classList.contains("exit-icon")) {
        e.stopPropagation();
        unmountToggle();
        this.removeAllEventListeners();
    }
  }

  addAllEventListeners() {
    document.addEventListener('click', this._unmountThisElement)
    document.addEventListener('mousedown', this._unmountThisElement)
    window.addEventListener('resize', this._unmountThisElement);
    window.addEventListener('orientationchange', this._unmountThisElement);
    window.addEventListener('scroll', this._updateTooltipPosition)
  }

  removeAllEventListeners() {
    document.removeEventListener('click', this._unmountThisElement);
    document.removeEventListener('mousedown', this._unmountThisElement);
    window.removeEventListener('resize', this._unmountThisElement);
    window.removeEventListener('orientationchange', this._unmountThisElement);
    window.removeEventListener('scroll', this._updateTooltipPosition);
  }

  render() {
    const {id, helpText, down, children, parent, shrink, width} = this.props;
    const { scrollY } = this.state;

    const tooltipBottom = scrollY + parent.getBoundingClientRect().top - 16;
    const maxOffsetLeft = 20;
    const elementWidth = width ? Number(width) : 280;
    const caretOffsetLeft = parent.getBoundingClientRect().left + (280 - elementWidth);
    const caretMiddle = caretOffsetLeft + (parent.offsetWidth / 2);

    const adjustedTooltipDistanceFromLeft = caretMiddle - 260 < maxOffsetLeft ? maxOffsetLeft : caretMiddle - 260;

    let style = {
      maxHeight: `${tooltipBottom - 20}px`,
      left: `${adjustedTooltipDistanceFromLeft}px`,
      width: `${elementWidth}px`
    }

    if (down) {
      style.top = `${tooltipBottom + 50}px`;
    } else {
      style.bottom = `calc(100% - ${tooltipBottom}px)`;
    }

    const caretStyle = {
      left: `${caretOffsetLeft - adjustedTooltipDistanceFromLeft - (280 - elementWidth) + (parent.offsetWidth / 2) - 8}px`
    }

    return ReactDOM.createPortal((
      <div
        id={id}
        className={`shared-Tooltip-Popup ${down ? "down" : ""}`}
        style={style}
        onClick={(e)=> e.stopPropagation()}
        onScroll={e => e.stopPropagation()}>
        <div className="popup-content-wrapper">
          {
            children ||
            typeof helpText == 'string' ?
            <p className={`poncho-caption`}>{helpText}</p> :
            helpText.map((helpTextObject, index) => <React.Fragment key={index}>
                {
                  helpTextObject.title &&
                  <p className={`poncho-body bold`}>
                    {helpTextObject.title}
                  </p>
                }
                {
                  helpTextObject.body &&
                  <p className={`poncho-body short`}>
                    {helpTextObject.body}
                  </p>
                }
              </React.Fragment>
            )
          }
        </div>

        <div className="shared-Tooltip-caret" style={caretStyle} />
        <i className="material-icons exit-icon">clear</i>
      </div>
    ), document.querySelector(".App"));
  }
}

export default Popup;
