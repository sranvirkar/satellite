import React, { Component } from "react";
import moment from 'moment';
import { userFormattedDate } from "helpers/fieldValidations";
import Calendar from "./Calendar";

class InputDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      freeEntryModeEnabled: false,
      isDisplayingCalendar: false,
      isFocused: false
    };
  }

  prettyOverlay = (date) => {
    const dateElements = date.match(/(\d{1,4})|(\/)/g);
    let datePlaceholders = [
      <span key="0" className="placeholder">DD</span>,
      <span key="1" className="placeholder slash">/</span>,
      <span key="2" className="placeholder">MM</span>,
      <span key="3" className="placeholder slash">/</span>,
      <span key="4" className="placeholder">YYYY</span>];

    for (var i = 0; dateElements && i < dateElements.length; i++) {
      let extraSpaceCharacters = [];
      const placeholderString = datePlaceholders[i].props.children.toString();

      if (i !== 1 && i !== 3 && dateElements[i].length < placeholderString.length) {
        for (let j = 0; j < placeholderString.length - dateElements[i].length; j++) {
          extraSpaceCharacters.push(<span key={j + 5} className="hidden">0</span>);
        }
      }

      datePlaceholders[i] = <span key={i} className={placeholderString == "/" ? "slash" : ""}>{dateElements[i]}{extraSpaceCharacters}</span>;
    }

    return <div className="pretty-overlay">{datePlaceholders}</div>;
  }

  handleChange = (event) => {
    const { answer, field } = this.props;
    const validPartialAnswerFormat = /^(0[1-9]|[12][0-9]|3[01]|$|0$|1$|2$|3$)(?:\/|$)(0[1-9]|1[012]|$|0$|1$)(?:\/|$)(\d{0,4}|$)$/g;

    let freeEntryModeLocal = this.state.freeEntryModeEnabled;
    if (answer.value.length > event.target.value.length) {
      freeEntryModeLocal = true;
    }

    let value = event.target.value;
    value = value.replace("-", "/");

    // allows users to type single digit days/months and have 1/1/2019 become 01/01/2019 easily
    if ((value.length === 2 || value.length === 5) && !freeEntryModeLocal && (value.slice(-1) === "/" || value.slice(-1) === "-")) { value = [value.slice(0, -2), "0", value.slice(-2)].join('');}
    // automatically adds /'s if you choose not to type them sequentially
    if ((value.length === 3 || value.length === 6) && !isNaN(value.slice(-1))) { value = [value.slice(0, -1), "/", value.slice(-1)].join('');}
     // check for too many /'s
    if (value.match(/(\/)/g) !== null && value.match(/(\/)/g).length > 2) { return; }
    // check for non numbers
    if (value.replace(/\//g, "").match(/\D/)) { return; }


    const isValidPartialAnswer = validPartialAnswerFormat.test(value);

    if (isValidPartialAnswer || freeEntryModeLocal) {
      const isValidCompleteAnswer = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/.test(value);
      if (isValidCompleteAnswer && moment(value, "DD/MM/YYYY").isValid()) {
        this.props.updateAnswer(moment(value, "DD/MM/YYYY").format("YYYY-MM-DD"));
      } else {
        this.props.updateAnswer(value);
      }

      this.setState({freeEntryModeEnabled: !isValidPartialAnswer});
      this.setState({isDisplayingCalendar: isValidPartialAnswer});

      if (value.length >= 10) {
        this.setState({isDisplayingCalendar: false});
      }
    }
  }

  handleBlur = (event) => {
    const to = event.relatedTarget && event.relatedTarget.closest(".shared-InputDate");

    this.props.manuallyClearErrors();
    if (!to) {
      this.props.onBlurValidation(event.target.value);
      this.setState({isDisplayingCalendar: false});
      this.setState({isFocused: false});
    }
  }

  handleFocus = (e) => {
    const { field, answer, manuallyClearErrors } = this.props;
    const { freeEntryModeEnabled, isDisplayingCalendar, isFocused } = this.state;
    const isValidCompleteAnswer = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/.test(userFormattedDate(answer.value));

    //EXTRA EXTRA SPECIAL CASE where you actually pick a year in the calendar and expect the calendar to disappear (lol)
    if (isFocused && isDisplayingCalendar && isValidCompleteAnswer) {
      this.setState({isDisplayingCalendar: false});
    }

    //special case for when you have a validCompleteAnswer and you don't want to show the calendar
    //as the user is tabbing backwards/forwards through the form
    // if (!isDisplayingCalendar && !isFocused && isValidCompleteAnswer) {
    //   this.setState({isFocused: true});
    //   return;
    // }

    this.setState({isDisplayingCalendar: !isDisplayingCalendar});
    this.setState({isFocused: true});
    if (e) { e.stopPropagation();}
    manuallyClearErrors();
  }

  render() {
    const { field, answer, repeatableIndex, updateAnswer } = this.props;
    const { freeEntryModeEnabled, isDisplayingCalendar, isFocused } = this.state;
    const validPartialAnswerFormat = /^(0[1-9]|[12][0-9]|3[01]|$|0$|1$|2$|3$)(?:\/|$)(0[1-9]|1[012]|$|0$|1$)(?:\/|$)(\d{0,4}|$)$/g;
    const isValidPartialAnswer = validPartialAnswerFormat.test(userFormattedDate(answer.value));
    const isValidCompleteAnswer = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/.test(userFormattedDate(answer.value));
    const id = repeatableIndex !== undefined ? `${field.name}-${repeatableIndex}` : field.name;

    return (
      <div
        className={`shared-InputDate ${(isDisplayingCalendar || !answer.validationErrors && !isValidCompleteAnswer && isFocused) && !answer.disabled ? "bring-to-front" : ""}`}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}>

        <i
          className="material-icons manual-calendar-toggle"
          tabIndex="-1"
          onTouchStart={e => {
            e.stopPropagation();
            e.preventDefault();
            if (isFocused) {
              this.handleFocus(e);
            } else {
              document.getElementById(id).focus();
            }
          }}
          onTouchEnd={e => e.preventDefault()}
          onMouseUp={e => {
            e.stopPropagation();
            e.preventDefault();
            if (isFocused) {
              this.handleFocus(e);
            } else {
              document.getElementById(id).focus();
            }
          }}
          onFocus={e => { e.stopPropagation(); e.preventDefault();}}>calendar_today</i>

        <input
          id={id}
          className={`${isDisplayingCalendar ? "calendar-active " : ""}${answer.validationErrors && answer.validationErrors.length > 0 ? "error " : ""}${answer.value ? "answer " : ""}`}
          type="string"
          autoComplete="off"
          placeholder={"DD/MM/YYYY" && field.placeholder}
          value={userFormattedDate(answer.value)}
          onChange={this.handleChange}
          {...answer.disabled ? { disabled: true } : undefined }/>

        { isDisplayingCalendar && <Calendar field={field} answer={answer} updateAnswer={updateAnswer} handleFocus={this.handleFocus}/> }

        { /*!answer.validationErrors && !isValidCompleteAnswer && isValidPartialAnswer ? this.prettyOverlay(userFormattedDate(answer.value)) : null */}
      </div>
    );
  }
}

export default InputDate;
