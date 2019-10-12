import React from "react";
import { PonchoLogo } from "helpers/svgIcons";

export default function Logo(props) {
  // By default the text is left aligned. Passing the center prop will centre align instead.
  const className = props.center ? 'global-Logo center' : 'global-Logo';
  return (
    <div className={className}>
      <PonchoLogo/>
    </div>
  );
}
