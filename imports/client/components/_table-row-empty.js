import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

export default function TableRowEmpty({ colSpan }) {
  return <tr>
    <td colSpan={colSpan} className="specialRow">
      <FontAwesome
        name='exclamation-circle'
      /> kayıt bulunamadı
    </td>
  </tr>;
}


