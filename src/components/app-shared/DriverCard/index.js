import React, { Component } from "react";
import { connect } from "react-redux";
import FormCard from "components/app-shared/FormCard";
import { SelectedTick, Female, Male, Calendar } from "helpers/svgIcons";
import { answerByFieldNameAndAnswerGroup } from "redux/selectors";
import moment from 'moment';

class DriverCard extends Component {

  render() {
    const {
      answerGroupId,
      children,
      isSelected,
      isCompact,
      dobAnswerModel,
      firstNameAnswerModel,
      lastNameAnswerModel,
      genderAnswerModel,
      viewPolicyPage
    } = this.props;

    const captions = () => {
      return <ul>
        <li>
          <Calendar/>
          <span className="poncho-body grey short">{dobAnswerModel && moment(dobAnswerModel.value).format("DD MMMM YYYY")}</span>
        </li>
      </ul>
    }

    return (
      <FormCard
        isSelected={isSelected}
        svgIcon={genderAnswerModel && genderAnswerModel.value == "Female" ? Female : Male}
        title={viewPolicyPage ? `${viewPolicyPage.driverFirstName} ${viewPolicyPage.driverLastName}` : `${firstNameAnswerModel && firstNameAnswerModel.value} ${lastNameAnswerModel && lastNameAnswerModel.value}`}
        captionsComponents={captions()}
        isCompact={isCompact}>
          {
            isSelected && !children ?
            <SelectedTick styles={{marginTop: "12px"}} /> :
            children
          }
        </FormCard>
    );
  }
}

function stateToProps(state, props) {
  return {
    dobAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverDob", answerGroup: props.answerGroupId}),
    firstNameAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverFirstName", answerGroup: props.answerGroupId}),
    lastNameAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverLastName", answerGroup: props.answerGroupId}),
    genderAnswerModel: answerByFieldNameAndAnswerGroup(state, {fieldName: "driverGender", answerGroup: props.answerGroupId}),
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(DriverCard);
