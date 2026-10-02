import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs duplicados');
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), `Âncora ausente: ${target}`);
assert.equal((html.match(/<details class="day"/g) || []).length, 5);
assert.equal((html.match(/class="panel"/g) || []).length, 8);
const keys = [...html.matchAll(/data-check="([^"]+)"/g)].map(match => match[1]);
assert.equal(keys.length, 39);
assert.equal(new Set(keys).size, keys.length, 'Chaves do checklist duplicadas');
const published = [...html.matchAll(/<input type="checkbox"([^>]+)>/g)].map(([, attributes]) => Object.fromEntries([...attributes.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
const confirmedCount = published.filter(item => item.confirmed === 'true').length;
assert.equal(confirmedCount, 23);
assert.equal(published.find(item => item.check === 'insurance').confirmed, 'true');
assert.equal(published.find(item => item.check === 'insurance').revision, '3');
const pdfLinks = [...new Set([...html.matchAll(/href="(comprovantes\/[^"#]+\.pdf)"/g)].map(match => match[1]))];
assert.equal(pdfLinks.length, 12, 'Disponibilizar todos os comprovantes reunidos');
for (const path of pdfLinks) assert.equal(readFileSync(new URL('./' + path, import.meta.url)).subarray(0, 5).toString(), '%PDF-', 'Link deve apontar para um PDF válido: ' + path);
assert.equal(readFileSync(new URL('./comprovantes/todos-comprovantes.zip', import.meta.url)).subarray(0, 2).toString(), 'PK');
assert.equal(published.find(item => item.check === 'offline').status, 'Pendente', 'Preparação offline continua pendente até ser feita nos aparelhos');
assert.equal(published.find(item => item.check === 'offline').revision, '2', 'Reabrir a etapa invalida marcações antigas');
assert(html.includes('id="prepare-offline"') && html.includes('id="offline-status"'), 'Incluir botão e retorno acessível para preparar o celular');
assert(html.includes('no mesmo navegador') && html.includes('aba anônima'), 'Explicar onde a cópia offline fica disponível');
assert(!/\b\d{13}\b/.test(html.replaceAll('https://wa.me/5491168754000', '').replaceAll('https://wa.me/5491130698361', '')), 'Não publicar localizador de reserva; WhatsApps oficiais dos restaurantes são permitidos');
for (const key of ['hotel', 'hotel-choice', 'tango', 'tango-choice', 'tango-transfer', 'flight-review', 'flight-prevention', 'baggage-allowance', 'transport', 'brazil-transfer', 'parrilla', 'payments', 'sunday']) assert.equal(published.find(item => item.check === key).confirmed, 'true');
assert.equal(published.find(item => item.check === 'transport').revision, '2', 'Atualizar a decisão invalida marcações locais antigas');
assert(html.includes('uma mala grande e duas pequenas') && html.includes('Uber convencional'), 'Registrar bagagem e transporte informados pelo viajante');
assert(!html.includes('quatro malas grandes'), 'Remover orientação de categoria maior baseada em bagagem antiga');
assert(html.includes('Abrir passe Indigo (sem senha)'), 'Instrução do passe deve corresponder ao acesso aberto');
for (const key of ['seats']) assert.notEqual(published.find(item => item.check === key).confirmed, 'true', 'Cotação não confirma reserva');
for (const key of ['documents', 'hotel', 'parrilla', 'sunday', 'colon', 'tango', 'insurance', 'transport', 'internet', 'reconfirm', 'outbound', 'inbound']) assert(keys.includes(key), 'Preservar chaves do checklist anterior');
assert(!/9875622342|JANAINA MARTINS|LUIS TEIXEIRA|codex-clipboard|MYTTTV|Navigo/i.test(html), 'Dados privados ou conteúdo da viagem anterior');
assert(html.includes('2026, 9, 15') && html.includes('2026, 9, 19'));
assert(!/Loi Suites|ARC Recoleta|Palladio|MIO sem|Alternativa consultada|hipótese de R\$/i.test(html), 'Retirar hotéis descartados e orçamento hipotético');
assert(html.includes('R$ 2.834,64') && html.includes('R$ 2.896,81'), 'Usar os valores efetivos do comprovante do hotel');
const script = new Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
function runGuide(initialStorage = '{}', unavailableStorage = false, revisions = {}) {
  const element = props => ({ hidden: false, open: false, checked: false, listeners: {},
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; },
    scrollIntoView() {}, classList: { remove() {} }, ...props });
  const elements = Object.fromEntries(ids.map(id => [id, element({ id })]));
  const panels = [...html.matchAll(/class="panel" id="([^"]+)"/g)].map(([, id]) => elements[id]);
  const links = [...html.match(/<nav class="nav-links"[^>]*>([\s\S]*?)<\/nav>/)[1].matchAll(/href="([^"]+)"/g)].map(([, hash]) => element({ hash }));
  const anchorLinks = [...html.matchAll(/<a[^>]*href="(#[^"]+)"[^>]*>/g)].map(([, hash]) => links.find(link => link.hash === hash) || element({ hash }));
  const days = [...html.matchAll(/<details class="day"([^>]*)>([\s\S]*?)<\/details>/g)].map(([, attributes, text]) => {
    const id = attributes.match(/id="([^"]+)"/)[1];
    return Object.assign(elements[id], { textContent: text.replace(/<[^>]*>/g, ' ') });
  });
  const checks = published.map(item => element({ dataset: { ...item, revision: revisions[item.check] || item.revision } }));
  const events = {};
  let storage = initialStorage;
  const location = { hash: '', href: 'https://example.test/' };
  script.runInNewContext({ console, Intl, Date, location, navigator: {},
    history: { pushState(_state, _title, hash) { location.hash = hash; } },
    window: { addEventListener(name, fn) { events[name] = fn; }, print() {} },
    document: { title: 'Buenos Aires', getElementById(id) { return elements[id]; },
      querySelectorAll(selector) { return ({ '.panel': panels, '.nav-links a': links, 'a[href^="#"]': anchorLinks, '.day': days, 'details': days, '[data-check]': checks })[selector]; } },
    localStorage: { getItem() { if (unavailableStorage) throw Error('blocked'); return storage; }, setItem(_key, value) { if (unavailableStorage) throw Error('blocked'); storage = value; } }
  });
  return { elements, panels, links, anchorLinks, days, checks, events, location, storage: () => storage };
}
const app = runGuide();
assert(runGuide('{"insurance":false}').checks.find(check => check.dataset.check === 'insurance').checked && app.checks.find(check => check.dataset.check === 'insurance').disabled, 'Seguro emitido permanece confirmado em todos os aparelhos');
assert.equal(published.find(item => item.check === 'colon').revision, '2');
assert(runGuide('{"colon":false}').checks.find(check => check.dataset.check === 'colon').checked && app.checks.find(check => check.dataset.check === 'colon').disabled, 'Decisão de comprar na bilheteria permanece concluída em todos os aparelhos');
assert(html.includes('Compra do Teatro Colón definida: na bilheteria') && html.includes('Nenhum ingresso comprado; horário sujeito a vagas.'), 'Decisão confirmada não significa ingresso comprado');
assert(runGuide('{"parrilla":false}').checks.find(check => check.dataset.check === 'parrilla').checked && app.checks.find(check => check.dataset.check === 'parrilla').disabled, 'Reserva confirmada permanece concluída e bloqueada apesar de marcação local antiga');
assert(runGuide('{"sunday":false}').checks.find(check => check.dataset.check === 'sunday').checked && app.checks.find(check => check.dataset.check === 'sunday').disabled, 'La Brigada confirmado prevalece sobre marcações locais antigas');
assert.equal(app.checks.find(check => check.dataset.check === 'transport').disabled, true, 'Transporte confirmado aparece como concluído no guia');
assert.equal(app.panels.filter(panel => !panel.hidden).length, 1);
assert.equal(app.links.length, 5, 'Cinco atalhos principais para o celular');
app.links.find(link => link.hash === '#checklist').listeners.click({ preventDefault() {} });
assert.equal(app.location.hash, '#checklist');
assert.equal(app.elements.checklist.hidden, false);
assert.equal(app.elements.roteiro.hidden, true);
app.anchorLinks.find(link => link.hash === '#dia-18').listeners.click({ preventDefault() {} });
assert.equal(app.elements.roteiro.hidden, false, 'Atalho do dia deve exibir o roteiro');
assert.equal(app.elements['dia-18'].open, true, 'Atalho deve abrir o dia escolhido');
app.anchorLinks.find(link => link.hash === '#jantar-chegada').listeners.click({ preventDefault() {} });
assert.equal(app.elements.sabores.hidden, false, 'Link interno deve mostrar a seção de refeições');
assert.equal(app.links.find(link => link.hash === '#hoteis')['aria-current'], 'true');
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
const pendingCheck = app.checks.find(check => check.dataset.check === 'offline');
pendingCheck.checked = true;
pendingCheck.listeners.change();
assert.equal(app.elements.progress.value, confirmedCount + 1);
assert.equal(app.elements['remaining-text'].textContent, '15 tarefas em aberto');
assert.equal(runGuide(app.storage()).checks.find(check => check.dataset.check === 'offline').checked, true, 'Restaurar marcação local');
assert.equal(app.elements['state-offline'].textContent, 'Marcado neste aparelho');
assert.equal(runGuide().checks.find(check => check.dataset.check === 'offline').checked, false, 'Marcação local não vira reserva publicada');
const legacy = runGuide('{"offline":true,"dates":false}');
assert.equal(legacy.checks.find(check => check.dataset.check === 'offline').checked, false, 'Revisão invalida marcação legada de etapa concluída');
assert.equal(legacy.checks.find(check => check.dataset.check === 'dates').checked, true, 'Estado local antigo não apaga confirmação nova');
assert.equal(legacy.checks.find(check => check.dataset.check === 'dates').disabled, true);
assert.equal(runGuide('{"offline":true}').checks.find(check => check.dataset.check === 'offline').checked, false, 'Revisão nova reabre o preparo offline');
assert.equal(runGuide(app.storage(), false, { offline: '3' }).checks.find(check => check.dataset.check === 'offline').checked, false, 'Reabrir etapa invalida marcação de versão anterior');
assert.equal(runGuide('{"offline":true}', false, { offline: '3' }).checks.find(check => check.dataset.check === 'offline').checked, false, 'Marcações legadas não fecham etapas reabertas');
pendingCheck.checked = false;
pendingCheck.listeners.change();
assert.equal(app.elements['state-offline'].textContent, 'Pendente');
assert.equal(runGuide('{invalid').elements.progress.value, confirmedCount, 'JSON corrompido não esconde confirmações');
const blocked = runGuide('{}', true);
const blockedCheck = blocked.checks.find(check => check.dataset.check === 'offline');
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
