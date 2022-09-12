import React from 'react';
import usemf from "usemf"
console.log(1111, usemf.getShareScopes())

export default function App2(props) {
  return (
    <div
      style={{
        margin: '10px',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: 'cyan',
      }}
    >
      app2: {new Date().toLocaleTimeString()}
    </div>
  );
}
