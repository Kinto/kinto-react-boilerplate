import { EventEmitter } from "events";
import React from "react";


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


export class Store extends EventEmitter {

  constructor(kinto) {
    super();
    this.state = {items: []};
    this.collection = kinto.collection("items");
  }

  onError(error) {
    this.emit("error", error);
  }

  load() {
    return this.collection.list()
      .then(res => {
        this.state.items = res.data;
        this.emit("change", this.state);
      })
      .catch(this.onError.bind(this));
  }

  create(record) {
    return this.collection.create(record)
      .then(res => {
        this.state.items.push(res.data);
        this.emit("change", this.state);
      })
      .catch(this.onError.bind(this));
  }

  sync() {
    return this.collection.sync()
      .then(res => {
        this.state.items = this.state.items.concat(res.created);
        this.emit("change", this.state);
      })
      .catch(this.onError.bind(this));
  }
}


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.props.store.state;
    this.props.store.on("change", state => {
      this.setState(Object.assign({busy: false}, state));
    });
    this.props.store.on("error", error => {
      this.setState({busy: false, error: error.message});
    });
    this.props.store.load();
  }

  updateRecord(record) {
    this.props.store.create(record);
  }

  syncRecords() {
    this.setState({busy: true, error: ""});
    this.props.store.sync();
  }

  render() {
    var disabled = this.state.busy ? "disabled" : "";
    return (
      <div className={disabled}>
        <Form updateRecord={this.updateRecord.bind(this)}/>
        <List items={this.state.items.map(item => item.label)}/>
        <button onClick={this.syncRecords.bind(this)} disabled={disabled}>Sync!</button>
        <div className="error">{this.state.error}</div>
      </div>
    );
  }
}
