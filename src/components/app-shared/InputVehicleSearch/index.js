import React, { Component } from "react";
import { connect } from "react-redux";
import { getVehicleDetails } from "redux/actions/vehicle";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import LoadingSpinner from "components/app-global/LoadingSpinner";

class InputVehicleSearch extends Component {

  constructor(props) {
    super(props);

    this.state = {
      text: 'Search'
    }
  }

  sendAction() {
    const { answerGroupId, getVehicleDetails, updateAnswer, upsertAnswerForFieldName } = this.props;

    if (this.state.text === 'Search') {
      upsertAnswerForFieldName("vehicleCantFind", answerGroupId, { value: false })
      this.setState({ text: "loading" });

      getVehicleDetails(answerGroupId).then(() => {
        updateAnswer('true');
      }).catch(error => {
        this.setState({ text: "Search" });
        if (error) {
          upsertAnswerForFieldName("vehicleCantFind", answerGroupId, { value: true })
          upsertAnswerForFieldName("vehicleLicensePlate", answerGroupId, { validationErrors: [ error ] })
        }
      });
    }
  }

  render() {
    const { field, answer } = this.props;
    const { text } = this.state;

    return (
      <button
        className={`shared-InputVehicleSearch poncho-btn-primary-reg ${text === 'loading' ? 'disabled' : ''}`}
        type="button"
        tabIndex="0"
        onMouseUp={e => this.sendAction()}
        onTouchStart={e => this.sendAction()}
        onTouchEnd={e => e.preventDefault()}
        onKeyPress={e => { if (e.key == "Enter" || e.keyCode == 32) { this.sendAction(); }}}
        disabled={text === 'loading'}>

        {
          text === 'loading' ? <LoadingSpinner /> : <span>{ text }</span>
        }

        {
          answer.verificationStatus &&
            <i className={`material-icons ${answer.verificationStatus}`}>{answer.verificationStatus}</i>
        }
      </button>
    );
  }
}

function stateToProps(state, props) {
  return {
  };
}

const dispatchToProps = {
  getVehicleDetails,
  upsertAnswerForFieldName
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputVehicleSearch);
