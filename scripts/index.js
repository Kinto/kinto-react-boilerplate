import "babel/polyfill";
import btoa from "btoa";
import React from "react";
import App from "./components/App";
import { Store } from "./store";
import Kinto from "kinto";


// Use Mozilla demo server with Fxa authentication:
const server = "https://kinto.dev.mozaws.net/v1";
const headers = {};

const login = server.replace("v1", "v0/fxa-oauth/login?redirect=")
const redirect = encodeURIComponent(window.location.href.replace(/#.*/, '') + '#');
const user = {token: "", loginURI: login + redirect};

// Receive token after redirection from OAuth server.
const fxaToken = window.location.hash.slice(1);
if (fxaToken) {
  window.location.hash = "";  // Hide it from navbar.
  headers.Authorization = "Bearer " + fxaToken;
  user.token = fxaToken;
}

const kinto = new Kinto({remote: server, headers: headers});
const store = new Store(kinto, "items");

React.render(<App store={store} user={user}/>, document.getElementById("app"));
