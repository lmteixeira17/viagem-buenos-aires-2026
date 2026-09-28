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
assert.equal(keys.length, 38);
assert.equal(new Set(keys).size, keys.length, 'Chaves do checklist duplicadas');
const published = [...html.matchAll(/<input type="checkbox"([^>]+)>/g)].map(([, attributes]) => Object.fromEntries([...attributes.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
const confirmedCount = published.filter(item => item.confirmed === 'true').length;
assert.equal(confirmedCount, 12);
assert(!/\b\d{13}\b/.test(html), 'Não publicar localizador de reserva');
for (const key of ['hotel', 'hotel-choice', 'tango', 'tango-choice', 'flight-review', 'baggage-allowance']) assert.equal(published.find(item => item.check === key).confirmed, 'true');
for (const key of ['parrilla', 'sunday', 'colon', 'tango-transfer', 'flight-prevention', 'seats']) assert.notEqual(published.find(item => item.check === key).confirmed, 'true', 'Cotação não confirma reserva');
for (const key of ['documents', 'hotel', 'parrilla', 'sunday', 'colon', 'tango', 'insurance', 'transport', 'internet', 'reconfirm', 'outbound', 'inbound']) assert(keys.includes(key), 'Preservar chaves do checklist anterior');
assert(!/9875622342|JANAINA MARTINS|LUIS TEIXEIRA|codex-clipboard|MYTTTV|Navigo/i.test(html), 'Dados privados ou conteúdo da viagem anterior');
assert(html.includes('2026, 9, 15') && html.includes('2026, 9, 19'));
assert.equal([4800, 2200, 800, 1200, 400, 250].reduce((a, b) => a + b), 9650);
assert.equal([8000, 3600, 1400, 2200, 800, 500].reduce((a, b) => a + b), 16500);
const script = new Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
function runGuide(initialStorage = '{}', unavailableStorage = false, revisions = {}) {
  const element = props => ({ hidden: false, open: false, checked: false, listeners: {},
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; },
    scrollIntoView() {}, classList: { remove() {} }, ...props });
  const elements = Object.fromEntries(ids.map(id => [id, element({ id })]));
  const panels = [...html.matchAll(/class="panel" id="([^"]+)"/g)].map(([, id]) => elements[id]);
  const links = panels.map(panel => element({ hash: '#' + panel.id }));
  const days = [...html.matchAll(/<details class="day"[^>]*>([\s\S]*?)<\/details>/g)].map(([, text]) => element({ textContent: text.replace(/<[^>]*>/g, ' ') }));
  const checks = published.map(item => element({ dataset: { ...item, revision: revisions[item.check] || item.revision } }));
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
assert.equal(app.elements.progress.value, confirmedCount, 'Confirmações publicadas aparecem em navegador novo');
const pendingCheck = app.checks.find(check => check.dataset.check === 'parrilla');
pendingCheck.checked = true;
pendingCheck.listeners.change();
assert.equal(app.elements.progress.value, confirmedCount + 1);
assert.equal(runGuide(app.storage()).checks.find(check => check.dataset.check === 'parrilla').checked, true, 'Restaurar marcação local');
assert.equal(app.elements['state-parrilla'].textContent, 'Marcado neste aparelho');
assert.equal(runGuide().checks.find(check => check.dataset.check === 'parrilla').checked, false, 'Marcação local não vira reserva publicada');
const legacy = runGuide('{"parrilla":true,"dates":false}');
assert.equal(legacy.checks.find(check => check.dataset.check === 'parrilla').checked, true, 'Preservar marcação antiga');
assert.equal(legacy.checks.find(check => check.dataset.check === 'dates').checked, true, 'Estado local antigo não apaga confirmação nova');
assert.equal(legacy.checks.find(check => check.dataset.check === 'dates').disabled, true);
assert.equal(runGuide(app.storage(), false, { parrilla: '2' }).checks.find(check => check.dataset.check === 'parrilla').checked, false, 'Reabrir etapa invalida marcação de versão anterior');
assert.equal(runGuide('{"parrilla":true}', false, { parrilla: '2' }).checks.find(check => check.dataset.check === 'parrilla').checked, false, 'Marcações legadas não fecham etapas reabertas');
pendingCheck.checked = false;
pendingCheck.listeners.change();
assert.equal(app.elements['state-parrilla'].textContent, 'A reservar');
assert.equal(runGuide('{invalid').elements.progress.value, confirmedCount, 'JSON corrompido não esconde confirmações');
const blocked = runGuide('{}', true);
const blockedCheck = blocked.checks.find(check => check.dataset.check === 'parrilla');
blockedCheck.checked = true;
blockedCheck.listeners.change();
assert.equal(blocked.elements.progress.value, confirmedCount + 1, 'Checklist funciona com armazenamento bloqueado');
assert(blocked.elements['storage-status'].textContent.includes('não permitiu'));
app.elements.collapse.listeners.click();
app.events.beforeprint();
assert(app.days.every(day => day.open));
app.events.afterprint();
assert(app.days.every(day => !day.open));
console.log('OK: estrutura, privacidade, navegação, busca, confirmações publicadas, migração local, reabertura de etapas, persistência, armazenamento indisponível e impressão.');
