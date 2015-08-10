import "babel/polyfill";
import btoa from "btoa";
import React from "react";
import App, {Store} from "./components/App";
import Kinto from "kinto";

const server = "https://kinto.dev.mozaws.net/v1";
const userpass = (window.location.hash.slice(1) || "public") + ":s3cr3t";
const auth = "Basic " + btoa(userpass);

const kinto = new Kinto({remote: server, headers: {Authorization: auth}});
const store = new Store(kinto);

React.render(<App store={store}/>, document.getElementById("app"));
