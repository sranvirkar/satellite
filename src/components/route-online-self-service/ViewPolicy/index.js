import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { policySummarySelector } from "redux/selectors";
import PolicySummary from "components/route-online-self-service/PolicySummary";
import { OSSBackArrow } from "helpers/svgIcons";
import TabGroup from "components/app-shared/TabGroup";
import Tab from "components/app-shared/TabGroup/Tab";
import FormContainer from "components/app-shared/FormContainer";
import Documents from "components/route-online-self-service/Documents";
import PolicyDetails from "components/route-online-self-service/PolicyDetails";
import Billing from "components/route-online-self-service/Billing";
import InputDateSingleDay from "components/app-shared/InputDateSingleDay";
import moment from "moment";

class ViewPolicy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      answer: {
        value: moment().format("YYYY-MM-DD")
      },
      field: {
        "name": "filterOss",
        "placeholder": "DD/MM/YYYY",
        "validations": [
          {
            "type": "regex",
            "string": "\\w",
            "errorMessage": "Please select a date to continue"
          },
          {
            "type": "regex",
            "string": "^(0[1-9]|[12][0-9]|3[01])\\/(0[1-9]|1[012])\\/\\d{4}$",
            "errorMessage": "Please enter this date in the format DD/MM/YYYY to continue."
          },
          {
            "type": "dateValid",
            "errorMessage": "Please enter this date in the format DD/MM/YYYY to continue."
          },
          {
            "type": "dateMin",
            "number": "0",
            "unit": "days",
            "errorMessage": "Please select a date between today and 30 days in the future."
          },
          {
            "type": "dateMax",
            "number": "30",
            "unit": "days",
            "errorMessage": "Please select a date between today and 30 days in the future."
          }
        ]
      }
    }
  }

  handleDateChange = (newAnswer, callback) => {
    const {
      field,
      answer,
    } = this.state;

    new Promise ((resolve, reject) => {
      this.setState({
        answer: { value: newAnswer }
      });
      resolve();
    }).then(() => {
      if (callback) { return callback; }
    });
  }

  renderPolicySummaryButton = () => {
    const { policy } = this.props;
    switch (policy.status) {
      case "active":
        return (
          <Link
            to={`${reactRoute}/oss/${policy.policyId}/edit/effective-date`}
            className="OnlineSelfService-PolicySummary_link poncho-btn-primary-reg">
            Edit Policy
          </Link>
        );
    }
  }

  render() {
    const policyId = this.props.match.params.id;
    const { field, answer } = this.state;
    const timestamp = moment(answer.value).format('x');

    return (
      <div className="Route-OnlineSelfService-ViewPolicy">
        <main>
          <div className="dashboard-header">
            <h2 className="poncho-h2">
              <Link to={`${reactRoute}/oss/`}><OSSBackArrow /></Link>
              {`# ${policyId}`}
            </h2>
            <span>Filter policy:</span>
            <InputDateSingleDay
              field={field}
              answer={answer}
              updateAnswer={this.handleDateChange}
              onBlurValidation={() => {}}
              repeatableIndex={undefined}
              manuallyClearErrors={() => {}}/>
          </div>

          <PolicySummary policyId={policyId} timestamp={timestamp} styles="has-footer big-padding">
            {this.renderPolicySummaryButton()}
          </PolicySummary>

          <FormContainer>
            <TabGroup>
              <Tab label="Policy details">
                <PolicyDetails policyId={policyId} timestamp={timestamp} />
              </Tab>
              <Tab label="Documents">
                <Documents policyId={policyId} />
              </Tab>
              <Tab label="Billing">
                <Billing policyId={policyId} />
              </Tab>
            </TabGroup>
          </FormContainer>

        </main>

      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
    policy: policySummarySelector(state, props.match.params.id)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(ViewPolicy);
