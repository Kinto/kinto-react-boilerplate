import { EventEmitter } from "events";


export class Store extends EventEmitter {

  constructor(kinto, collection) {
    super();
    this.state = {items: []};
    this.collection = kinto.collection(collection);
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
      .then((res) => {
        if (res.ok) {
          return this.load();
        }

        // If conflicts, take remote version and sync again (recursively).
        return Promise.all(res.conflicts.map(conflict => {
          return this.collection.resolve(conflict, conflict.remote);
        }))
        .then(_ => this.sync());
      })
      .catch(this.onError.bind(this));
  }
}
