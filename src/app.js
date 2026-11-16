import { newReward, rewardStep, allocateFund, newPressure, pressureStep } from './models.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const setText = (selector, value) => { $(selector).textContent = value; };
const quantity = (number, singular, plural = singular + 's') => number + ' ' + (number === 1 ? singular : plural);
const storage = {
  // Storage can be denied by privacy settings; the experiments still work.
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
};
let reward = newReward();
let fund = allocateFund();
let pressure = newPressure();
let runTimer = null;

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = storage.get('loophole-motion') === null ? motionPreference.matches : storage.get('loophole-motion') === 'paused';
function renderMotion() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  $('#motion-toggle').setAttribute('aria-pressed', String(motionPaused));
  setText('#motion-toggle', motionPaused ? 'Resume motion ▷' : 'Pause motion Ⅱ');
}
$('#motion-toggle').addEventListener('click', () => {
  motionPaused = !motionPaused;
  storage.set('loophole-motion', motionPaused ? 'paused' : 'playing');
  renderMotion();
  if (motionPaused) stopRun();
});
motionPreference.addEventListener('change', (event) => {
  motionPaused = event.matches;
  renderMotion();
  if (motionPaused) stopRun();
});
renderMotion();

// Tabs support arrow keys, Home/End, and exactly one tab stop.
const tabs = $$('.lab-tabs [role="tab"]');
const visited = new Set(['reward']);
function selectTab(tab, focus = false) {
  stopRun();
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  visited.add(tab.id.replace('tab-', ''));
  setText('#experiment-progress', String(visited.size).padStart(2, '0') + ' / 03 EXPERIMENTS VISITED');
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
  });
});

function renderReward() {
  setText('#energy-text', reward.energy + ' / 6');
  $('#energy-cells').replaceChildren(...Array.from({ length: 6 }, (_, i) => {
    const cell = document.createElement('span');
    cell.className = i < reward.energy ? 'charged' : '';
    return cell;
  }));
  $('#score-value').innerHTML = reward.score + '<span>/100</span>';
  $('#learning-value').innerHTML = reward.notes + '<span>/3</span>';
  $('#score-bar').style.width = reward.score + '%';
  $('#learning-bar').style.width = (reward.notes / 3 * 100) + '%';
  $('#read-button').disabled = reward.energy < 2;
  $('#copy-button').disabled = reward.energy < 1 || reward.notes === 0;
  setText('#reward-rule', reward.patched ? 'score = 20 × original notes' : 'score = 20 × submissions');
  setText('#copy-description', '1 energy · +0 understanding · +' + (reward.patched ? 0 : 20) + ' points');
  setText('#resubmit-hint', reward.notes ? 'You can now resubmit the note.' : 'Write one original note to unlock resubmission.');
  setText('#reward-explanation', reward.patched
    ? quantity(reward.notes, 'original note') + ' × 20 = ' + reward.score + ' points. ' + quantity(reward.copies, 'copy', 'copies') + ' × 0 = 0 points. The best possible learning run now earns only 60. The 100-point target needs review too.'
    : quantity(reward.notes, 'original note') + ' + ' + quantity(reward.copies, 'copy', 'copies') + ' = ' + quantity(reward.notes + reward.copies, 'submission') + '. ' + (reward.notes + reward.copies) + ' × 20 = ' + reward.score + ' points. The rule sees no difference between an insight and its copy.');
  let feedback = 'Write a note to get started.';
  if (reward.history.length) feedback = reward.copies ? 'Copies earn points without adding any understanding.' : 'You wrote a new note. You can read more or try submitting the same one again.';
  if (reward.patched) feedback = reward.copies ? 'No points for copies. This toy system recognizes duplicates perfectly; real judgments of originality are harder.' : 'The patch rewards original notes. It also reveals that the old 100-point target is impossible.';
  if (!reward.energy) {
    feedback = reward.score >= 100 ? 'You reached 100 points by copying one note four times. The platform counts that as success.'
      : reward.notes === 3 ? 'You learned three new things and earned 60 points. That’s the most learning possible, but it falls short of the target.'
      : reward.score + ' points, ' + quantity(reward.notes, 'new idea') + '. Energy spent. Try another strategy or change the rule.';
  }
  setText('#reward-feedback', feedback);
  $('#reward-history').replaceChildren(...reward.history.map((move) => {
    const item = document.createElement('li');
    item.textContent = (move.action === 'read' ? 'New note' : 'Same note again') + ' → +' + move.points + ' points';
    return item;
  }));
}
$('#read-button').addEventListener('click', () => { reward = rewardStep(reward, 'read'); renderReward(); });
$('#copy-button').addEventListener('click', () => { reward = rewardStep(reward, 'copy'); renderReward(); });
function resetReward() { reward = newReward($('#reward-patch').checked); renderReward(); }
$('#reward-reset').addEventListener('click', resetReward);
$('#reward-patch').addEventListener('change', resetReward);
renderReward();

