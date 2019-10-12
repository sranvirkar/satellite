import React, { Component } from "react";

class Tab extends Component {
  handleClick = (event) => {
    this.props.handleClick(this.props.label);
    if (this.props.afterHandleClick) this.props.afterHandleClick(this.props.label);
  }

  render() {
    return (
      <li className={this.props.active ? "Tab active" : "Tab"} onClick={this.handleClick}>
        {this.props.label}
      </li>
    );
  }
}

export default Tab;
