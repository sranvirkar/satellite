import React, { Component } from "react";
import { connect } from "react-redux";
// import { } from "redux/selectors";
// import { } from "redux/actions";

class ErrorPage extends Component {
  render() {
    return (
      <div className="ErrorPage">
        <div>
          <h2 className="poncho-h2">An error occurred</h2>
          <p className="poncho-lead grey">Oh no! Something went wrong here. Please try again soon...</p>
        </div>
      </div>
    )
  }
}

function stateToProps(state, props) {
  return {
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(ErrorPage);