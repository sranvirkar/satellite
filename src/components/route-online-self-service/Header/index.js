import React from "react";
import { Link } from "react-router-dom";

import Logo from "components/app-global/Logo";

export default function Header(props) {
  return (
    <header className='Route-OnlineSelfService-Header'>
      <div className='container'>
        <a href={`${reactRoute}/oss`}>
        <Logo center={true} /></a>
        <Link to={`${reactRoute}/oss`}>My Policy</Link>
        <Link to={`${reactRoute}/oss/claims/choosePolicy`}>Claims</Link>
        <Link to={`${reactRoute}/oss/contact/startPage`}>Contact Us</Link>
        
        
        <div className="avatar"><i className="material-icons">face</i>
        <a title ="Logout" href={`${reactRoute}/secur/logout.jsp?retUrl=${reactRoute}/s/login`}> <i className="material-icons">exit_to_app</i> </a>
        </div>
      </div>
    </header>
  );
}
