const DEFAULT_SERVER = "https://kinto.dev.mozaws.net/v1";


export default class Controller {

  constructor(components, events) {
    this.store = components.store;
    this.auth = components.auth;
    this.events = events;

    this.events.on('auth:login', this.onLogin.bind(this));
    this.events.on('action:start', this.onStart.bind(this));
    this.events.on('action:configure', this.onConfigure.bind(this));
    this.events.on('action:create', this.onCreate.bind(this));
    this.events.on('action:update', this.onUpdate.bind(this));
    this.events.on('action:delete', this.onDelete.bind(this));
    this.events.on('action:sync', this.onSync.bind(this));
  }

  on(events, callback) {
    const names = events.split(/\s*,\s*/);
    names.forEach(event => this.events.on(event, callback));
  }

  dispatch(name, data) {
    this.events.emit(name, data);
  }

  onStart() {
    // Start application with default config.
    const previous = window.localStorage.getItem("config");
    const config = previous ? JSON.parse(previous) : {server: DEFAULT_SERVER};
    this.dispatch('action:configure', config);
  }

  onConfigure(config) {
    // Save config for next sessions.
    window.localStorage.setItem("config", JSON.stringify(config));
    this.events.emit("config:change", config);

    this.auth.configure(config);
    this.auth.authenticate();
  }

  onLogin(info) {
    this.store.configure(info);
    this.store.load();
  }

  onCreate(record) {
    this.store.create(record);
  }

  onUpdate(record) {
    this.store.update(record);
  }

  onDelete(record) {
    this.store.delete(record);
  }

  onSync() {
    this.store.sync();
  }
}
