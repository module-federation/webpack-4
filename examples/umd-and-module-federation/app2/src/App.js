import React from "react";
import ReactDom from "react-dom";
// import d from "klein/App"
// console.log("d", d)
// import("./oth")
console.log(222, __webpack_share_scopes__)
console.log('react', React, 'dom', ReactDom)

const App = () => {
  return (
    <div style={{
      margin: "10px",
      padding:"10px",
      textAlign:"center",
      backgroundColor:"cyan"
    }}>
      <h1 >App 2</h1>
    </div>
  )
}

export default App;