function renderFund() {
  const budget = Number($('input[name="resources"]:checked').value);
  $('#accounts').disabled = budget === 0;
  if (budget === 0) $('#accounts').value = 0;
  const patched = $('#fund-patch').checked;
  fund = allocateFund({ extraAccounts: Number($('#accounts').value), budget, patched });
  setText('#accounts-value', fund.extras);
  setText('#fund-rule', patched ? 'maximum = 20 per person' : 'maximum = 20 per account');
  setText('#fund-net', fund.net);
  setText('#fund-cost', fund.gross + ' claimed − ' + fund.setup + ' setup');
  setText('#fund-other', fund.eachOther);
  $('#fund-tokens').replaceChildren(...Array.from({ length: 20 }, (_, i) => {
    const token = document.createElement('span');
    token.className = i < fund.gross / 5 ? 'mine' : 'others';
    token.textContent = i < fund.gross / 5 ? '↗' : '·';
    token.style.setProperty('--i', i);
    return token;
  }));
  setText('#fund-feedback', patched
    ? 'The cap follows the person. You claim 20; each other person gets 20.' + (fund.setup ? ' Your ' + fund.setup + '-credit setup bill still counts. Extra accounts no longer help.' : ' The patch closes this particular gap.')
    : fund.extras ? (fund.extras + 1) + ' accounts, one owner. You take ' + fund.gross + '% of the fund; the other four people share ' + fund.remaining + '. Every claim follows the written rule.'
    : 'One account each. An equal 20-credit share for everyone.');
}
$$('input[name="resources"]').forEach((input) => input.addEventListener('change', renderFund));
$('#accounts').addEventListener('input', renderFund);
$('#fund-patch').addEventListener('change', renderFund);
renderFund();

