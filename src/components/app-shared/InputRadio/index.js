import React, { Component } from "react";

class InputRadio extends Component {

  handleChange = (event) => {
    const { handleChange, afterChange, updateAnswer } = this.props;
    if (handleChange) {
      // If handleChange prop is passed in, use that instead
      handleChange(event);
    } else {
      const value = event.target.value;
      updateAnswer(value);
    }

    if (afterChange) afterChange(event);
  }

  filterOptions = () => {
    const { filterOptions, options } = this.props;
    return filterOptions ? filterOptions(options) : options;
  }

  render() {
    // Options should be an array of { label, value }
    const { answer, outerClassName, innerClassName, options, repeatableIndex } = this.props;
    const listClassName = ["shared-InputRadio", outerClassName].filter(className => className).join(' ');

    return (
      <ul className={listClassName}>
        {
          this.filterOptions(options).map((option, index) => {
            const checked = answer.value === option.value;
            const optionClassName = [checked && "selected", innerClassName].filter(className => className).join(' ');

            return (
              <li className={optionClassName} key={option.value}>
                <input
                  id={repeatableIndex !== undefined ? `${answer.fieldName}-${index}-${repeatableIndex}` : `${answer.fieldName}-${index}`}
                  type="radio"
                  checked={checked}
                  name={repeatableIndex !== undefined ? `${answer.fieldName}-${repeatableIndex}` : `${answer.fieldName}`}
                  value={option.value}
                  onChange={this.handleChange}
                  onFocus={this.handleChange}
                />
                <label htmlFor={repeatableIndex !== undefined ? `${answer.fieldName}-${index}-${repeatableIndex}` : `${answer.fieldName}-${index}`}>
                  {/* Expecting a single child element to be passed in which will be given the props 'label' and 'selected'
                    'selected' is true/false and 'label' can be anything - string or object */}
                  {
                    React.cloneElement(this.props.children, {
                      id: repeatableIndex !== undefined ? `${answer.fieldName}-${repeatableIndex}` : `${answer.fieldName}`,
                      label: option.label,
                      isSelected: checked,
                      helpText: option.helpText
                    })
                  }
                </label>
              </li>
            );
          })
        }
      </ul>
    );
  }
}

export default InputRadio;
