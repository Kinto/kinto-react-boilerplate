import React from "react";
import TestUtils from "react/lib/ReactTestUtils";
import { expect } from "chai";
import sinon from "sinon";
import Kinto from "kinto";

import App, { Form, List } from "../../scripts/components/App";
import { Store } from "../../scripts/store";


describe("App", () => {

  var sandbox;
  var store;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const kinto = new Kinto();
    store = new Store(kinto, "items");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Component", () => {

    var rendered;

    beforeEach(() => {
      sandbox.stub(store, "load").returns(Promise.resolve({}));
      sandbox.stub(store, "sync").returns(Promise.resolve({}));
      rendered = TestUtils.renderIntoDocument(<App store={store}/>);
    });

    it("adds item to the store on form submit", () => {
      const node = React.findDOMNode(rendered).querySelector("input");
      // XXX: no effect :(
      // TestUtils.Simulate.click(node);
      // TestUtils.Simulate.change(node, {target: {value: "Hello, world"}});
      node.value = "Hello, world";
      const form = React.findDOMNode(rendered).querySelector("form");
      sandbox.stub(store.collection, "create").returns(Promise.resolve({}));
      TestUtils.Simulate.submit(form);
      sinon.assert.calledWithExactly(store.collection.create, {label: "Hello, world"});
    });

    it("loads items from store on mount", () => {
      sinon.assert.calledOnce(store.load);
    });

    it("syncs store on button click", () => {
      const node = React.findDOMNode(rendered).querySelector("div > button");
      TestUtils.Simulate.click(node);
      sinon.assert.calledOnce(store.sync);
    });

    it("disables button during sync", () => {
      rendered.syncRecords();
      let selector = ".disabled button[disabled]";
      let node = React.findDOMNode(rendered);
      expect(node.querySelector(selector)).to.exist;
      store.emit("change", {});
      expect(node.querySelector(selector)).to.not.exist;
    });

    it("renders items of store when store changes", () => {
      store.emit("change", {items: [{id: "id", label: ":)"}]});
      let node = React.findDOMNode(rendered);
      expect(node.querySelector("li").textContent).to.eql(":)");
    });

    it("shows message when error happens", () => {
      store.emit("error", new Error("Failed"));
      let node = React.findDOMNode(rendered);
      expect(node.querySelector(".error").textContent).to.eql("Failed");
    });

    it("clears error message on sync", () => {
      store.emit("error", new Error("Failed"));
      rendered.syncRecords();
      let node = React.findDOMNode(rendered);
      expect(node.querySelector(".error").textContent).to.eql("");
    });
  });
});


describe("List", () => {
  it("renders without problems", () => {
    const rendered = TestUtils.renderIntoDocument(<List/>);
    expect(React.findDOMNode(rendered).tagName).to.equal("UL");
  });

  it("renders items in list", () => {
    const items = ["Hello", "World"];
    const rendered = TestUtils.renderIntoDocument(<List items={items}/>);
    expect(React.findDOMNode(rendered).querySelectorAll("li").length).to.equal(2);
  });
});


describe("Form", () => {

  var rendered;

  beforeEach(() => {
    rendered = TestUtils.renderIntoDocument(<Form/>);
  });

  it("renders without problems", () => {
    expect(React.findDOMNode(rendered).tagName).to.equal("FORM");
  });

  it("contains an input field and a submit button", () => {
    const selector = "button, input";
    const nodes = React.findDOMNode(rendered).querySelectorAll(selector);
    expect(nodes.length).to.equal(2);
  });

  it("uses callback on submit", () => {
    const callback = sinon.spy();
    rendered = TestUtils.renderIntoDocument(<Form updateRecord={callback}/>);
    const node = React.findDOMNode(rendered);
    TestUtils.Simulate.submit(node);
    expect(callback.calledWith({label: ""})).to.be.true;
  });
});
