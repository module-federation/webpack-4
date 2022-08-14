import React from "react"

export default function App1 (props) {
  return <div>
    <div>app1234: {new Date().toLocaleDateString()}</div>
    {props.children}
  </div>
}