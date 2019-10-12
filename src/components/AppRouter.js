import React from "react";
import {
  Router,
  Route,
  Link,
  Redirect,
  withRouter,
  Switch } from "react-router-dom";
import { connect } from "react-redux";
import history from "helpers/history";

import Index from "components/route-index/Route";
import FreeQuote from "components/route-free-quote/Route";
import OnlineSelfService from "components/route-online-self-service/Route";

const AppRouter = () => (
  <Router history={history}>
    <Switch>
      <Route path={`${reactRoute}/`} exact component={Index} />
      <Route path={`${reactRoute}/free-quote/:sectionUrlParam`} component={FreeQuote} />
      <Route path={`${reactRoute}/oss`} component={OnlineSelfService} />
    </Switch>
  </Router>
);

export default AppRouter;
