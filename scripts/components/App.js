import { EventEmitter } from "events";
import React from "react";

import Kinto from "kinto";


const SERVER_URL = "https://kinto.dev.mozaws.net/v1";


export class List extends React.Component {

  static get defaultProps() {
    return {items: []};
  }

  render() {
    return (
      <ul>{
        this.props.items.map((label, i) => {
          return <li key={i}>{label}</li>;
        })
      }</ul>
    );
  }
}


export class Form extends React.Component {

  onFormSubmit(event) {
    event.preventDefault();
    var record = {label: event.target.label.value};
    this.props.updateRecord(record);
  }

  render() {
    return (
      <form onSubmit={this.onFormSubmit.bind(this)}>
        <input name="label" type="text" />
        <button type="submit">Add</button>
      </form>
    );
  }
}


export class Store extends EventEmitter {

  constructor() {
    super();
    this.state = {items: []};

    const kinto = new Kinto({remote: SERVER_URL});
    this.db = kinto.collection("items");
  }

  create(record) {
    return this.db.create(record)
      .then((res) => {
        this.state.items.concat(res.data);
        this.emit('change', {data: this.state});
      })
      .catch(console.error.bind(console));
  }
}


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.props.store.state;
    this.props.store.on('change', this.setState.bind(this));
  }

  updateRecord(record) {
    this.props.store.create(record);
  }

  render() {
    return (
      <div>
        <Form updateRecord={this.updateRecord.bind(this)}/>
        <List items={this.state.items}/>
      </div>
    );
  }
}
