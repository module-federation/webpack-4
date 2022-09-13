// import "app1/App"
// import React from "react"
// import ReactD from "react-dom"
// console.log("app1", React.version, ReactD)
console.log('app1share', __webpack_share_scopes__)
setTimeout(() => {
  import("./oth")
}, 2000);

export default function () {
  return 111
}