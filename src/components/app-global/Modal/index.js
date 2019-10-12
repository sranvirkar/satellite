import React, { Component } from "react";
import ReactDOM from "react-dom";

class Modal extends Component {
  componentDidMount() {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
  }
  componentWillUnmount() {
    document.body.style.overflow = "visible";
    document.body.style.position = "static";
  }

  render() {
    const {
      children,
      padding,
      exitUsingButton,
      exitUsingBackground,
      exitModalAction,
      isSmall
    } = this.props;

    return ReactDOM.createPortal(
      <div
        className={`global-Modal_wrapper`}
        onMouseUp={e => { if (exitUsingBackground) {exitModalAction(e); e.stopPropagation();}}}
        onTouchStart={e => { if (exitUsingBackground) {exitModalAction(e); e.stopPropagation();}}}
        >
        <div
          className={`global-Modal ${isSmall && 'small'}`}
          >
          {
            exitUsingButton !== "false" ? (
              <span
                className="exit-button"
                onMouseUp={e => exitModalAction(e)}
                onTouchStart={e => exitModalAction(e)}
                onTouchEnd={e => e.preventDefault()}>
                <img src={`${reactRoute}/resource/poncho/assets/img/close-icon.svg`}/>
              </span>
            ) : null
          }
          <div
            className={`global-Modal_children-wrapper ${isSmall && 'small'}`}
            onMouseUp={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}>
            { children }
          </div>

        </div>
      </div>, document.querySelector(".App"));
  }
}

export default Modal;
