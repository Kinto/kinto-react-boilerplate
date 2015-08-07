import { expect } from "chai";
import { EventEmitter } from "events";
import sinon from "sinon";

import Auth from "../scripts/auth";
import Controller from "../scripts/controller";
import Store from "../scripts/store";


describe("Controller", () => {
  var controller, auth, store, events;

  beforeEach(() => {
    events = new EventEmitter();
    auth = new Auth(events, {hash: ''});
    store = new Store('dataset', events);
    controller = new Controller({auth, store}, events);
  });

  describe("#on()", () => {
    it("supports multiple comma-separated event names", () => {
      const callback = sinon.spy();
      controller.on('event1, event2', callback);
      events.emit('event1');
      events.emit('event2');
      sinon.assert.calledTwice(callback);
    });
  });

  describe("#dispatch()", () => {
    it("emits event and associated data", () => {
      const callback = sinon.spy();
      controller.on('event', callback);
      controller.dispatch('event', {title: 'Top'});
      sinon.assert.calledWithExactly(callback, {title: 'Top'});
    });
  });


  describe("Start", () => {
    it("configures with default configuration", () => {
      const callback = sinon.spy();
      controller.on('config:change', callback);
      window.localStorage.removeItem('config');
      events.emit('action:start');
      sinon.assert.calledWithExactly(callback, {server: "https://kinto.dev.mozaws.net/v1"});
    });

    it("reads from localStorage if present", () => {
      const callback = sinon.spy();
      controller.on('config:change', callback);
      window.localStorage.setItem('config', '{"server":"http://kinto.com/v1"}');
      events.emit('action:start');
      sinon.assert.calledWithExactly(callback, {server: "http://kinto.com/v1"});
    });
  });


  describe("Configuration", () => {
    const config = {server: 'http://kinto.com/v1'};

    beforeEach(() => {
      sinon.spy(auth, 'authenticate');
      sinon.spy(auth, 'configure');
      events.emit('action:configure', config);
    });

    it("emits config change", () => {
      const callback = sinon.spy();
      controller.on('config:change', callback);
      events.emit('action:configure', config);
      sinon.assert.calledWithExactly(callback, config);
    });

    it("stores config in localstorage", () => {
      expect(window.localStorage.getItem('config')).to.eql('{"server":"http://kinto.com/v1"}');
    });

    it("auth component is configured", () => {
      sinon.assert.calledWithExactly(auth.configure, config);
    });

    it("starts authentication", () => {
      sinon.assert.called(auth.authenticate);
    });
  });

  describe("Login", () => {
    const info = {server: 'http://kinto.com/v1', headers: {}, user: 'me'};

    beforeEach(() => {
      sinon.spy(store, 'configure');
      sinon.spy(store, 'load');
      events.emit('auth:login', info)
    });

    it("store component is configured", () => {
      sinon.assert.calledWithExactly(store.configure, info);
    });

    it("loads store", () => {
      sinon.assert.called(store.load);
    });
  });


  describe("CRUD", () => {
    const record = {title: "App"};

    beforeEach(() => {
      store.configure({server: 'http://kinto.com/v1', headers: {}, user: 'me'});
      sinon.spy(store, 'create');
      sinon.spy(store, 'update');
      sinon.spy(store, 'delete');
      sinon.spy(store, 'sync');
    });

    it("creates record", () => {
      controller.dispatch("action:create", record);
      sinon.assert.calledWithExactly(store.create, record);
    });

    it("updates record", () => {
      const updated = Object.assign(record, {id: "1234"});
      controller.dispatch("action:update", updated);
      sinon.assert.calledWithExactly(store.update, updated);
    });

    it("deletes record", () => {
      controller.dispatch("action:delete", record);
      sinon.assert.calledWithExactly(store.delete, record);
    });

    it("syncs store", () => {
      controller.dispatch("action:sync");
      sinon.assert.called(store.sync);
    });
  });
});
