import React, { Component } from "react";

class LoadingText extends Component {
    constructor(props) {
        super(props);
        this.loadingTextList = props.loadingTextList || ["We are grabbing your summary..."];
        this.state = {
            loadingText: this.loadingTextList[0]
        };
    }    
    
    setLoadingText(newText) {
        this.setState({
            loadingText: newText
        });
    }

    setInterval() {
        this.loadingTextInterval = setInterval(() => {
            const currentIndex = this.loadingTextList.indexOf(this.state.loadingText);
            const text = (currentIndex == this.loadingTextList.length - 1) ? 
                this.loadingTextList[0] : this.loadingTextList[currentIndex + 1];
            this.setLoadingText(text);
        }, 5000);
    }

    clearInterval(){
        clearInterval(this.loadingTextInterval);
    }

    componentDidMount(){
        this.setInterval();
    }

    componentWillUnmount(){
        this.clearInterval();
    }

    render() { 
        const { loadingText } = this.state;
        return ( 
            <p className="loading-text">{loadingText}</p>
        );
    }
}
 
export default LoadingText;