import React, { Component } from "react";
import moment from "moment";

export default class Document extends Component {
  render() {
    const { document } = this.props;

    return (
      <li className="Document">
        <i className="material-icons">file_copy</i>

        <div className="document-details">
          <p className="poncho-body">{document.displayName}</p>
          <p className="poncho-caption grey"><span className="uppercase">{document.type}</span>{` - `}<span>{moment.unix(document.effectiveTimestamp / 1000).format("DD/MM/YY")}</span></p>
        </div>

        <a className="poncho-caption teal" href={document.url}>Download <span className="uppercase">{document.type}</span></a>
      </li>
    );
  }
}
