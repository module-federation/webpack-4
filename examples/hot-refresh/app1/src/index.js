import json from "https://cdn.jsdelivr.net/npm/vue@2.7.8/package.json"
import React from "react"
const vue = import("https://cdn.jsdelivr.net/npm/vue@2.7.8/dist/vue.js")
import reactDom from "react-dom"
import App1 from "./App1.jsx"
import App2 from "http://localhost:9002/index.js"

;(async function () {
  console.log('json:', json)
  console.log('react:', React)
  console.log('vue:', vue)
  console.log('reactDom:', reactDom)
  var dom = document.createElement("div")
  document.body.appendChild(dom)
  reactDom.render(<App1>
    <App2 />
  </App1>, dom)
})()
