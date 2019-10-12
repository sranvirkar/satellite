import React, { Component } from "react";

class ToggleList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false
    };
  }

  handleClick = (event) => {
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  render() {
    const { title, children } = this.props;
    const { isExpanded } = this.state;

    const className = ["shared-ToggleList", this.props.className].filter(className => className).join(' ');
    const addIcon = <img src={`${reactRoute}/resource/poncho/assets/img/add-icon.svg`} />;
    const minusIcon = <img src={`${reactRoute}/resource/poncho/assets/img/minus-icon.svg`} />;

    return (
      <div className={className}>
        <div className="title" onClick={this.handleClick}>{title}{isExpanded ? minusIcon : addIcon}</div>
        {
          isExpanded && <div className="content">{children}</div>
        }
      </div>
    );
  }
}

export default ToggleList;
