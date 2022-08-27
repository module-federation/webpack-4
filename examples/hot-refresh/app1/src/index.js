import App1 from "./App1.jsx"
import App2 from "http://localhost:9002/index.js"
import React from "react"
import reactDom from "react-dom"
setTimeout(() => {
  import("test/entry1?a=2")
}, 5000);

var dom = document.createElement("div")
document.body.appendChild(dom)
reactDom.render(<App1>
  <App2 />
</App1>, dom)
