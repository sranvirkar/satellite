import React, { Component } from "react";
import { connect } from "react-redux";
import { policySummariesSelector } from "../../../redux/selectors";
import InputDropdown from "../InputDropdown";
import { getPolicies } from "redux/actions/policy";
import { fieldByName, answerByFieldNameAndAnswerGroup } from "../../../redux/selectors";
import { upsertAnswerForFieldName } from "../../../redux/actions/orm/Answer";

class InputPolicies extends Component {
    render() {
  
        const { policiesSelector, upsertAnswerForFieldName } = this.props;
        const options = policiesSelector.map(policy => {
            return {
              title: 'Vehicle Policy',
              label: policy.policyId,
              value: policy.policyId,
              startDate: policy.startDate
            }
           
          }); 
          const Option = (props) => 
          <div>
            
              <p className="contentTitle uppercase"> {props.title} </p>
                <p>
                <i className="material-icons">file_copy</i>
                  Policy: #{props.label}
                </p>
              <p> 
              <i className="material-icons">calendar_today</i>
                Start date: {props.startDate} 
              </p> 
            
           
           </div>;
          return (
            <InputDropdown options={options} {...this.props}><Option /></InputDropdown>
          );
    }
    
}
function stateToProps(state, props) {
    return {
      policiesSelector: policySummariesSelector(state)
    };
  }
  
  const dispatchToProps = {
    upsertAnswerForFieldName
  };

export default connect (
    stateToProps,
    dispatchToProps
) (InputPolicies);