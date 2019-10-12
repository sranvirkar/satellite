import React, { Component } from "react";
import moment from 'moment';

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: undefined,
      selectedMonth: undefined,
      selectedYear: undefined
    };
    this.selectDay = this.selectDay.bind(this);
  }

  selectDay = (e, day) => {
    const { selectedDay } = this.state;
    const { updateAnswer } = this.props;
    const twoDigitAnswer = String(day).length == 1 ? `0${day}` : day;
    this.setState({selectedDay: twoDigitAnswer});
    updateAnswer(`${twoDigitAnswer}/`);
  }

  selectMonth = (e, month) => {
    const { selectedDay, selectedMonth } = this.state;
    const { updateAnswer } = this.props;
    this.setState({selectedMonth: month});
    updateAnswer(`${selectedDay}/${String(month).length == 1 ? `0${month + 1}` : month + 1}/`);
  }

  selectYear = (e, yearMoment) => {
    const { updateAnswer, handleFocus } = this.props;

    updateAnswer(
      yearMoment.format("YYYY-MM-DD"),
      window.requestAnimationFrame(() => handleFocus())
    );
  }

  render() {
    const { field, answer } = this.props;
    const { selectedDay, selectedMonth } = this.state;
    const maxValidationRule = field.validations.filter(v => v.type == "dateMax");
    const minValidationRule = field.validations.filter(v => v.type == "dateMin");
    const maxDay = moment().add(maxValidationRule[0].number, maxValidationRule[0].unit);
    const minDay = moment().add(minValidationRule[0].number, minValidationRule[0].unit);
    const maxDayYear = moment().add(maxValidationRule[0].number, maxValidationRule[0].unit).startOf('year').year();
    const minDayYear = moment().add(minValidationRule[0].number, minValidationRule[0].unit).startOf('year').year();

    const range = (start, end, step = 1) => {
      const length = Math.floor(Math.abs((end - start) / step)) + 1;
      return Array.from(Array(length), (x, index) => start + index * step);
    }

    const days = range(1, 31);
    const months = range(0, 11);
    const years = range(maxDayYear, minDayYear, -1);

    return (
      <div tabIndex="100" className="shared-InputDate-Calendar">
        <ul
          className="days"
          style={{transform: `translateX(${-100 * ((selectedDay ? 1 : 0) + (typeof selectedMonth == 'number' ? 1 : 0))}%)`}}>
          <p>Select a day</p>
          {days.map((day, i) => (
            <li
              key={i}
              tabIndex="-1"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return this.selectDay(e, day);
              }}
              onTouchEnd={e => e.preventDefault()}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return this.selectDay(e, day);
              }}
              onFocus={e => {e.preventDefault(); e.stopPropagation();}}
              >
              {String(day).length == 1 ? `0${day}` : day}
            </li>)
          )}
        </ul>

        <ul
          className="months"
          style={{transform: `translateX(${-100 * ((selectedDay ? 1 : 0) + (typeof selectedMonth == 'number' ? 1 : 0))}%)`}}>
          <p>Select a month</p>
          {months.map((month, i) => {
            const isDisabled = Number(selectedDay) > moment().month(month).year("2000").daysInMonth();
            return (
              <li
                key={i}
                tabIndex="-1"
                className={isDisabled ? "disabled" : ""}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDisabled) {
                    return this.selectMonth(e, month);
                  }
                }}
                onTouchEnd={e => e.preventDefault()}
                onMouseUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDisabled) {
                    return this.selectMonth(e, month);
                  }
                }}
                onFocus={e => {e.preventDefault(); e.stopPropagation();}}
                >
                {moment().month(month).format('MMMM')}
              </li>
            );
          })}
        </ul>

        <ul
          className="years"
          style={{transform: `translateX(${-100 * ((selectedDay ? 1 : 0) + (typeof selectedMonth == 'number' ? 1 : 0))}%)`}}>
          <p>Select a year</p>
          {years.map((year, i) => {
            const relevantDate = moment(`${selectedDay}/${selectedMonth + 1}/${year}`, "DD/MM/YYYY");
            const isOutsideBounds = relevantDate.isAfter(maxDay) || relevantDate.isBefore(minDay);
            const isValid = relevantDate.isValid() && !isOutsideBounds;
            return (
              <li
                key={i}
                tabIndex="-1"
                className={isValid ? "" : "disabled"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isValid) {
                    return this.selectYear(e, relevantDate);
                  }
                }}
                onFocus={e => {e.preventDefault(); e.stopPropagation();}}
                >
                {year}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default Calendar;
