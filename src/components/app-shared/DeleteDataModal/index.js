import React, { Component } from "react";
import Section from "components/app-shared/FormSection";
import FormField from "components/app-shared/FormField";
import { connect } from "react-redux";

class DeleteDataModal extends Component {
  render() {
    const {
      field,
      proceedAction,
      cancelAction,
      customActionName
    } = this.props;

    return (
      <div className="shared-DeleteDataModal">
        <h1 className="poncho-h4">{customActionName || 'Remove'} <span>{field.entityName}</span></h1>

        <section>
          <p className="poncho-body short">{field.deleteText}</p>

          <a
            className="poncho-btn-primary-reg"
            tabIndex="0"
            onMouseUp={e => proceedAction()}
            onTouchStart={e => proceedAction()}
            onTouchEnd={e => e.preventDefault()}>
            Yes
          </a>
          <a
            className="poncho-btn-primary-reg white"
            tabIndex="0"
            onMouseUp={e => cancelAction()}
            onTouchStart={e => cancelAction()}
            onTouchEnd={e => e.preventDefault()}>
            Cancel
          </a>

        </section>
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
)(DeleteDataModal);
