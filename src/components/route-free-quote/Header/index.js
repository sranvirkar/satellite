import React from "react";
import { Link } from "react-router-dom";

import Logo from "components/app-global/Logo";

export default function Header(props) {
  return (
    <header className='Route-FreeQuote-Header'>
      <div className='container'>
        <Logo center={true} />
        <div className="navLinks">
        <Link to={`${reactRoute}`}>Back to main site</Link>
        <a title ="Login" href={`${reactRoute}/s/login`}>Login</a>
        </div>
      </div>
    </header>
  );
}
