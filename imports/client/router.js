import React from 'react';
import { useScroll } from 'react-router-scroll';
import {
  applyRouterMiddleware,
  Router,
  IndexRoute,
  Route,
  IndexRedirect,
  browserHistory,
} from 'react-router';
import { YETKILER } from '/imports/environment/meta';

import Layout from './layout';
import {
  Timeline,
  Kullanicilar,
  Kurlar,
  Etiketler,
  Siniflar,
  Markalar,
  Kasalar,
  Konumlar,
  CariKartlar,
  Urunler,
  Tahsilatlar,
  Odemeler,
  KasaTransferleri,
  Gelirler,
  Giderler,
  StokTransferleri,
  Talepler,
  FiyatListesi,
  KasaBakiyeleri,
  KasaAcilisBakiyeleri,
  CariBakiyeler,
  CariAcilisBakiyeler,
  StokBakiyeleri,
  StokAcilisBakiyeleri,
  Ozet,
  Barkod,
  NotFound,
} from './pages';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/genie.css';

export default function AppRouter() {
  return <div>
    <Router
      history={browserHistory}
      render={applyRouterMiddleware(useScroll())} >
      <Route path="/" component={Layout} onEnter={clearAlerts}>
        <IndexRoute component={Timeline} yetki={YETKILER.PUBLIC.value}/>
        <Route path="tanimlar" >
          <IndexRedirect to="cari-kartlar" />
          <Route path="cari-kartlar" component={CariKartlar} yetki={YETKILER.CARI_KARTLAR.value}/>
          <Route path="urunler" component={Urunler} yetki={YETKILER.URUNLER.value}/>
          <Route path="markalar" component={Markalar} yetki={YETKILER.URUNLER.value}/>
          <Route path="etiketler" component={Etiketler} yetki={YETKILER.TANIMLAR.value}/>
          <Route path="siniflar" component={Siniflar} yetki={YETKILER.TANIMLAR.value}/>
          <Route path="kasalar" component={Kasalar} yetki={YETKILER.TANIMLAR.value}/>
          <Route path="konumlar" component={Konumlar} yetki={YETKILER.TANIMLAR.value}/>
          <Route path="kullanicilar" component={Kullanicilar} yetki={YETKILER.SECRET.value}/>
        </Route>
        <Route path="kayitlar" >
          <IndexRedirect to="tahsilatlar" />
          <Route path="tahsilatlar" component={Tahsilatlar} yetki={YETKILER.MUHASEBE.value}/>
          <Route path="odemeler" component={Odemeler} yetki={YETKILER.MUHASEBE.value}/>
          <Route path="kasa-transferleri" component={KasaTransferleri} yetki={YETKILER.MUHASEBE.value}/>
          <Route path="gelirler" component={Gelirler} yetki={YETKILER.MUHASEBE.value}/>
          <Route path="giderler" component={Giderler} yetki={YETKILER.MUHASEBE.value}/>
          <Route path="stok-transferleri" component={StokTransferleri} yetki={YETKILER.URUNLER.value}/>
          <Route path="talepler" component={Talepler} yetki={YETKILER.TALEPLER.value}/>
        </Route>
        <Route path="raporlar" >
          <IndexRedirect to="ozet" />
          <Route path="ozet" component={Ozet} yetki={YETKILER.RAPOR_MUHASEBE.value}/>
          <Route path="kasa-bakiyeleri" component={KasaBakiyeleri} yetki={YETKILER.RAPOR_MUHASEBE.value}/>
          <Route path="kasa-acilis-bakiyeleri" component={KasaAcilisBakiyeleri} yetki={YETKILER.RAPOR_MUHASEBE.value}/>
          <Route path="cari-bakiyeler" component={CariBakiyeler} yetki={YETKILER.RAPOR_MUHASEBE.value}/>
          <Route path="cari-acilis-bakiyeler" component={CariAcilisBakiyeler} yetki={YETKILER.RAPOR_MUHASEBE.value}/>
          <Route path="stok-bakiyeleri" component={StokBakiyeleri} yetki={YETKILER.RAPOR_URUN.value}/>
          <Route path="stok-acilis-bakiyeleri" component={StokAcilisBakiyeleri} yetki={YETKILER.RAPOR_URUN.value}/>
          <Route path="barkod" component={Barkod} yetki={YETKILER.RAPOR_URUN.value}/>
          <Route path="fiyat-listesi" component={FiyatListesi} yetki={YETKILER.PUBLIC.value}/>
          <Route path="kurlar" component={Kurlar} yetki={YETKILER.PUBLIC.value}/>
        </Route>
        <Route path="*" component={NotFound} yetki={YETKILER.PUBLIC.value}/>
      </Route>
    </Router>
    <Alert
      stack={true}
      timeout={5000}
      effect="genie"
      position="bottom"
      html={true}
    />
  </div>
};

function clearAlerts() {
  Alert.closeAll();
}
