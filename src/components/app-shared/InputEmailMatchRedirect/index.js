import React, { Component } from "react";
import { connect } from "react-redux";

class InputEmailMatchRedirect extends Component {
  sendAction() {
    window.alert('sent to login')
  }

  render() {
    const { field, answer } = this.props;

    return (
      <React.Fragment>
        <div className="label-wrapper short shared-InputEmailMatchRedirect">
          <p className={`super-title poncho-body medium short`}>This email address is already associated with a policyholder.</p>
          <label className={`poncho-body short`}>
            If you'd like to add another vehicle to your policy, you can do so via the online self service portal - <a href={`${reactRoute}/s/login`}>click here</a>. If you'd like to create a separate policy please use an alternate email address to continue.
          </label>
        </div>

        <a
          className={`shared-InputEmailMatchRedirect poncho-btn-primary-reg`}
          href={`${reactRoute}/s/login`}
          tabIndex="0">
          Log in as this policyholder
        </a>
      </React.Fragment>
    );
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
)(InputEmailMatchRedirect);
