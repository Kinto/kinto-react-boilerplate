import { EventEmitter } from "events";


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
