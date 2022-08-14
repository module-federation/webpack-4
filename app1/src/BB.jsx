import React from "react"
console.log(window.a = (window.a || 0) + 1)
export default function BB (props) {
  return <div>23{props.children}</div>
}