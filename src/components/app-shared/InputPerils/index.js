import React, { Component } from "react";
import { connect } from "react-redux";
import { addPeril, removePeril } from "redux/actions/orm/Peril";
import { perilsByAnswerGroupSelector, optionalPerilsSelector } from "redux/selectors.js";
import { updateAndGetPrice } from "redux/actions";
import InputToggle from "components/app-shared/InputToggle";
import { CircleTick } from "helpers/svgIcons";

class InputPerils extends Component {

  handleChange = (event) => {
    const { addPeril, removePeril, updateAndGetPrice, answerGroupId, selectedPerils } = this.props;

    const selectedPerilNames = selectedPerils.map(peril => peril.name);
    const toggledPeril = event.target.value;
    if (event.target.checked && !selectedPerilNames.includes(toggledPeril)) {
      addPeril(answerGroupId, toggledPeril);
    } else {
      removePeril(answerGroupId, toggledPeril);
    }
    updateAndGetPrice();
  }

  render() {
    const { optionalPerils } = this.props;
    return(
      <div>
        {optionalPerils.map((peril, index) => (
          <p
            key={index}
            className="poncho-body light-grey short">
            <CircleTick className="green-circle-tick" color="#00B3A5" size="20" />
            {peril.title}
          </p>
        ))}
      </div>
    )
 {/* //return {<InputToggle options={options} afterChange={this.handleChange} {...this.props} />;} */}
  }
}

function stateToProps(state, props) {
  return {
    selectedPerils: perilsByAnswerGroupSelector(state, props.answerGroupId),
    optionalPerils: optionalPerilsSelector(state)
  };
}

const dispatchToProps = {
  addPeril,
  removePeril,
  updateAndGetPrice
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputPerils);
