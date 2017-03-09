import React from 'react';
import FontAwesome from 'react-fontawesome';

export default function Loading() {

  return <div className="loadingContainer">
    <FontAwesome
      name='refresh'
      size='5x'
      spin
    />
  </div>

}
