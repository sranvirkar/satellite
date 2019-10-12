import React, { Component } from "react";

class InputTextarea extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleChange = (event) => {
    if (event.target.value.match(/[<>]/)) { return; } // check for *some* bad characters
    this.props.updateAnswer(event.target.value);
  }

  handleBlur = (event) => {
    this.props.onBlurValidation(event.target.value);
  }

  render() {
    const { field, answer, repeatableIndex, isTextarea } = this.props;

    return (
      <textarea
        id={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name}
        className={`${answer.validationErrors && answer.validationErrors.length > 0 ? "error " : ""}${answer.value ? "answer " : ""}${isTextarea ? "textarea " : ""}shared-InputTextarea`}
        type="string"
        placeholder={field.placeholder ? field.placeholder : ""}
        value={answer.value}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        {...answer.disabled ? { disabled: true } : undefined }/>

    );
  }
}

export default InputTextarea;
