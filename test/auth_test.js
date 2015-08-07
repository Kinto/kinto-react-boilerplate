import { expect } from "chai";
import jsdom from "jsdom";
import { EventEmitter } from "events";
import sinon from "sinon";

import Auth from "../scripts/auth";


describe("Auth", () => {

  var auth, events, location;

  beforeEach(() => {
    location = {hash: ''};
    events = new EventEmitter();
    auth = new Auth(events, location);
  });


  describe("#configure()", () => {

    it("sets server from config", () => {
      const server = 'http://kinto-storage.org';
      auth.configure({server});
      expect(auth.server).to.eql(server);
    });
  });


  describe("#authenticate()", () => {

    it("takes username from location hash", (done) => {
      events.on('auth:login', info => {
        expect(info.user).to.eql('token');
        done();
      });
      location.hash = '#token';
      auth.authenticate();
    });

    it("uses default username if no hash", (done) => {
      events.on('auth:login', info => {
        expect(info.user).to.eql('public-demo');
        done();
      });
      location.hash = '';
      auth.authenticate();
    });

    it("provides headers and server", (done) => {
      auth.configure({server: 'server.com'});

      events.on('auth:login', info => {
        expect(info.server).to.eql('server.com');
        expect(info.headers.Authorization).to.eql('Basic cHVibGljLWRlbW86czNjcjN0');
        done();
      });
      auth.authenticate();
    });
  });
});
