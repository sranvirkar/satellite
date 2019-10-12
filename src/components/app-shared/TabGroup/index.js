import React, { Component } from "react";

class TabGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: this.props.activeTab || this.props.children[0].props.label
    }
  }

  handleClick = (tabLabel) => {
    this.setState({
      activeTab: tabLabel
    })
  }

  render() {
    return (
      <div className="shared-TabGroup">
        <ol>
          {React.Children.toArray(this.props.children).map(child => React.cloneElement(child, { key: child.props.label, active: child.props.label === this.state.activeTab, handleClick: this.handleClick }))}
        </ol>
        <div className="content">
          {React.Children.toArray(this.props.children).find(child => child.props.label === this.state.activeTab).props.children}
        </div>
      </div>
    );
  }
}

export default TabGroup;
