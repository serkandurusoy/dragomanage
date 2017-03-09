import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

export default function TableRowLoading({ colSpan }) {
  return <tr>
    <td colSpan={colSpan} className="specialRow">
      <FontAwesome
        name='refresh'
        size='lg'
        spin
      />
    </td>
  </tr>;
}


