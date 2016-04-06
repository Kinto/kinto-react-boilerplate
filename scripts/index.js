import "babel/polyfill";
import { EventEmitter } from "events";
import React from "react";
import { render } from "react-dom";

import App from "./components/App";
import Auth from "./auth";
import Controller from "./controller";
import Store from "./store";


const events = new EventEmitter();
const auth = new Auth(events, window.location);
const store = new Store("items", events);
const controller = new Controller({auth, store}, events);

render(<App controller={controller}/>, document.getElementById("app"));
