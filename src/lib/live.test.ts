import assert from "node:assert/strict";
import { test } from "vitest";
import { LIVE_HOSTS, isLiveHost } from "./live";

test("nothing is live until a public host is listed", () => {
  assert.deepEqual(LIVE_HOSTS, []);
  assert.equal(isLiveHost(), false);
  assert.equal(isLiveHost("localhost"), false);
  assert.equal(isLiveHost("jejumal.kr"), false);
});
