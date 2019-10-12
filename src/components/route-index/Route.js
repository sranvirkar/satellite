import React, { Component } from "react";
import { Link } from "react-router-dom";
import FormStartModal from "components/route-free-quote/FormStartModal";
import Modal from "components/app-global/Modal";


class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showingFreeQuoteModal: false
    }
    this.toggleFreeQuoteModal = this.toggleFreeQuoteModal.bind(this);
  }

  componentDidMount() {
    this.setState({showingFreeQuoteModal: true});
  }

  toggleFreeQuoteModal() {
    const { showingFreeQuoteModal } = this.state;
    this.setState({showingFreeQuoteModal: !showingFreeQuoteModal});
  }

  render() {
    const { showingFreeQuoteModal } = this.state;
    return (
      <div className="Route-Index">
        {
          showingFreeQuoteModal &&
            <Modal
              padding="false"
              exitUsingButton="false"
              exitUsingBackground={false}
              exitModalAction={this.toggleFreeQuoteModal}>
              <FormStartModal />
            </Modal>
        }
        <span onClick={e => this.toggleFreeQuoteModal()}>toggle modal</span>

      </div>
    );
  }
}

export default Index;
