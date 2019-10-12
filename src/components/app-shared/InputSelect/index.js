import React, { Component } from "react";

class InputSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      searchString: '',
      maxHeightOverride: undefined
    };
    this._handleBlur = this.handleBlur.bind(this);
    this._debouncedStringReset = this.debounce(() => this.setState({searchString: ''}), 400);
  }

  componentWillUnmount() {
    this.removeFocus();
    this.setState({searchString: ''});
  }

  debounce = (func, wait, immediate) => {
  	var timeout;
  	return function() {
  		var context = this,
  			args = arguments;
  		var later = function() {
  			timeout = null;
  			if ( !immediate ) {
  				func.apply(context, args);
  			}
  		};
  		var callNow = immediate && !timeout;
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait || 200);
  		if ( callNow ) {
  			func.apply(context, args);
  		}
  	};
  }

  addFocus = () => {
    this.setState({isFocused: true});
    document.addEventListener('focus', this._handleBlur);
    document.addEventListener('click', this._handleBlur);
    document.addEventListener('touchstart', this._handleBlur);
  }

  removeFocus = () => {
    this.setState({isFocused: false});
    document.removeEventListener('focus', this._handleBlur);
    document.removeEventListener('click', this._handleBlur);
    document.removeEventListener('touchstart', this._handleBlur);
  }

  handleBlur = (e) => {
    const { field } = this.props;

    if (
      e &&
      e.target &&
      e.target.closest(`.shared-InputSelect.${field.name}`)) {
      return;
    }

    this.removeFocus();
    this.setState({searchString: ''});
  }

  handleKeyPressOption = (event) => {
    const { field, repeatableIndex, updateAnswer } = this.props;

    if (event.key == "Enter") {
      const inputId = repeatableIndex !== undefined ? `${field.name}-default-${repeatableIndex}` : `${field.name}-default`;

      if (event.currentTarget !== document.getElementById(inputId)) {
        updateAnswer(event.currentTarget.value);
      }

      if (event.currentTarget === document.getElementById(inputId) && !this.state.isFocused) {
        this.addFocus();
        return;
      }
      this.removeFocus();
      this.setState({searchString: ''});

      document.getElementById(inputId).focus();
    }

    if (/\w{1}$/.test(event.key) && event.key !== "Enter") {
      const newSearchTerm = `${this.state.searchString}${event.key}`;

      const filteredIndex = field.options.findIndex(option => {
        // let value = typeof option == 'object' ? option.value : option;
        let value = typeof option == 'object' ? option.label : option;

        return RegExp(`^${newSearchTerm.toLowerCase()}`).test(value.toLowerCase());
      });
      const optionInputId = repeatableIndex !== undefined ? `${field.name}-${filteredIndex}-${repeatableIndex}` : `${field.name}-${filteredIndex}`;

      if (document.getElementById(optionInputId)) {
        document.getElementById(optionInputId).focus();
      }

      this.setState({searchString: newSearchTerm});
      this._debouncedStringReset();
    }
  }

  handleClickOption = (event, value) => {
    this.props.updateAnswer(value || event.currentTarget.innerText);
    this.removeFocus();
    this.setState({searchString: ''});
  }

  handleChange = (event) => {
    const { field, updateAnswer } = this.props;
    updateAnswer(event.target.value);
  }

  handleFocus = (event) => {
    const { isFocused } = this.state;
    const { field } = this.props;
    event.stopPropagation();

    if (!isFocused) {
      this.setHeightOverride();
      this.addFocus();
    } else {
      this.removeFocus();
    }
  }

  onBlurAway = (event) => {
    const { field, answer, updateAnswer } = this.props;

    if (
      event.target &&
      event.target.closest(`.shared-InputSelect.${field.name}`) &&
      event.relatedTarget &&
      event.relatedTarget.closest(`.shared-InputSelect.${field.name}`) === null
      ){
        this.props.onBlurValidation(answer.value, false);

        this.removeFocus();
        this.setState({searchString: ''});
        if (event.target.value) {
          updateAnswer(event.target.value);
        }
    }
  }

  setHeightOverride = (e) => {
    var elem = event.target;
    var distance = 0;
    do {
        distance += elem.offsetTop;
        elem = elem.offsetParent;
    } while (elem);
    distance = distance < 0 ? 0 : distance;
    const documentHeight = document.querySelector(".App").getBoundingClientRect().height;

    if (distance + 340 > documentHeight) {
      this.setState({maxHeightOverride: documentHeight - distance - 40});
    }
  }

  handleInitialFocus = (event) => {
    const { isFocused } = this.state;
    const { field, repeatableIndex } = this.props;
    const inputId = repeatableIndex !== undefined ? `${field.name}-default-${repeatableIndex}` : `${field.name}-default`;
    document.getElementById(inputId).focus();

    if (event && event.target && event.target.tagName === "INPUT") {
      return;
    }

    if (!isFocused) {
      this.setHeightOverride();
      this.addFocus();
    }
  }

  render() {
    const { field, answer, repeatableIndex } = this.props;
    const { isFocused, maxHeightOverride } = this.state;

    if (window.innerWidth < 500) {
      return (
        <div className={`${answer.value ? "" : "placeholder"} ${field.name} shared-InputSelect ${answer.value ? "answer " : ""}${answer.validationErrors && answer.validationErrors.length > 0 ? "error " : ""} ${isFocused ? "active" : ""} ${answer.disabled ? "disabled" : ""}`}>
          <select
            id={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name}
            type="select"
            className="mobile-select"
            value={answer ? answer.value : undefined}
            onChange={this.handleChange}>
            {[
              ...field.options.map(option => {
                let value = typeof option == 'object' ? option.value : option;
                let label = typeof option == 'object' ? option.label : option;

                return (
                  <option key={`${field.name}-${value}`} name={value} value={value}>
                    {label}
                  </option>
                )
              })
            ]}
          </select>

          <div className={`${answer.value ? "" : "placeholder"} mobile-pretty`}>
            {answer.value ? (

              typeof field.options[0] == 'object' ?
              field.options.find(v => v.value == answer.value).label :
              answer.value

            ) : field.placeholder}
          </div>

          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 17.964a.961.961 0 0 1-.681-.283L1 7.363 2.363 6 12 15.637 21.637 6 23 7.363 12.681 17.68a.961.961 0 0 1-.681.283z"/>
            <use fill="#9d9fa5"/>
          </svg>
        </div>
      );
    } else {
      return (
        <div
          {...answer.disabled ? { disabled: true } : undefined }
          onBlur={this.onBlurAway}
          className={`${answer.value ? "" : "placeholder"} ${field.name} shared-InputSelect ${answer.value ? "answer " : ""}${answer.validationErrors && answer.validationErrors.length > 0 ? "error " : ""} ${isFocused ? "active" : ""} ${answer.disabled ? "disabled" : ""}`} >

          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 17.964a.961.961 0 0 1-.681-.283L1 7.363 2.363 6 12 15.637 21.637 6 23 7.363 12.681 17.68a.961.961 0 0 1-.681.283z"/>
            <use fill="#9d9fa5"/>
          </svg>

          <li
            key="default"
            className="pretty"
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); return this.handleInitialFocus();}}
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); return this.handleInitialFocus();}}
            onFocus={this.handleFocus}>
            <input
              id={repeatableIndex !== undefined ? `${field.name}-default-${repeatableIndex}` : `${field.name}-default`}
              tabIndex={answer.value == true && isFocused ? "-1" : "0"}
              type="radio"
              value={answer.value ? answer.value : undefined}
              onKeyPress={this.handleKeyPressOption}
              name={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : `${field.name}`}
              {...answer.disabled ? { disabled: true } : undefined }/>

            <label
              htmlFor={repeatableIndex !== undefined ? `${field.name}-default-${repeatableIndex}` : `${field.name}-default`}
              className={`${answer.value ? '' : "placeholder"}`}>
              {answer.value ? (

                typeof field.options[0] == 'object' ?
                field.options.find(v => v.value == answer.value).label :
                answer.value

              ) : field.placeholder}
            </label>
          </li>

          {
            isFocused && (
              <ul className={`shared-InputSelect_dropdown-${field.name}`} style={maxHeightOverride && {maxHeight: `${maxHeightOverride}px`}}>
                {field.options.map((option, index) => {
                  let value = typeof option == 'object' ? option.value : option;
                  let label = typeof option == 'object' ? option.label : option;

                  return <li key={value}>
                    <input id={repeatableIndex !== undefined ? `${field.name}-${index}-${repeatableIndex}` : `${field.name}-${index}`}
                      type="radio"
                      checked={answer.value === value}
                      name={repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : `${field.name}`}
                      value={value}
                      onChange={this.handleChange}
                      onKeyPress={this.handleKeyPressOption} />

                      <label
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          this.handleClickOption(e, value);
                        }}
                        className={value == answer.value ? "checked" : ""}
                        htmlFor={repeatableIndex !== undefined ? `${field.name}-${index}-${repeatableIndex}` : `${field.name}-${index}`}>
                        {label}
                      </label>
                  </li>;
                })}
              </ul>
            )
          }

        </div>
      );
    }
  }
}

export default InputSelect;
