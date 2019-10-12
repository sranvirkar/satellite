import React, { Component } from "react";

class BannerTotals extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
  }

  render() {
    const { children } = this.props;

    return (
      <div className="shared-BannerTotals">
        { children }
      </div>
    )
  }
}

export default BannerTotals;
