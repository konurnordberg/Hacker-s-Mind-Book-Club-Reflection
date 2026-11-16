import test from 'node:test';
import assert from 'node:assert/strict';
import { newReward, rewardStep, allocateFund, newPressure, pressureStep } from '../src/models.js';

const play = (actions, patched = false) => actions.reduce(rewardStep, newReward(patched));
const simulate = (level, repair) => Array.from({ length: 10 }).reduce((state) => pressureStep(state, level, repair), newPressure());

test('the tempting exploit reaches the target with only one new idea', () => {
  const state = play(['read', 'copy', 'copy', 'copy', 'copy']);
  assert.equal(state.score, 100);
  assert.equal(state.notes, 1);
  assert.equal(state.energy, 0);
});

test('maximum genuine learning misses the original target', () => {
  const state = play(['read', 'read', 'read']);
  assert.equal(state.notes, 3);
  assert.equal(state.score, 60);
  assert.equal(state.energy, 0);
});

test('the patch removes duplicate rewards without refunding wasted effort', () => {
  const state = play(['read', 'copy', 'copy', 'copy', 'copy'], true);
  assert.equal(state.score, 20);
  assert.equal(state.energy, 0);
  assert.equal(state.notes, 1);
});

test('invalid moves, nonexistent originals, and overspending cannot change state', () => {
  const initial = newReward();
  assert.strictEqual(rewardStep(initial, 'copy'), initial);
  assert.strictEqual(rewardStep(initial, 'invent'), initial);
  const spent = play(['read', 'read', 'read']);
  assert.strictEqual(rewardStep(spent, 'read'), spent);
  assert.strictEqual(rewardStep(spent, 'copy'), spent);
  assert.equal(initial.energy, 6);
});

test('all legal reward strategies stay within their resource and score limits', () => {
  const visit = (state) => {
    assert.ok(state.energy >= 0 && state.energy <= 6);
    assert.ok(state.notes <= 3);
    assert.ok(state.score <= (state.patched ? 60 : 100));
    for (const move of ['read', 'copy']) {
      const next = rewardStep(state, move);
      if (next !== state) visit(next);
    }
  };
  visit(newReward());
  visit(newReward(true));
});

test('capital enables the account loophole and the arithmetic exposes its cost', () => {
  const solo = allocateFund({ extraAccounts: 4, budget: 0 });
  assert.equal(solo.extras, 0);
  assert.equal(solo.eachOther, 20);
  const capital = allocateFund({ extraAccounts: 4, budget: 20 });
  assert.equal(capital.gross, 100);
  assert.equal(capital.setup, 20);
  assert.equal(capital.net, 80);
  assert.equal(capital.eachOther, 0);
});

test('a person-based cap closes the loophole, but setup money is still spent', () => {
  const state = allocateFund({ extraAccounts: 4, budget: 20, patched: true });
  assert.equal(state.gross, 20);
  assert.equal(state.net, 0);
  assert.equal(state.eachOther, 20);
});

test('fund accounting conserves credits and rejects unaffordable extra accounts', () => {
  for (let budget = 0; budget <= 20; budget++) {
    for (let accounts = -1; accounts <= 6; accounts++) {
      for (const patched of [false, true]) {
        const state = allocateFund({ extraAccounts: accounts, budget, patched });
        assert.equal(state.gross + state.eachOther * 4, 100);
        assert.ok(state.setup <= budget);
        assert.equal(state.net + state.setup, state.gross);
        assert.ok(state.remaining >= 0);
      }
    }
  }
});

test('pressure without feedback destroys integrity instead of creating strength', () => {
  const state = simulate(6, false);
  assert.equal(state.integrity, 0);
  assert.equal(state.defense, 0);
  assert.equal(state.round, 10);
  assert.equal(state.history.length, 11);
});

test('repair stops a repeated flaw but cannot erase the first two hits', () => {
  const state = simulate(6, true);
  assert.deepEqual(state.history.slice(0, 4), [100, 88, 82, 82]);
  assert.equal(state.integrity, 82);
  assert.equal(state.defense, 20);
  assert.strictEqual(pressureStep(state, 6, true), state);
});

test('all supported pressure levels preserve bounds and reveal repair benefits', () => {
  for (let level = 1; level <= 10; level++) {
    const unrepaired = simulate(level, false);
    const repaired = simulate(level, true);
    assert.ok(repaired.integrity > unrepaired.integrity);
    for (const state of [unrepaired, repaired]) {
      assert.ok(state.history.every((value, i, history) => value >= 0 && value <= 100 && (i === 0 || value <= history[i - 1])));
    }
  }
});
