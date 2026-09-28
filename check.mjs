import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs duplicados');
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), `Âncora ausente: ${target}`);
assert.equal((html.match(/<details class="day"/g) || []).length, 5);
assert.equal((html.match(/class="panel"/g) || []).length, 7);
const keys = [...html.matchAll(/data-check="([^"]+)"/g)].map(match => match[1]);
assert.equal(keys.length, 12);
assert.equal(new Set(keys).size, keys.length, 'Chaves do checklist duplicadas');
assert(!/9875622342|JANAINA MARTINS|LUIS TEIXEIRA|codex-clipboard|MYTTTV|Navigo/i.test(html), 'Dados privados ou conteúdo da viagem anterior');
assert(html.includes('2026, 9, 15') && html.includes('2026, 9, 19'));
assert.equal([4800, 2200, 800, 1200, 400, 250].reduce((a, b) => a + b), 9650);
assert.equal([8000, 3600, 1400, 2200, 800, 500].reduce((a, b) => a + b), 16500);
const script = new Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
function runGuide(initialStorage = '{}', unavailableStorage = false) {
  const element = props => ({ hidden: false, open: false, checked: false, listeners: {},
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; },
    scrollIntoView() {}, classList: { remove() {} }, ...props });
  const elements = Object.fromEntries(ids.map(id => [id, element({ id })]));
  const panels = [...html.matchAll(/class="panel" id="([^"]+)"/g)].map(([, id]) => elements[id]);
  const links = panels.map(panel => element({ hash: '#' + panel.id }));
  const days = [...html.matchAll(/<details class="day"[^>]*>([\s\S]*?)<\/details>/g)].map(([, text]) => element({ textContent: text.replace(/<[^>]*>/g, ' ') }));
  const checks = keys.map(key => element({ dataset: { check: key } }));
  const events = {};
  let storage = initialStorage;
  const location = { hash: '', href: 'https://example.test/' };
  script.runInNewContext({ console, Intl, Date, location, navigator: {},
    history: { pushState(_state, _title, hash) { location.hash = hash; } },
    window: { addEventListener(name, fn) { events[name] = fn; }, print() {} },
    document: { title: 'Buenos Aires', getElementById(id) { return elements[id]; },
      querySelectorAll(selector) { return ({ '.panel': panels, '.nav-links a': links, 'a[href^="#"]': links, '.day': days, '[data-check]': checks })[selector]; } },
    localStorage: { getItem() { if (unavailableStorage) throw Error('blocked'); return storage; }, setItem(_key, value) { if (unavailableStorage) throw Error('blocked'); storage = value; } }
  });
  return { elements, panels, links, days, checks, events, location, storage: () => storage };
}
const app = runGuide();
assert.equal(app.panels.filter(panel => !panel.hidden).length, 1);
app.links[5].listeners.click({ preventDefault() {} });
assert.equal(app.location.hash, '#checklist');
assert.equal(app.elements.checklist.hidden, false);
assert.equal(app.elements.roteiro.hidden, true);
app.elements.search.listeners.input({ target: { value: 'colon' } });
assert.equal(app.days.filter(day => !day.hidden).length, 1, 'Busca sem acento deve encontrar Colón');
assert(app.days.find(day => !day.hidden).open);
app.elements.search.listeners.input({ target: { value: 'zzzinexistente' } });
assert.equal(app.elements['no-results'].hidden, false);
app.elements.search.listeners.input({ target: { value: '' } });
assert.equal(app.days.filter(day => !day.hidden).length, 5);
app.elements.collapse.listeners.click();
assert(app.days.every(day => !day.open));
app.elements.expand.listeners.click();
assert(app.days.every(day => day.open));
app.checks[1].checked = true;
app.checks[1].listeners.change();
assert.equal(app.elements.progress.value, 1);
assert.equal(runGuide(app.storage()).checks[1].checked, true, 'Restaurar checklist');
assert.equal(runGuide('{invalid').elements.progress.value, 0, 'JSON corrompido não quebra a página');
const blocked = runGuide('{}', true);
blocked.checks[0].checked = true;
blocked.checks[0].listeners.change();
assert.equal(blocked.elements.progress.value, 1, 'Checklist funciona com armazenamento bloqueado');
assert(blocked.elements['storage-status'].textContent.includes('não permitiu'));
app.elements.collapse.listeners.click();
app.events.beforeprint();
assert(app.days.every(day => day.open));
app.events.afterprint();
assert(app.days.every(day => !day.open));
console.log('OK: estrutura, privacidade, navegação, busca com acentos, checklist persistente, armazenamento indisponível e impressão.');
