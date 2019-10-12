import React, { Component } from "react";
import InputCheckbox from "../InputCheckbox";

class InputToggle extends Component {
  render() {
    const Option = (props) => (
      <React.Fragment>
        <span>{props.label}</span>
        <div className={props.isSelected ? "toggle-container on" : "toggle-container off"}>
          <div className="toggle" />
        </div>
      </React.Fragment>
    )

    const outerClassName = "InputToggle";
    const innerClassName = "Option";

    return (
      <InputCheckbox
        outerClassName={outerClassName}
        innerClassName={innerClassName}
        {...this.props}>
        <Option />
      </InputCheckbox>
    );
  }
}

export default InputToggle;
