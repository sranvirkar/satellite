import React, { Component } from "react";

class InputDropdown extends Component { 
  constructor(props) {
    super(props);

    this.state = {
      displayMenu: false,
      displayCard: false
    };
  }

  toggleMenu = (event) => {
    this.setState({
      displayMenu: !this.state.displayMenu
    })
  }

  renderDropdownCard = (event) => {
    this.setState({
      displayCard: true
    })
    const { updateAnswer, policyField, upsertAnswerForFieldName } = this.props;
    const value = event.target.value;
    updateAnswer(value);
    upsertAnswerForFieldName("Policy_Id", undefined, { value: value });
}


  filterOptions = () => {
    const { filterOptions, options } = this.props;
    return filterOptions ? filterOptions(options) : options;
  }
  
  render() {
    // Options should be an array of { label, value }
    const { answer, outerClassName, innerClassName, options, repeatableIndex } = this.props;
    const listClassName = ["shared-InputRadio", outerClassName].filter(className => className).join(' ');

    const optionElements = this.filterOptions(options).map((option, index) => {
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
            onClick={this.renderDropdownCard}
          /> 
          
          {/* Expecting a single child element to be passed in which will be given the props 'label' and 'selected'
            'selected' is true/false and 'label' can be anything - string or object */}
                
          <label onFocus={this.renderDropdownCard} htmlFor={repeatableIndex !== undefined ? `${answer.fieldName}-${index}-${repeatableIndex}` : `${answer.fieldName}-${index}`}>
            <div className="dropdownContent">
              {React.cloneElement(this.props.children, { label: option.label, selected: checked, startDate: option.startDate, title: option.title })}
            </div>
          </label>
        </li>
      );
    });

    return (
      <div className="dropdownWrapper">
      {
        !this.state.displayCard ? 
       (
        <button className="dropdownButton" onClick={this.toggleMenu}>Select a Policy</button>
       ) :
       null
          
        }
        
        {
          this.state.displayMenu ?
          (
            <ul className={listClassName}>
              {optionElements}
            </ul>
          ) : null
        }
      </div>
    );
  }
}

export default InputDropdown;