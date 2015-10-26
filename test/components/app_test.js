import { EventEmitter } from "events";
import { expect } from "chai";
import React from "react";
import TestUtils from "react/lib/ReactTestUtils";
import sinon from "sinon";

import App, { Form, List, Item, Preferences } from "../../scripts/components/App";
import Controller from "../../scripts/controller";
import Store from "../../scripts/store";
import Auth from "../../scripts/auth";


describe("App", () => {

  var sandbox;
  var controller;
  var events;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    events = new EventEmitter();

    const auth = new Auth(events, {hash: ''});
    const store = new Store('', events);
    ["create", "delete", "load", "update", "sync"].forEach(method => {
      sinon.stub(store, method).returns(Promise.resolve({}))
    });
    controller = new Controller({store, auth}, events);
  });

  afterEach(() => {
    sandbox.restore();
  });


  describe("Main", () => {

    var rendered;

    beforeEach(() => {
      rendered = TestUtils.renderIntoDocument(<App controller={controller}/>);
    });

    it("triggers action start on mount", () => {
      var callback = sinon.spy();
      events.on('action:start', callback);
      TestUtils.renderIntoDocument(<App controller={controller}/>);
      sinon.assert.calledOnce(callback);
    });

    it("renders items when store changes", () => {
      events.emit("store:change", {items: [{id: "id", label: ":)"}]});
      const node = React.findDOMNode(rendered);
      expect(node.querySelector("li").textContent).to.eql(":)");
    });

    it("triggers action sync on button click", () => {
      var callback = sinon.spy();
      events.on('action:sync', callback);
      const node = React.findDOMNode(rendered).querySelector("div > button");
      TestUtils.Simulate.click(node);
      sinon.assert.calledOnce(callback);
    });

    it("disables button while busy", () => {
      let selector = ".disabled button[disabled]";
      const node = React.findDOMNode(rendered);
      events.emit("store:busy", true);
      expect(node.querySelector(selector)).to.exist;
      events.emit("store:busy", false);
      expect(node.querySelector(selector)).to.not.exist;
    });

    it("shows message when error happens", () => {
      events.emit("store:error", new Error("Failed"));
      const node = React.findDOMNode(rendered);
      expect(node.querySelector(".error").textContent).to.eql("Failed");
    });

    it("clears error message when gets busy", () => {
      events.emit("store:error", new Error("Failed"));
      events.emit("store:busy", true);
      const node = React.findDOMNode(rendered);
      expect(node.querySelector(".error").textContent).to.eql("");
    });
  });


  /**
   * Since there is no way to provide a `context` to a child component
   * during instantiation, this wrapper creates a parent component
   * with the `controller` object in the context.
   */
  function wrapControllerContext(Component, controller) {
    return class ControllerComponent extends React.Component {
        static childContextTypes = { controller: React.PropTypes.object }
        getChildContext() { return {controller} }
        render() { return <Component {...this.props} />; }
    }
  }


  describe("Preferences", () => {
    var rendered;
    const server = "https://server.org/v1";

    beforeEach(() => {
      const AppPreferences = wrapControllerContext(Preferences, controller);
      rendered = TestUtils.renderIntoDocument(<AppPreferences server={server}/>);
    });

    it("renders server value in field", () => {
      expect(React.findDOMNode(rendered).querySelector("form input").value).to.equal(server);
    });

    it("emits action configure when field change", () => {
      const callback = sinon.spy();
      controller.on("action:configure", callback);
      const field = React.findDOMNode(rendered).querySelector("form input");
      const newvalue = "http:///localhost:8888/v1";
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      sinon.assert.calledWithExactly(callback, {server: newvalue});
    });
  });


  describe("List", () => {

    var rendered;
    const items = [{label: "Hello"}, {label: "World"}];

    beforeEach(() => {
      const AppList = wrapControllerContext(List, controller);
      rendered = TestUtils.renderIntoDocument(<AppList items={items}/>);
    });

    it("renders items as unordered list", () => {
      expect(React.findDOMNode(rendered).querySelectorAll("ul > li").length).to.equal(2);
    });

    it("triggers action edit on item click", () => {
      const callback = sinon.spy();
      controller.on("action:edit", callback);
      const node = React.findDOMNode(rendered);
      TestUtils.Simulate.click(node.querySelector("li:first-child"));
      sinon.assert.calledWithExactly(callback, 0);
    });

    it("shows item as form on action edit", () => {
      controller.dispatch("action:edit", 1);
      const node = React.findDOMNode(rendered);
      expect(node.querySelector("li:last-child > form")).to.exist;
    });

    it("hides form on action update", () => {
      controller.dispatch("action:edit", 1);
      controller.dispatch("action:update");
      const node = React.findDOMNode(rendered);
      expect(node.querySelector("form")).to.not.exist;
    });

    it("hides form on action delete", () => {
      controller.dispatch("action:edit", 1);
      controller.dispatch("action:delete");
      const node = React.findDOMNode(rendered);
      expect(node.querySelector("form")).to.not.exist;
    });
  });


  describe("Item", () => {

    var rendered;

    describe("View", () => {

      beforeEach(() => {
        const AppItem = wrapControllerContext(Item, controller);
        rendered = TestUtils.renderIntoDocument(<AppItem item={{label: "Value"}}/>);
      });

      it("renders label in item text", () => {
        const node = React.findDOMNode(rendered);
        expect(node.textContent).to.equal("Value");
      });

      it("sends action edit on click", () => {
        var callback = sinon.spy();
        controller.on('action:edit', callback)
        TestUtils.Simulate.click(React.findDOMNode(rendered));
        sinon.assert.calledOnce(callback);
      });
    });


    describe("Edit", () => {

      beforeEach(() => {
        const AppItem = wrapControllerContext(Item, controller);
        rendered = TestUtils.renderIntoDocument(<AppItem editing={true} item={{label: "Value"}}/>);
      });

      it("renders form if editing", () => {
        const node = React.findDOMNode(rendered);
        expect(node.querySelector("form")).to.exist;
      });

      it("sends action delete on button click", () => {
        const callback = sinon.spy();
        controller.on('action:delete', callback)
        const node = React.findDOMNode(rendered).querySelector("li > button");
        TestUtils.Simulate.click(node);
        sinon.assert.calledOnce(callback);
      });
    });
  });


  describe("Form", () => {

    var rendered;

    describe("Create", () => {

      beforeEach(() => {
        const AppForm = wrapControllerContext(Form, controller);
        rendered = TestUtils.renderIntoDocument(<AppForm/>);
      });

      it("has placeholder", () => {
        const input = React.findDOMNode(rendered).querySelector("input");
        expect(input.getAttribute('placeholder')).to.equal("Label");
      });

      it("shows add button", () => {
        const button = React.findDOMNode(rendered).querySelector("button");
        expect(button.textContent).to.equal("Add");
      });

      it("contains an input field and a submit button", () => {
        const selector = "button, input";
        const nodes = React.findDOMNode(rendered).querySelectorAll(selector);
        expect(nodes.length).to.equal(2);
      });

      it("sends create action on submit", () => {
        const callback = sinon.spy();
        controller.on('action:create', callback);

        const field = React.findDOMNode(rendered).querySelector("form > input");
        const newvalue = "Hola, mundo";
        TestUtils.Simulate.change(field, {target: {value: newvalue}});
        TestUtils.Simulate.submit(field);
        sinon.assert.calledWithExactly(callback, {label: newvalue});
      });
    });


    describe("Update", () => {

      const record = {id: "42", label: "Value"};

      beforeEach(() => {
        const AppForm = wrapControllerContext(Form, controller);
        rendered = TestUtils.renderIntoDocument(<AppForm record={record} />);
      });

      it("shows save button", () => {
        const button = React.findDOMNode(rendered).querySelector("button");
        expect(button.textContent).to.equal("Save");
      });

      it("renders label in field value if editing", () => {
        var node = React.findDOMNode(rendered);
        expect(node.querySelector("input").value).to.equal("Value");
      });

      it("sends update action on submit", () => {
        const callback = sinon.spy();
        controller.on('action:update', callback);

        const field = React.findDOMNode(rendered).querySelector("form > input")
        const newvalue = "Hola, mundo";
        TestUtils.Simulate.change(field, {target: {value: newvalue}});
        TestUtils.Simulate.submit(field);
        sinon.assert.calledWithExactly(callback, {id: "42", label: newvalue});
      });
    });
  });
});
