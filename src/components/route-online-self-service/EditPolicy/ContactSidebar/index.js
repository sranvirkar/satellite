import React, { Component } from "react";
import ReactDOM from "react-dom";

class ContactSidebar extends Component {

  componentDidMount() {
    this.addResizeListener();
    this.calculateWidth();
  }

  componentWillUnmount() {
    this.removeResizeListener();
  }

  addResizeListener = () => window.addEventListener('resize', this._debouncedCalculateWidth)
  removeResizeListener = () => window.removeEventListener('resize', this._debouncedCalculateWidth)

  calculateWidth = () => {
    const areElementsPresent =
      document.getElementById('main') &&
      document.getElementById('sidebar') &&
      document.querySelector('.shared-FormSection');

    if (areElementsPresent) {
      const value = document.querySelector('.shared-FormSection').offsetTop;
      document.querySelector('.EditPolicy-ContactSidebar').style.top = `${value}px`;
    }
  }

  render() {
    return (
      ReactDOM.createPortal(
        <div className="EditPolicy-ContactSidebar">
          <h5 className="poncho-h5">We're always here to help</h5>
          <p className="poncho-body light-grey short">Good to see you back, here you can manage your Poncho policy. Don’t forget if you need help you can always reach us on:</p>
          <ul className="poncho-body light-grey social-media">
            <li>support@poncho.com.au</li>
          </ul>
        </div>,
        document.getElementById('sidebar')
      )
    )
  }
}

export default ContactSidebar;
