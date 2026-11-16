# Validation notes

Checked in a desktop browser and with Node.js 24.22.1.

## Automated checks

Run `node --test`. The suite has 15 passing tests covering:

- The 100-point copy exploit, maximum real learning, and the scoring patch.
- Invalid moves and every reachable reward strategy within six energy units.
- Account affordability, setup costs, and conservation of the shared fund.
- The person-based cap, including the cost of now-useless extra accounts.
- Repeated damage, the timing of repair, and integrity bounds at all ten pressure settings.
- JavaScript syntax, DOM hook consistency, internal links, and public assets.

`node scripts/build.mjs` produces the five expected public files in `dist/`.

## Browser checks performed

- Exploit: one original note plus four copies yields 100 points and one understanding unit.
- Scoring patch: copying adds zero points after the patch.
- Resources: five accounts claim 100 credits, cost 20, and leave zero for the other people.
- Fund patch: the same accounts claim 20, net zero after setup costs, and leave 20 for each other person.
- Pressure 6 without repair: 0% integrity after ten rounds.
- Pressure 6 with repair: first hit leaves 88%; the run finishes at 82%.
- Keyboard Home on the tab list selects the first experiment; Enter activates controls.
- The motion pause setting runs a complete simulation without timed steps.
- A margin note survives reload, exports to a readable text file, and can be cleared.
- Layout inspected at desktop size and narrow 390px and 320px viewports; no horizontal page overflow.
- Browser error/warning log was empty during the checks.



## Limits

GitHub Pages hosting is optional. The project runs locally without a deployment. Mobile checks use a browser viewport, not physical phones. Print and OS-level reduced-motion styles are included; a printed/PDF output and operating-system preference change were not separately tested. The model outcomes demonstrate their assumptions, not real-world predictive validity.
