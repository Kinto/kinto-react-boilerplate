import btoa from "btoa";


export default class Auth {
  constructor(events, location) {
    this.events = events;
    this.location = location;
    this.server = '';
  }

  configure(config) {
    this.server = config.server;
  }

  authenticate() {
    // Take username from location hash (With default value):
    const user = this.location.hash = (this.location.hash.slice(1) || "public-demo");
    const userpass64 = btoa(user + ":s3cr3t");
    const headers = {Authorization: "Basic " + userpass64};
    const server = this.server;

    this.events.emit('auth:login', {user, headers, server});
  }
}
