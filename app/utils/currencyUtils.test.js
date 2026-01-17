// app/utils/currencyUtils.test.js

import test from "node:test";
import assert from "node:assert/strict";
import { findBaseCurrency, findCommonCurrency } from "./currencyUtils";

test("findCommonCurrency respects updated common id", () => {
  const currencies = [
    { id: "a", name: "Gold", multiplier: 1 },
    { id: "b", name: "Silver", multiplier: 0.1 },
    { id: "c", name: "Copper", multiplier: 0.01 },
  ];

  assert.equal(findCommonCurrency(currencies, "b")?.name, "Silver");
  assert.equal(findCommonCurrency(currencies, "c")?.name, "Copper");
  assert.equal(findCommonCurrency(currencies, 99), undefined);
});

test("findBaseCurrency returns the rate-1 currency", () => {
  const currencies = [
    { id: "a", name: "Gold", multiplier: 1 },
    { id: "b", name: "Silver", multiplier: 0.1 },
  ];

  assert.equal(findBaseCurrency(currencies)?.id, "a");
});

test("findCommonCurrency matches ids across number/string boundaries", () => {
  const currencies = [
    { id: 1, name: "Gold", multiplier: 1 },
    { id: 2, name: "Silver", multiplier: 0.1 },
  ];

  assert.equal(findCommonCurrency(currencies, "2")?.name, "Silver");
});
