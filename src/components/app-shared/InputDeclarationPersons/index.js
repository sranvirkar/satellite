import React, { Component } from "react";
import { connect } from "react-redux";
import { multipleAnswerGroups } from "../../../redux/selectors";
import DriverCardField from "components/app-shared/DriverCardField";
import PolicyHolderCard from "components/app-shared/PolicyHolderCard";
import InputAnswerGroupsCheckbox from "components/app-shared/InputAnswerGroupsCheckbox";

class InputDeclarationsPersons extends Component {
  filterOptions = (options) => {
    // Only show drivers and policyholders that are NOT a driver (prevent the same person from appearing as an option twice)
    return options.filter(option => option.label.entity === "person" || option.label.answers.driverPolicyholder === undefined);
  }

  render() {
    const { answerGroups } = this.props;

    const options = answerGroups.map(answerGroup => {
      return {
        label: answerGroup,
        value: answerGroup.id
      }
    });

    const PersonCard = (props) => {
      const { label, isSelected } = props;
      switch (label.entity) {
        case "person":
          return <DriverCardField answerGroupId={label.id} isSelected={isSelected} clickable="true"/>;

        case "policyholder":
          return <PolicyHolderCard answerGroupId={label.id} isSelected={isSelected} />;
      }
    }

    return (
      <InputAnswerGroupsCheckbox options={options} filterOptions={this.filterOptions} {...this.props}>
        <PersonCard />
      </InputAnswerGroupsCheckbox>
    );
  }
}

function stateToProps(state, props) {
  return {
    answerGroups: multipleAnswerGroups(state, ['policyHolder', 'driver'])
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(InputDeclarationsPersons);
