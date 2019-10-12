import React, { Component } from "react";
import { Car, Female, Male, Shield } from "helpers/svgIcons";

export default class FormCard extends Component {

  renderPolicyStatus = () => {
    const { policyStatus } = this.props;
    switch (policyStatus) {
      case "active":
        return (
          <span className="status-wrapper">
          <span className="poncho-body active-text"> Active </span>
          </span>
         
        );
      
      case "grace":
          return (
            <span className="status-wrapper">
            <span className="poncho-body grace-text"> Pending </span>
            </span>
           
          );

      case "lapse":
          return (
            <span className="status-wrapper">
            <span className="poncho-body lapse-text"> Expired </span>
            </span>
           
          );
    }
  }

  render() {
    const {
      svgIcon,
      title,
      styles,
      captionsComponents,
      isCompact,
      isSelected,
      children,
      policyStatus
    } = this.props;
    return (
      <div className={`shared-FormCard ${isSelected ? 'selected' : ''} ${styles || ''}`}>
        <div className={`inner ${isCompact == "true" ? 'compact' : ''}`}>

          {React.createElement(svgIcon, { selected: isSelected })}

          <div className={`left`}>
            <p className="poncho-h5">{title}
              {
                policyStatus && 
                <span>
                {this.renderPolicyStatus()}
                </span>
              }
            </p>
            {captionsComponents}
          </div>
          <div className="right">
            { children }
          </div>
        </div>
      </div>
    );
  }
}
