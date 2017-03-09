import React from 'react';
import {
  Navbar,
} from 'react-bootstrap';
import { Image } from '/imports/client/components';

export default function Logo({ setExpand }) {

  return <Navbar.Header>
    <Navbar.Brand>
      <Image
        alt="Dragomanage"
        src="/dragomanage-logo.svg"
        errorSrc="https://www.dragoman-turkey.com/wp-content/uploads/dynamik-gen/theme/images/dragoman-logo.png"
        onClick={setExpand} />
    </Navbar.Brand>
    <Navbar.Toggle />
  </Navbar.Header>;

}
