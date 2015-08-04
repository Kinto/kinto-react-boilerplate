import React from "react";
import TestUtils from "react/lib/ReactTestUtils";
import { expect } from "chai";
import sinon from "sinon";
import Kinto from "kinto";

import App, { Store, Form, List } from "../scripts/components/App";


describe("App", () => {

  var sandbox;
  var store;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    let kinto = new Kinto();
    store = new Store(kinto);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Component", () => {

    var rendered;

    beforeEach(() => {
      rendered = TestUtils.renderIntoDocument(<App store={store}/>);
    });

    it("adds item to the store on form submit", () => {
      const node = React.findDOMNode(rendered).querySelector("input");
      // XXX: no effect :(
      // TestUtils.Simulate.click(node);
      // TestUtils.Simulate.change(node, {target: {value: 'Hello, world'}});
      node.value = "Hello, world";
      const form = React.findDOMNode(rendered).querySelector("form");
      sandbox.stub(store.db, 'create').returns(Promise.resolve({}));
      TestUtils.Simulate.submit(form);
      sinon.assert.calledWithExactly(store.db.create, {label: "Hello, world"});
    });

    it("renders items of store when store changes", () => {
      store.emit("change", {items: [{label: ":)"}]});
      let node = React.findDOMNode(rendered);
      expect(node.querySelectorAll("li")).to.have.length.of(1);
    });
  });

  describe("Store", () => {
    it("adds Kinto created record to its state", () => {
      sandbox.stub(store.db, 'create').returns(Promise.resolve({label: "Hola!"}));
      store.create({})
        .then(_ => {
          expect(store.state.items).to.eql([{label: "Hola!"}]);
        });
    });

    it("emits change on create", () => {
      sandbox.stub(store.db, 'create').returns(Promise.resolve({}));
      let callback = sinon.spy();
      store.on('change', callback);
      store.create()
        .then(_ => {
          sinon.assert.called(callback);
        });
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
    expect(callback.calledWith({label: ''})).to.be.true;
  });
});
