import React, { Component } from "react";
import Logo from "components/app-global/Logo";

class Footer extends Component {
  render() {
    return (
      <footer className="global-Footer">
        <div className="container">

          <div className="logo-with-tagline">
            <Logo />
            <p className="tagline poncho-caption">Australia's most trusted car insurance policies for the everyday family.</p>
          </div>

          <nav className="navigation">
            <div>
              <p className="poncho-h5">Explore</p>
              <ul>
                <li><a className="poncho-caption" href="#">Comprehensive</a></li>
                <li><a className="poncho-caption" href="#">About</a></li>
                <li><a className="poncho-caption" href="#">Careers</a></li>
                <li><a className="poncho-caption" href="https://poncho.floatplane.dev/contact/">Contact</a></li>
              </ul>
            </div>

            <div>
              <p className="poncho-h5">Follow</p>
              <ul>
                <li><a className="poncho-caption" href="#">Twitter</a></li>
                <li><a className="poncho-caption" href="#">Facebook</a></li>
                <li><a className="poncho-caption" href="#">Instagram</a></li>
              </ul>
            </div>

            <div>
              <p className="poncho-h5">Legal</p>
              <ul>
                <li><a className="poncho-caption" href="#">Privacy policy</a></li>
                <li><a className="poncho-caption" href="#">Terms of services</a></li>
              </ul>
            </div>
          </nav>

          <div className="disclaimer">
            <p className="poncho-caption">
              Insurance issued by Insurance Australia Limited ABN 11 000 016 722 AFSL 227681 trading as Poncho Insurance.
              Any advice provided is of a general nature only and does not take into consideration your objectives, financial situation or needs.
              Before using this advice to decide whether to purchase the insurancgit e policy, you should consider your personal circumstances and the applicable <a href={pdsUrl}>Product Disclosure Statement</a> available on our website.
              <br />
              Visit our <a href={termsUrl} target="_blank">Terms of Use</a> and <a href="" target="_blank">Privacy Statement</a></p>
              <br />
              <p className="poncho-caption">We will handle your personal information in accordance with our Privacy Statement and Privacy Policy.</p>
          </div>

          <p className="copyright poncho-caption">2019 Poncho. All Rights Reserved.</p>

        </div>

      </footer>
    );
  }
}

export default Footer;
