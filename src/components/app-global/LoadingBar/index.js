import React from "react";
import { LoadingLogo } from "helpers/svgIcons";
import LoadingText from "components/app-global/LoadingBar/LoadingText";

export default function LoadingBar({width = 267, height = 6, marginTop = 128}) {  

  const loadingTextList = ["And we're off... fasten your seatbelts!", "Won't be long, almost at our destination", "Finding a park now (we hope it's not reverse parallel)"];

  return (
    <div className="LoadingBar-Wrapper" style={{marginTop: `${marginTop}px`}}>    
      <LoadingLogo />
      <LoadingText loadingTextList={loadingTextList} />
      <div className="global-LoadingBar" style={{width: `${width}px`, height: `${height}px`}} >
        <div className="progress-bar" style={{height: `${height}px`}}></div>
      </div>
    </div>
  );
}