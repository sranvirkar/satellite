import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { policyIdsSelector, policiesSelector, policySummariesSelector } from "redux/selectors";
import PolicySummary from "components/route-online-self-service/PolicySummary";
import InputDateSingleDay from "components/app-shared/InputDateSingleDay";
import moment from "moment";
import SupportLinks from "components/route-free-quote/SupportLinks";
import { policySummarySelector } from "redux/selectors";

class Dashboard extends Component {
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

  render() {
    const { policyIds, policies } = this.props;
    console.log('polciies', policies);
    const { field, answer } = this.state;
    const timestamp = moment(answer.value).format('x');

    return (
      <div className="Route-OnlineSelfService-Dashboard">
        <div className="main-wrapper">
          <main>
            <div>
              <div className="dashboard-header">
                <h2 className="poncho-h2">
                  My Policy
                </h2>
                <span className="poncho-body">Filter policy:</span>
                <InputDateSingleDay
                  field={field}
                  answer={answer}
                  updateAnswer={this.handleDateChange}
                  onBlurValidation={() => {}}
                  repeatableIndex={undefined}
                  manuallyClearErrors={() => {}}/>
              </div>
              <ul>
                {
                  policies.map((policy, index) =>
                  
                    <PolicySummary key={index} policyId={policy.policyId} timestamp={timestamp} styles="has-footer">

                      <Link
                        to={`${this.props.match.path}/${policy.policyId}`}
                        className="OnlineSelfService-PolicySummary_link poncho-btn-primary-reg">
                        View Policy
                      </Link>
                      {
                        policy.status === 'active' ? (
                          <Link
                          to={`${this.props.match.path}/${policy.policyId}/edit/effective-date`}
                          className="OnlineSelfService-PolicySummary_link poncho-btn-primary-reg white">
                          Edit Policy
                          </Link> 
                        ) : (null)
                      }
                       

                    </PolicySummary>
                  )
                }
              </ul>
              <SupportLinks/>
            </div>
          </main>
        </div>

        <div className="aside-wrapper">
          <aside>
            {/* userModel is a global variable exposed on the Visualforce page */}
            <h5 className="poncho-h5">Welcome {userModel.firstName},</h5>
            <p className="poncho-body light-grey short">Good to see you, here you can manage your Poncho policy. </p>
            <p className="poncho-body light-grey short">Don’t forget if you need help you can always <Link to={`${reactRoute}/oss/contact/startPage`}>contact us</Link>.</p>
          </aside>
        </div>
      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
    policyIds: policyIdsSelector(state),
    policies: policySummariesSelector(state)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(Dashboard);