function stopRun() {
  if (runTimer !== null) clearInterval(runTimer);
  runTimer = null;
  setText('#pressure-run', pressure.round > 0 && pressure.round < 10 ? 'Continue test →' : 'Run 10 rounds →');
  $('#pressure-step').disabled = pressure.round >= 10;
}
function renderPressure() {
  setText('#pressure-value', $('#pressure').value);
  setText('#round-label', 'ROUND ' + String(pressure.round).padStart(2, '0') + ' / 10');
  setText('#defense-label', 'DEFENSE ' + pressure.defense);
  $('#integrity-value').innerHTML = pressure.integrity + '<span>%</span>';
  const points = pressure.history.map((value, index) => (35 + index * 38.5) + ' ' + (160 - value * 1.4));
  $('#pressure-line').setAttribute('d', 'M' + points.join('L'));
  $('#pressure-area').setAttribute('d', 'M35 160L' + points.join('L') + 'L' + (35 + pressure.round * 38.5) + ' 160Z');
  $('#pressure-point').setAttribute('cx', 35 + pressure.round * 38.5);
  $('#pressure-point').setAttribute('cy', 160 - pressure.integrity * 1.4);
  setText('#chart-desc', 'After ' + pressure.round + ' rounds, system integrity is ' + pressure.integrity + ' percent and defense is ' + pressure.defense + '. Integrity by round: ' + pressure.history.join(', ') + '.');
  let feedback = 'Start with repair off. Then repeat with it on.';
  if (pressure.round) feedback = 'Last hit: ' + pressure.lastDamage + ' integrity lost. ' + ($('#repair').checked ? 'Feedback is building defense for the next hit.' : 'No feedback. The same weakness keeps costing the system.');
  if (pressure.round === 10) feedback = $('#repair').checked
    ? pressure.integrity + '% integrity remains. Repair stopped repeated damage from this flaw; it did not undo the earlier harm.'
    : pressure.integrity + '% integrity remains. The same problem kept causing damage. Try again with repair enabled.';
  setText('#pressure-feedback', feedback);
  $('#pressure-run').disabled = pressure.round >= 10;
  if (runTimer === null) setText('#pressure-run', pressure.round >= 10 ? 'Test complete ✓' : pressure.round ? 'Continue test →' : 'Run 10 rounds →');
  $('#pressure-step').disabled = pressure.round >= 10 || runTimer !== null;
}
function stepPressure() {
  pressure = pressureStep(pressure, Number($('#pressure').value), $('#repair').checked);
  if (pressure.round >= 10) stopRun();
  renderPressure();
}
function resetPressure() { stopRun(); pressure = newPressure(); renderPressure(); setText('#pressure-run', 'Run 10 rounds →'); }
$('#pressure-step').addEventListener('click', stepPressure);
$('#pressure-reset').addEventListener('click', resetPressure);
$('#pressure').addEventListener('input', resetPressure);
$('#repair').addEventListener('change', resetPressure);
$('#pressure-run').addEventListener('click', () => {
  if (runTimer !== null) { stopRun(); return; }
  if (motionPaused) {
    // Show the complete result without timed animation when motion is off.
    while (pressure.round < 10) stepPressure();
    return;
  }
  runTimer = setInterval(stepPressure, 450);
  setText('#pressure-run', 'Pause test Ⅱ');
  $('#pressure-step').disabled = true;
});
renderPressure();
document.addEventListener('visibilitychange', () => { if (document.hidden) stopRun(); });

const noteKey = 'loophole-margin-note';
$('#reader-note').value = storage.get(noteKey) || '';
$('#reader-note').addEventListener('input', () => {
  const saved = storage.set(noteKey, $('#reader-note').value);
  setText('#save-state', saved ? 'Saved in this browser. Never sent anywhere.' : 'Browser storage unavailable. Export to keep your note.');
});
$('#download-note').addEventListener('click', () => {
  // Export plain text so a visitor's note never becomes executable markup.
  const note = [
    'MIND THE LOOPHOLE — field notes', 'A reflection on A Hacker’s Mind by Bruce Schneier',
    'AIPI 590: Explainable AI', '',
    'Experiments visited: ' + visited.size + '/3 (visited does not mean completed)',
    'Reward experiment: ' + reward.score + ' points; ' + reward.notes + ' new ideas; ' + reward.copies + ' copies; patch ' + (reward.patched ? 'on' : 'off') + '.',
    'Fund experiment: ' + fund.gross + ' claimed; ' + fund.net + ' net gain; ' + fund.eachOther + ' for each other person.',
    'Pressure experiment: ' + pressure.round + ' rounds; ' + pressure.integrity + '% integrity; repair ' + ($('#repair').checked ? 'on' : 'off') + '.',
    '', 'My margin note:', $('#reader-note').value.trim() || '(No margin note added.)',
    '', 'Question: When does a workaround become unfair to other people?',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([note], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'mind-the-loophole-field-notes.txt';
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setText('#save-state', 'Field notes exported. Your browser handles the download.');
});
