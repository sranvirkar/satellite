import React, { Component } from "react";
import { connect } from "react-redux";

class FormContainer extends Component {

  render() {
    const {
      children,
      headerSupertitle,
      headerTitle,
      headerSubtitle,
      headerActionText,
      headerAction,
      footerText,
      footerAction,
      mainElementStyleRule
    } = this.props;



    return (
      <li className="shared-FormContainer">
        {
          headerSupertitle ||
          headerTitle ||
          headerSubtitle ||
          headerActionText ?
          <header>
            { headerSupertitle && <h3 className="poncho-h4">{headerSupertitle}</h3> }
            { headerTitle && <h3 className="poncho-lead bold">{headerTitle}</h3> }
            { headerSubtitle && <h4 className="poncho-body light-grey">{headerSubtitle}</h4> }

            {
              headerActionText &&
              headerAction &&
              <span
                className="poncho-body"
                onMouseUp={e => headerAction(e)}
                onTouchStart={e => headerAction(e)}
                onTouchEnd={e => e.preventDefault()}>
                {headerActionText}
              </span>
            }
          </header> : null
        }

        <main className={mainElementStyleRule}>
          {children}
        </main>

        {
          footerText &&
          <footer
            disabled={footerAction ? false : true}
            className={footerAction ? "" : "disabled"}
            onMouseUp={e => footerAction ? footerAction(e) : {}}
            onTouchStart={e => footerAction ? footerAction(e) : {}}
            onTouchEnd={e => e.preventDefault()}>
            {footerText}
          </footer>
        }

      </li>
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
)(FormContainer);
