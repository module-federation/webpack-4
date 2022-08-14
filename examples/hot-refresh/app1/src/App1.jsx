import React from "react"

export default function App1 (props) {
  return <div>
    <div style={{margin:"10px",
        padding:"10px",
        textAlign:"center",
        backgroundColor:"greenyellow"}}>app1: {new Date().toLocaleTimeString()}</div>
    {props.children}
  </div>
}