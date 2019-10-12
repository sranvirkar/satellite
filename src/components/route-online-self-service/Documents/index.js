import React, { Component } from "react";
import { connect } from "react-redux";
import Document from "./Document";
import LoadingSpinner from "components/app-global/LoadingSpinner";
import FormContainer from "components/app-shared/FormContainer";

import { policyDocumentsSelector } from "redux/selectors";

class Documents extends Component {
  render() {
    const { documents } = this.props;

    if (!documents) { return <LoadingSpinner />; }

    const upToDateDocs = documents.reduce((acc, currentDoc) => {
        const duplicate = acc.findIndex(doc => doc.displayName === currentDoc.displayName);

        if (duplicate < 0) {
          acc.push(currentDoc);
          return acc;

        } else {
          if (acc[duplicate].effectiveTimestamp < currentDoc.effectiveTimestamp) {
            acc.splice(duplicate, 1, currentDoc);
          }

          return acc;
        }

      },[]
    );
    //
    // const thisMonthDocs = documents.filter(doc => {
    //   const isThisMonth = moment.unix(doc.effectiveTimestamp / 1000).isAfter(moment().add("-1", "month"), "day");
    //   const alreadyShownDocs = upToDateDocs.findIndex(doc2 => doc2.locator === doc.locator);
    //   console.log('docs not to include in this Month', isThisMonth, alreadyShownDocs < 0);
    //   return !isThisMonth && alreadyShownDocs < 0;
    // });
    //
    // const thisYearDocs = documents.filter(doc => {
    //   const isThisYear = moment.unix(doc.effectiveTimestamp / 1000).isAfter(moment().add("-1", "year"), "day");
    //   const alreadyShownDocs = upToDateDocs.findIndex(doc2 => doc2.locator === doc.locator);
    //   const alreadyShownDocs2 = thisMonthDocs.findIndex(doc2 => doc2.locator === doc.locator);
    //   return isThisYear && alreadyShownDocs < 0 && alreadyShownDocs2 < 0;
    // });
    //
    // const botDocs = documents.filter(doc => {
    //   const alreadyShownDocs = upToDateDocs.findIndex(doc2 => doc2.locator === doc.locator);
    //   const alreadyShownDocs2 = thisMonthDocs.findIndex(doc2 => doc2.locator === doc.locator);
    //   const alreadyShownDocs3 = thisYearDocs.findIndex(doc2 => doc2.locator === doc.locator);
    //   return alreadyShownDocs < 0 && alreadyShownDocs2 < 0 && alreadyShownDocs3 < 0;
    // });

    return (
      <div className="Documents">
        {
          upToDateDocs && 
          <FormContainer headerTitle="Most up to date documents">
            <ul>
              {upToDateDocs.map((doc, i) => <Document key={i} document={doc} />)}
            </ul>
          </FormContainer>
        }

        {
          documents && 
          <FormContainer headerTitle="Previous documents">
            <ul>
              {
                documents
                .sort((a, b) => b.effectiveTimestamp - a.effectiveTimestamp)
                .map((doc, i) => <Document key={i} document={doc} />)
              }
            </ul>
          </FormContainer>
        }

        {/*{
          thisMonthDocs &&
          thisMonthDocs.length !== 0 && (
            <div>
              <h2 className="ui-kit-label-bold-with-padding">This month</h2>
              <ul>
                { thisMonthDocs.map((doc, i) => <Document key={i} document={doc} />) }
              </ul>
            </div>
          )
        }

        {
          thisYearDocs &&
          thisYearDocs.length !== 0 && (
            <div>
              <h2 className="ui-kit-label-bold-with-padding">This year</h2>
              <ul>
                { thisYearDocs.map((doc, i) => <Document key={i} document={doc} />) }
              </ul>
            </div>
          )
        }

        {
          botDocs &&
          botDocs.length !== 0 && (
            <div>
              <h2 className="ui-kit-label-bold-with-padding">Beginning of time</h2>
              <ul>
                { botDocs.map((doc, i) => <Document key={i} document={doc} />) }
              </ul>
            </div>
          )
        }*/}

      </div>
    );
  }
}

function stateToProps(state, props) {
  return {
    documents: policyDocumentsSelector(state, props.policyId)
  };
}

const dispatchToProps = {
};

export default connect(
  stateToProps,
  dispatchToProps
)(Documents);
