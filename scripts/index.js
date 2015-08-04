import "babel/polyfill";
import React from "react";
import App, {Store} from "./components/App";
import Kinto from "kinto";


const DEFAULT_SERVER_URL = "https://kinto.dev.mozaws.net/v1";

const kinto = new Kinto({remote: DEFAULT_SERVER_URL});
const store = new Store(kinto);
React.render(<App store={store}/>, document.getElementById("app"));
