import React, { Component } from "react";

class InputCheckbox extends Component {

  handleChange = (event) => {
    const { answer, handleChange, afterChange, updateAnswer } = this.props;
    if (handleChange) {
      // If handleChange prop is passed in, use that instead
      handleChange(event);
    } else {
      const value = event.target.value;
      const currentValue = answer.value;
      let newValue;
      if (event.target.checked && !currentValue.includes(value)) {
        newValue = [...currentValue, value];
      } else {
        newValue = [...currentValue];
        newValue.splice(newValue.indexOf(value), 1);
      }
      updateAnswer(newValue);
    }

    if (afterChange) afterChange(event);
  }

  filterOptions = () => {
    const { filterOptions, options } = this.props;
    return filterOptions ? filterOptions(options) : options;
  }

  render() {
    // Options should be an array of { label, value }
    const { answer, outerClassName, innerClassName, options, offsetIndex, repeatableIndex, noLabelElement } = this.props;
    const listClassName = ["shared-InputCheckbox", outerClassName].filter(className => className).join(' ');

    const optionElements = this.filterOptions(options).map((option, index) => {
      const checked = answer.value.includes(option.value);
      const optionClassName = [checked && "selected", innerClassName].filter(className => className).join(' ');
      const optionIndex = offsetIndex ? offsetIndex + index : index;
      // offsetIndex prop is used for InputCheckboxColumns - which uses InputCheckbox twice

      return (
        <li className={optionClassName} key={option.value}>
          <input
            id={repeatableIndex !== undefined ? `${answer.fieldName}-${optionIndex}-${repeatableIndex}` : `${answer.fieldName}-${optionIndex}`}
            type="checkbox"
            checked={checked}
            name={repeatableIndex !== undefined ? `${answer.fieldName}-${repeatableIndex}` : `${answer.fieldName}`}
            value={option.value}
            onChange={this.handleChange}
          />
          
          {/* noLabelElement used for InputDriverPolicyholders component -> see component for note on this prop */}
          {
            noLabelElement ?
            <React.Fragment>
              {React.cloneElement(this.props.children, { 
                label: option.label, 
                isSelected: checked, 
                answerGroupId: option.value, 
                repeatableIndex: index,
                labelHtmlFor: repeatableIndex !== undefined ? `${answer.fieldName}-${optionIndex}-${repeatableIndex}` : `${answer.fieldName}-${optionIndex}`
              })}
            </React.Fragment>
            :
            <label htmlFor={repeatableIndex !== undefined ? `${answer.fieldName}-${optionIndex}-${repeatableIndex}` : `${answer.fieldName}-${optionIndex}`}>
              {/* Expecting a single child element to be passed in which will be given the props 'label' and 'selected'
            'selected' is true/false and 'label' can be anything - string or object */}
              {React.cloneElement(this.props.children, { label: option.label, isSelected: checked, answerGroupId: option.value, repeatableIndex: index })}
            </label>
          }
          
        </li>
      );
    });

    return (
      <ul className={listClassName}>
        {optionElements}
      </ul>
    );
  }
}

export default InputCheckbox;
