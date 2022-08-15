import React from 'react';
import json from "https://cdn.jsdelivr.net/npm/vue@2.7.8/package.json"
const vue = import("https://cdn.jsdelivr.net/npm/vue@2.7.8/dist/vue.js")

;(async function () {
  console.log('json:', json)
  console.log('react:', React)
  console.log('vue:', await vue)
})()

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
