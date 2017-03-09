import { Meteor } from 'meteor/meteor';
import React from 'react';
import {
  Navbar,
  NavDropdown,
  MenuItem,
} from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { Image } from '/imports/client/components';

export default function ProfileMenu({ kullanici }) {

  return <NavDropdown className="profileMenu" title={
    <Navbar.Text>{kullanici.isim()} <Image src={kullanici.resim}  errorSrc="/user.png" circle style={{marginLeft: 10, height: 44}} /></Navbar.Text>
  } id="profile-menu-dropdown">
    <MenuItem href="https://accounts.google.com/" target="_blank" rel="noopener noreferrer">
      Hesap bilgilerim
      <FontAwesome name='user' fixedWidth className="menuIcon hidden-xs" />
    </MenuItem>
    <MenuItem href="https://plus.google.com/u/0/me" target="_blank" rel="noopener noreferrer">
      Google profilim
      <FontAwesome name='google' fixedWidth className="menuIcon hidden-xs" />
    </MenuItem>
    <MenuItem onClick={powerOff}>
      Güvenli çıkış
      <FontAwesome name='power-off' fixedWidth className="menuIcon hidden-xs" />
    </MenuItem>
  </NavDropdown>;

}

function powerOff(e) {
  e.preventDefault();
  Meteor.logout((err) => {
    window.location.assign('https://accounts.google.com/Logout');
  });
}
