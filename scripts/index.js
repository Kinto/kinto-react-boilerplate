/*
 * Webpack inclusions.
 */
require("../styles/style.less");

/*
 * Application.
 */
import "babel/polyfill";
import btoa from "btoa";
import React from "react";
import App from "./components/App";
import { Store } from "./store";
import Kinto from "kinto";

// Take username from location hash (With default value):
const user = window.location.hash = (window.location.hash.slice(1) || "public-demo");
const userpass64 = btoa(user + ":s3cr3t");

// Use Mozilla demo server with Basic authentication:
const server = "https://kinto.dev.mozaws.net/v1";
const kinto = new Kinto({
  remote: server,
  // Make sure local data depend on current user.
  dbPrefix: user,
  // Provide authentication header.
  headers: {Authorization: "Basic " + userpass64}
});

const store = new Store(kinto, "items");


React.render(<App store={store}/>, document.getElementById("app"));
