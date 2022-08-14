// import json from "https://cdn.jsdelivr.net/npm/vue@2.7.8/package.json"
import React from "react"
// const vue = import("https://cdn.jsdelivr.net/npm/vue@2.7.8/dist/vue.js")
import reactDom from "react-dom"
const CC = () => import("http://localhost:9002/index.js")
import BB from "./BB.jsx"
const CC1 = React.lazy(CC)

;(async function () {
  // console.log('json:', json)
  console.log('react:', React)
  // console.log('vue:', vue)
  console.log('reactDom:', reactDom)
  // const CD = React.createElement(CC, null, 'children');
  var d = document.createElement("div")
  document.body.appendChild(d)
  reactDom.render(<BB>
    <React.Suspense fallback={<div>loading</div>}>
      <CC1 />
    </React.Suspense>
  </BB>, d)
})()
// import "systemjs/dist/extras/amd"
// import "systemjs/dist/extras/module-types"
// import "../wpmjs"


// ;(async function () {
//   console.log(222, await d)
// })()

