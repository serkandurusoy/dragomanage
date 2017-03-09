import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import {
  Navbar,
  NavDropdown,
  Nav,
  NavItem,
  MenuItem,
} from 'react-bootstrap';
import { browserHistory } from 'react-router';
import { Logo, ProfileMenu } from './';
import { YETKILER } from '/imports/environment/meta';

export default createContainer(() => {

  let currentUser = Meteor.user();
  const kullanici = currentUser && currentUser.kullanici();

  return {
    currentUser,
    kullanici,
  };

}, class Navigation extends Component {

    state = {
      expanded: false,
    }

    setExpand = (e) => {
      browserHistory.push('/')
      this.setState({expanded: false});
    }

    goTo = (key,e) => {
      e.preventDefault();
      browserHistory.push(e.target.getAttribute('href'))
    }

    render() {

      const {
        kullanici,
        currentUser,
      } = this.props;

      return (
        <Navbar fluid fixedTop collapseOnSelect expanded={this.state.expanded} onToggle={() => this.setState({expanded: !this.state.expanded})}>
          <Logo setExpand={this.setExpand}/>
          <Navbar.Collapse>
            <Nav onSelect={this.goTo}>
              <NavDropdown title="Tanımlar" id="tanimlar-dropdown">
                <MenuItem disabled={!currentUser.yetkili(YETKILER.CARI_KARTLAR.value)} href="/tanimlar/cari-kartlar">Cari kartlar</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.URUNLER.value)} href="/tanimlar/urunler">Ürünler</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.URUNLER.value)} href="/tanimlar/markalar">Markalar</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.TANIMLAR.value)} href="/tanimlar/etiketler">Etiketler</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.TANIMLAR.value)} href="/tanimlar/siniflar">Sınıflar</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.TANIMLAR.value)} href="/tanimlar/kasalar">Kasalar</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.TANIMLAR.value)} href="/tanimlar/konumlar">Konumlar</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.SECRET.value)} href="/tanimlar/kullanicilar">Kullanıcılar</MenuItem>
              </NavDropdown>
              <NavDropdown title="Kayıtlar" id="kayitlar-dropdown">
                <MenuItem disabled={!currentUser.yetkili(YETKILER.MUHASEBE.value)} href="/kayitlar/tahsilatlar">Tahsilatlar</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.MUHASEBE.value)} href="/kayitlar/odemeler">Ödemeler</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.MUHASEBE.value)} href="/kayitlar/kasa-transferleri">Kasa transferleri</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.MUHASEBE.value)} href="/kayitlar/gelirler">Gelirler</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.MUHASEBE.value)} href="/kayitlar/giderler">Giderler</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.URUNLER.value)} href="/kayitlar/stok-transferleri">Stok transferleri</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.TALEPLER.value)} href="/kayitlar/talepler">Talepler</MenuItem>
              </NavDropdown>
              <NavDropdown title="Raporlar" id="raporlar-dropdown">
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_MUHASEBE.value)} href="/raporlar/ozet">Özet</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_MUHASEBE.value)} href="/raporlar/kasa-bakiyeleri">Kasa bakiyeleri</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_MUHASEBE.value)} href="/raporlar/kasa-acilis-bakiyeleri">Kasa açılış bakiyeleri</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_MUHASEBE.value)} href="/raporlar/cari-bakiyeler">Cari bakiyeler</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_MUHASEBE.value)} href="/raporlar/cari-acilis-bakiyeler">Cari açılış bakiyeler</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_URUN.value)} href="/raporlar/stok-bakiyeleri">Stok bakiyeleri</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_URUN.value)} href="/raporlar/stok-acilis-bakiyeleri">Stok açılış bakiyeleri</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.RAPOR_URUN.value)} href="/raporlar/barkod">Barkod</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.PUBLIC.value)} href="/raporlar/fiyat-listesi">Fiyat listesi</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.PUBLIC.value)} href="/raporlar/kurlar">Kurlar</MenuItem>
                <MenuItem disabled={!currentUser.yetkili(YETKILER.PUBLIC.value)} href="/">İşlem geçmişi</MenuItem>
              </NavDropdown>
            </Nav>
            <Nav pullRight>
              <ProfileMenu kullanici={kullanici} />
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      )
    }
  }
)
