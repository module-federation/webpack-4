import App1 from "./App1.js"
import App2 from "app2/App"
import React from "react"
import reactDom from "react-dom"

var dom = document.createElement("div")
document.body.appendChild(dom)
reactDom.render(<App1>
  <App2 />
</App1>, dom)
