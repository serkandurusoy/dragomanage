import React from 'react';
import FontAwesome from 'react-fontawesome';
import { Container } from '/imports/client/components';
import { YETKILER } from '/imports/environment/meta';

export default function NotAllowed() {
  return (
    <Container yetki={YETKILER.PUBLIC.value}>
      <div className="text-center not-found">
        <FontAwesome
          name='exclamation-circle'
          size='4x'
        />
        <h4>Ekrana ulaşılamıyor.</h4>
        <h4>Bu ekrana erişim yetkiniz yok.</h4>
      </div>
    </Container>
  );
};
