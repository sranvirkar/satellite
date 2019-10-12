import React, { Component } from 'react';
import Modal from "components/app-global/Modal";
import AlertMessage from "components/app-shared/AlertMessage";
export default class BrowserCheck extends Component {
    constructor(props) {
      super(props);
      this.state = {
        supportedBrowsers: ['Chrome', 'Safari', 'Edge', 'Firefox'],
        isSupported: null
      }
    }

    componentDidMount = () => {
        var isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            any: function() {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera());
            }
        };
        
        if(isMobile.any()) {
            this.getBrowserMobile();
        } else {
            this.getBrowserDesktop();
        }
    }

    getBrowserDesktop = () => {
        let browser;
        if((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
            browser = 'Opera';
        } else if (typeof InstallTrigger !== 'undefined') {
            browser = 'Firefox';
        } else if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))) {
            browser = 'Safari';
        } else if (/*@cc_on!@*/false || !!document.documentMode) {
            browser = 'IE'
        } else if (browser != 'IE' && !!window.StyleMedia) {
            browser = 'Edge';
        } else if (!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)) {
            browser = 'Chrome';
        } else {
            return;
        }
        this.isBrowserSupported(browser);
    }

    getBrowserMobile = () => {
        let browser = '';
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        var isEdge = !isIE && !!window.StyleMedia;
        if(navigator.userAgent.indexOf("Chrome") != -1 && !isEdge) {
            browser = 'Chrome';
        } else if(navigator.userAgent.indexOf("Safari") != -1 && !isEdge) {
            browser = 'Safari';
        } else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
            browser = 'Firefox';
        } else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) { 
            browser = 'IE';
        } else if(isEdge)  {
            browser = 'Edge';
        } else {
            return;
        }
        this.isBrowserSupported(browser);
    }

    isBrowserSupported = (browser) => {
        this.setState ({  isSupported: this.state.supportedBrowsers.indexOf(browser) > -1 })
    }
    render() {
        return (
        <div>
          {
            !this.state.isSupported && 
            <AlertMessage 
            title="Sorry, your browser is not supported."
            message="You are using a browser we do not support. Please use a different browser to access our website. List of Browsers we support: Chrome, Safari, Firefox, Microsoft Edge"
          />
          }      
        </div>
        )
    }
}
