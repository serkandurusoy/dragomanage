import React, { Component } from 'react';
import { Image as BootstrapImage } from 'react-bootstrap';

export default class Image extends Component {

  state = {
    src: this.props.src,
    errored: false,
  }

  errorImageURI = 'data:image/png;base64,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'

  resetSrc = (e) => {
    e.preventDefault();
    let newSrc = '/image-error.png';

    if (this.props.errorSrc) {
      newSrc = this.props.errorSrc;
    }

    if (this.state.errored) {
      newSrc = this.errorImageURI;
    }

    this.setState({
      errored: true,
      src: newSrc,
    });

  }

  render() {
    const {
      src,
      errorSrc,
      ...props
    } = this.props;

    return <BootstrapImage src={this.state.src} onError={this.resetSrc} {...props}/>
  }

}
