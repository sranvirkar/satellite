import React, { Component } from "react";
import ReactDOM from "react-dom";
import moment from 'moment';

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: undefined,
      activeMonthIndex: moment().month(),
      activeMonthDays: moment().month(moment().month()).daysInMonth()
    };
    this.handleClick = this.handleClick.bind(this);
  }

  nextMonth = (keypressEnter) => {
    const { activeMonthIndex } = this.state;
    this.setState({activeMonthIndex: activeMonthIndex + 1});
  }

  prevMonth = (keypressEnter) => {
    const { activeMonthIndex } = this.state;
    this.setState({activeMonthIndex: activeMonthIndex - 1});
  }

  days = (monthIndex) => {
    const { field, answer } = this.props;
    const { selectedDay, activeMonthIndex, activeMonthDays } = this.state;

    const maxValidationRule = field.validations.filter(v => v.type == "dateMax");
    const minValidationRule = field.validations.filter(v => v.type == "dateMin");

    const maxDay = moment().add(maxValidationRule[0].number, maxValidationRule[0].unit).startOf('day');
    const minDay = moment().add(minValidationRule[0].number, minValidationRule[0].unit).startOf('day');

    const daysToDisplay = [];
    const daysToAdd = moment().month(monthIndex).daysInMonth();
    for (var i = 0; i < daysToAdd; i++) {
      let day = moment().month(monthIndex).startOf('month').add(i, "days");
      daysToDisplay.push({
        day: day,
        isDisabled: day.isBefore(minDay) || day.isAfter(maxDay)
      });
    }
    return daysToDisplay;
  }

  handleClick = (event, moment) => {
    const { updateAnswer } = this.props;
    const inputElement = event.target.closest(".shared-InputDateSingleDay").querySelector('input');

    updateAnswer(
      moment.format("YYYY-MM-DD"),
      window.requestAnimationFrame(() => inputElement.focus())
    );
  }

  render() {
    const { field, answer, inputElementBoundingClientRect } = this.props;
    const { activeMonthIndex, activeMonthDays } = this.state;

    const parentRect = inputElementBoundingClientRect;

    const maxValidationRule = field.validations.filter(v => v.type == "dateMax");
    const minValidationRule = field.validations.filter(v => v.type == "dateMin");

    const maxDay = moment().add(maxValidationRule[0].number, maxValidationRule[0].unit);
    const minDay = moment().add(minValidationRule[0].number, minValidationRule[0].unit);

    const range = (start, end, step = 1) => {
      const length = Math.floor(Math.abs((end - start) / step)) + 1;
      return Array.from(Array(length), (x, index) => start + index * step);
    }

    const validMonths = range(minDay.month(), maxDay.month());

    // this makes the assumption that the calendar is for EITHER FUTURE ONLY OR PAST ONLY
    // the calendar will show the wrong month and behave badly if both future and past are selectable
    const isFutureMonths = moment().month() === minDay.month();

    return (
      <div
        tabIndex="0"
        className={`shared-InputDateSingleDay-Calendar ${parentRect.left + 300 < window.innerWidth  ? "left-align" : "right-align"}`}
        onFocus={e => {e.stopPropagation(); e.preventDefault();}}
        onTouchStart={e => {e.stopPropagation(); e.preventDefault();}}
        onTouchEnd={e => e.preventDefault()}
        onMouseUp={e => {e.stopPropagation(); e.preventDefault();}}
        >
        <div
          className="month-panels"
          style={{justifyContent: isFutureMonths ? "flex-start" : "flex-end"}}>
          {
            validMonths.map(index => {

              let empties = new Array(Number(this.days(index)[0].day.subtract(1, 'days').format('e'))).fill(" ").map((unit, key) => (
                <li className="blank" key={key} />
              ));

              let numbers = this.days(index).map(day =>
                <li
                  key={day.day.date() + 'day'}
                  className={day.isDisabled ? "disabled" : "enabled"}
                  tabIndex="-1"
                  onMouseUp={e => {
                    e.stopPropagation();
                    if (!day.isDisabled) this.handleClick(e, day.day);
                  }}
                  onTouchEnd={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!day.isDisabled) this.handleClick(e, day.day);
                  }}
                  onFocus={e => e.stopPropagation()}>
                  {day.day.date()}
                </li>
              )

              // const totalUnits = empties.length + numbers.length;
              // const unitsOverflowCount = totalUnits - 35 >= 0 ? (totalUnits - 35) * -1 : true;
              // const unitsOverflow = unitsOverflowCount >= 0 ? [] : numbers.slice(unitsOverflowCount);
              // const blankspaces = unitsOverflow.length ? empties.slice(unitsOverflow.length) : empties;
              // const numbersMinusOverflow = unitsOverflowCount >= 0 ? numbers : numbers.slice(0, unitsOverflowCount);
              // this this makes the last days of the month wrap back around to the top of the calendar
              // const units = [
              //   ...unitsOverflow,
              //   ...blankspaces,
              //   ...numbersMinusOverflow
              // ]

              const units = [
                ...empties,
                ...numbers
              ]


              return <div
                key={index}
                className={`pane ${activeMonthIndex - moment().month()}`}
                style={{transform: `translateX(${100 * (moment().month() - activeMonthIndex)}%)`}}>
                <p>{moment().month(index).format('MMM')}</p>
                <ul>
                  <li className="title">Mon</li>
                  <li className="title">Tue</li>
                  <li className="title">Wed</li>
                  <li className="title">Thu</li>
                  <li className="title">Fri</li>
                  <li className="title">Sat</li>
                  <li className="title">Sun</li>

                  { units }

                </ul>

                {
                  minDay.month() < activeMonthIndex &&
                  <i
                    tabIndex="-1"
                    onTouchEnd={e => {e.stopPropagation(); e.preventDefault(); return this.prevMonth();}}
                    onMouseUp={e => {e.stopPropagation(); e.preventDefault(); return this.prevMonth()}}
                    onFocus={e => e.stopPropagation()}
                    className="material-icons prev">
                    keyboard_arrow_left
                  </i>
                }
                {
                  maxDay.month() > activeMonthIndex &&
                  <i
                    tabIndex="-1"
                    onTouchEnd={e => {e.stopPropagation(); e.preventDefault(); return this.nextMonth();}}
                    onMouseUp={e => {e.stopPropagation(); e.preventDefault(); return this.nextMonth()}}
                    onFocus={e => e.stopPropagation()}
                    className="material-icons next">
                    keyboard_arrow_right
                  </i>
                }
              </div>
            }
          )
          }
        </div>
      </div>
    );
  }
}

export default Calendar;
