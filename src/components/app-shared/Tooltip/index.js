import React, { Component } from "react";
import Popup from "./Popup";
import { Info } from "helpers/svgIcons";
import ReactDOM from "react-dom";

class Tooltip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showingPopup: false
    }
  }

  componentDidMount() {
    this.setState({parent: ReactDOM.findDOMNode(this)});
  }

  render() {
    const { uniqueId, helpText, size, color, children, isHorizontal, down, width } = this.props;
    const { showingPopup, parent } = this.state;

    if (!helpText && !children) { return null; }

    return (
      <span
        className="shared-Tooltip"
        onClick={(e) => {
          this.setState({showingPopup: !showingPopup})
          e.preventDefault();
          e.stopPropagation();
        }}>

        <Info />

        {
          showingPopup && parent ? (
            <Popup
              id={`helptext-tooltip-${uniqueId}`}
              helpText={helpText}
              down={down}
              parent={parent}
              width={width}
              unmountToggle={(e) => {
                if (e && e.type === "click") {
                  e.stopPropagation();
                }
                this.setState({showingPopup: false})}}>
              {children}
            </Popup>) : null
        }
      </span>
    );
  }
}

export default Tooltip;
