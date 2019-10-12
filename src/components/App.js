import React, { Component } from "react";
import { connect } from "react-redux";

import Footer from './app-global/Footer';
// TODO: import { Footer } from "poncho-reusables";
import AppRouter from "./AppRouter";

import { elementClosest } from "helpers/polyfills";
import { createQuoteForm } from "redux/actions";
import { globalLoadingSelector } from "redux/selectors";

class App extends Component {
  constructor(props) {
    super(props);

    props.createQuoteForm();
    elementClosest();
  }

  render() {
    // placeholder: show loading when there is a network request that has a global loading state (in this case, create form)
    // if (this.props.loading) return <div>loading</div>;

    return (
      <div className="App">
        <AppRouter />
        {/* { this.props.loading && <div>Loading...</div> } */}
        <Footer />
      </div>
    );
  }
}

function stateToProps(state) {
  return {
    loading: globalLoadingSelector(state)
  };
}

const dispatchToProps = {
  createQuoteForm
};

export default connect(
  stateToProps,
  dispatchToProps
)(App);
