import React, { Component } from "react";
import { Alert } from "helpers/svgIcons";

class AlertMessage extends Component {
  render() {
    const { title, message } = this.props;

    return (
      <div className="AlertMessage">
        <div className="alert-icon"><Alert size="16" color="#e63a3c" /></div>
        <div>
          <p className="poncho-body bold">{title}</p>
          <p className="poncho-body">{message}</p>
        </div>
      </div>
    );
  }
}

export default AlertMessage;
