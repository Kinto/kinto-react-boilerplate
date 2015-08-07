import { expect } from "chai";
import sinon from "sinon";
import { EventEmitter } from "events";

import Store from "../scripts/store";


describe("Store", () => {

  var sandbox;
  var store;
  var events;

  beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    events = new EventEmitter();
    store = new Store("items", events);
    store.configure({server: 'http://server.com/v1'});

    sandbox.stub(store.collection, "create")
      .returns(Promise.resolve({data: {id: 1, label: "Hola!"}}));
    store.create({})
      .then(done);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("#load()", () => {

    beforeEach(() => {
      sandbox.stub(store.collection, "list")
        .returns(Promise.resolve({data: [{label: "from db"}]}));
    });

    it("uses the specified collection name", () => {
      expect(store.collection.name).to.equal("items");
    });

    it("fills items and emits change", (done) => {
      events.on("store:change", event => {
        expect(event.items).to.eql([{label: "from db"}]);
        done();
      });
      store.load();
    });
  });


  describe("#create()", () => {

    it("adds Kinto record to its state and emits change", (done) => {
      events.on("store:change", event => {
        expect(event).to.eql({items: [{id: 1, label: "Hola!"}, {id: 1, label: "Hola!"}]});
        done();
      });
      store.create({});
    });
  });


  describe("#update()", () => {

    it("replaces with Kinto record and emits change", (done) => {
      sandbox.stub(store.collection, 'update')
        .returns(Promise.resolve({data: {id: 1, label: "from db"}}));
      events.on('store:change', event => {
        expect(event).to.eql({items: [{id: 1, label: "from db"}]});
        done();
      });
      store.update({id: 1, label: "Mundo"});
    });
  });


  describe("#delete()", () => {

    it("removes record and emits change", (done) => {
      sandbox.stub(store.collection, "delete")
        .returns(Promise.resolve({}));
      events.on('store:change', event => {
        expect(event).to.eql({items: []});
        done();
      });
      store.delete({id: 1, label: "Mundo"});
    });
  });


  describe("#sync()", () => {

    beforeEach(() => {
      sandbox.stub(store.collection, "sync")
        .returns(Promise.resolve({ok: true}));
      sandbox.stub(store.collection, "list")
        .returns(Promise.resolve({data: [{label: "from db"}]}));
    });

    it("sends busy event when sync starts", () => {
      const callback = sinon.spy();
      events.on("store:busy", callback);
      store.sync();
      sinon.assert.calledOnce(callback);
    });

    it("reloads the local db after sync if ok", (done) => {
      events.on("store:change", event => {
        expect(event).to.eql({items: [{label: "from db"}]});
        done();
      });
      store.sync();
    });

    it("resolves conflicts using remote records", (done) => {
      store.collection.sync.returns(Promise.resolve({ok: true}));
      events.on("store:change", event => {
        sinon.assert.calledWithExactly(store.collection.sync, { strategy: 'server_wins' });
        done();
      });
      store.sync();
    });

    it("emits error when fails", (done) => {
      store.collection.sync.returns(Promise.reject(new Error("Server down")));
      events.on("store:error", error => {
        expect(error.message).to.eql("Server down");
        done();
      });
      store.sync();
    });
  });
});
