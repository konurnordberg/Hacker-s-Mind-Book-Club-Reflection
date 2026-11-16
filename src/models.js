// Each model exposes the gap between a measured signal and its intended goal.
// Values are invented for this reflection, not empirical predictions.
export function newReward(patched = false) {
  return { energy: 6, notes: 0, copies: 0, score: 0, patched, history: [] };
}

export function rewardStep(state, action) {
  if (!['read', 'copy'].includes(action)) return state;
  const cost = action === 'read' ? 2 : 1;
  if (state.energy < cost || (action === 'copy' && state.notes === 0)) return state;
  const points = action === 'read' || !state.patched ? 20 : 0;
  return {
    ...state, energy: state.energy - cost,
    notes: state.notes + Number(action === 'read'),
    copies: state.copies + Number(action === 'copy'), score: state.score + points,
    history: [...state.history, { action, points, cost }],
  };
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function allocateFund({ extraAccounts = 0, budget = 0, patched = false } = {}) {
  const available = Math.floor(clamp(Number(budget) || 0, 0, 20) / 5);
  const extras = Math.floor(clamp(Number(extraAccounts) || 0, 0, available));
  // Change the unit of the cap, not the ownership of the accounts.
  const gross = patched ? 20 : (extras + 1) * 20;
  const setup = extras * 5;
  return { extras, gross, setup, net: gross - setup, remaining: 100 - gross, eachOther: (100 - gross) / 4 };
}

export function newPressure() {
  return { round: 0, integrity: 100, defense: 0, history: [100], lastDamage: 0 };
}

export function pressureStep(state, pressure, repair) {
  if (state.round >= 10) return state;
  const amount = clamp(Number(pressure) || 1, 1, 10);
  const damage = Math.min(state.integrity, Math.max(0, 2 * amount - state.defense));
  const integrity = state.integrity - damage;
  // A broken system cannot patch itself. Defense helps with future hits;
  // it never erases damage that has already happened.
  const defense = repair && integrity > 0 ? Math.min(20, state.defense + amount) : state.defense;
  return { round: state.round + 1, integrity, defense, lastDamage: damage, history: [...state.history, integrity] };
}
