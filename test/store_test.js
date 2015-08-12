import { expect } from "chai";
import sinon from "sinon";
import Kinto from "kinto";

import { Store } from "../scripts/store";


describe("Store", () => {

  var sandbox;
  var store;

  beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    const kinto = new Kinto();
    store = new Store(kinto);

    sandbox.stub(store.collection, 'create')
      .returns(Promise.resolve({data: {label: "Hola!"}}));
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

    it("fills items and emits change", (done) => {
      store.on("change", event => {
        expect(store.state.items).to.eql([{label: "from db"}]);
        done();
      });
      store.load();
    });
  });


  describe("#create()", () => {

    it("adds Kinto record to its state and emits change", (done) => {
      store.on("change", event => {
        expect(event).to.eql({items: [{label: "Hola!"}, {label: "Hola!"}]});
        done();
      });
      store.create({});
    });
  });


  describe("#sync()", () => {

    beforeEach(() => {
      sandbox.stub(store.collection, "sync")
        .returns(Promise.resolve({created: [{label: "from server"}]}));
    });

    it("adds Kinto created records to its state and emits change", (done) => {
      store.on("change", event => {
        expect(event).to.eql({items: [{label: "Hola!"}, {label: "from server"}]});
        done();
      });
      store.sync();
    });

    it("emits error when fails", (done) => {
      store.collection.sync.returns(Promise.reject(new Error("Server down")));
      store.on("error", error => {
        expect(error.message).to.eql("Server down");
        done();
      });
      store.sync();
    });
  });
});
