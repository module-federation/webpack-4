import React from "react"

export default function App1 (props) {
  return <div>
    <div>app1: {Math.random()}</div>
    {props.children}
  </div>
}