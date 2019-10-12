import React, { Component } from "react";

class InputRange extends Component {

  handleChange = (event) => {
    this.props.updateAnswer(event.target.value.toString());
  }

  render() {
    const { field, repeatableIndex } = this.props;

    return (
      <input
        id={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name}
        className="shared-InputRange"
        type="range"
        min="100"
        max="1000"
        default="400"
        value={parseInt(this.props.answer.value)}
        onChange={this.handleChange} />
    );
  }
}

export default InputRange;
