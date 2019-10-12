import React, { Component } from "react";
import InputCheckbox from "../InputCheckbox";

class InputCheckboxColumns extends Component {
  render() {
    const Option = (props) => (
      <React.Fragment>
        <div className="checkbox">
          <div className="checkmark" />
        </div>
        <span>{props.label}</span>
      </React.Fragment>
    )

    const outerClassName = "InputCheckboxColumn";
    const innerClassName = "Option";
    const { options, ...otherProps } = this.props;

    // If there are more than ten options AND is desktop view, split the options into two lists/columns. Otherwise, display them all in one column.
    // TODO: Might want to use something like https://github.com/ReactTraining/react-media because resizing window will NOT cause a re-render right now
    if (window.matchMedia('(max-width: 768px)').matches || options.length < 10) {
      // One column
      return (
        <div className="InputCheckboxColumns">
          <InputCheckbox outerClassName={outerClassName} innerClassName={innerClassName} {...this.props}>
            <Option />
          </InputCheckbox>
        </div>
      );
    } else {
      // Split options into two lists
      const mid = Math.ceil(options.length / 2);
      const firstColumnOptions = options.slice(0, mid);
      const secondColumnOptions = options.slice(mid);

      // Two columns
      return (
        <div className="InputCheckboxColumns">
          <InputCheckbox outerClassName={outerClassName} innerClassName={innerClassName} options={firstColumnOptions} {...otherProps}>
            <Option />
          </InputCheckbox>
          <InputCheckbox offsetIndex={mid} outerClassName={outerClassName} innerClassName={innerClassName} options={secondColumnOptions} {...otherProps}>
            <Option />
          </InputCheckbox>
        </div>
      );
    }
  }
}

export default InputCheckboxColumns;
