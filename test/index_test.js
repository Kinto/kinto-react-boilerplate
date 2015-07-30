import React from "react";
import TestUtils from "react/lib/ReactTestUtils";
import { expect } from "chai";
import App from "../scripts/components/App";

describe("App", () => {
  it("renders without problems", () => {
    expect(TestUtils.renderIntoDocument(<App/>)).to.exist;
  });
});
