import React, { Component } from "react";

class InputString extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleChange = (event) => {
    const { field } = this.props;
    const value = event.target.value;

    if (value.match(/[<>]/)) { return; } // check for *some* bad characters
    if (value.match(/  /)) { return; } // check for *some* bad characters

    if (field.whitelistExpression ? RegExp(field.whitelistExpression).test(value) : true) {
      this.props.updateAnswer(value);
    }
  }

  handleBlur = (event) => {
    this.props.onBlurValidation(event.target.value);
  }

  render() {
    const { field, answer, repeatableIndex } = this.props;

    return (
      <input
        id={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name}
        className={`${answer.validationErrors && answer.validationErrors.length > 0 ? "error " : ""}${answer.value ? "answer " : ""}shared-InputString`}
        type="string"
        placeholder={field.placeholder ? field.placeholder : ""}
        value={answer.value}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        {...answer.disabled ? { disabled: true } : undefined }/>
    );
  }
}

export default InputString;
