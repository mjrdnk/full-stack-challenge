import React from "react";
import "./App.css";

import { Foo } from "common/dist";

function App() {
  React.useEffect(() => {
    fetch("http://localhost:5001/")
      .then((response) => response.json())
      .then((data) => console.log(data));
  }, []);

  console.log("->", Object.keys(Foo));

  return <div className="App">Hello world</div>;
}

export default App;
