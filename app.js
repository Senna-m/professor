// ── Dados dos critérios ──────────────────────────────────────────────────────
const CRITERIOS = [
  {
    id: 'descricao',
    nome: 'Descrição do método',
    hint: 'Explica o que é o método e seu princípio técnico de funcionamento'
  },
  {
    id: 'etapas',
    nome: 'Etapas do procedimento',
    hint: 'Apresenta todas as etapas na sequência correta de execução'
  },
  {
    id: 'clareza',
    nome: 'Clareza na apresentação',
    hint: 'Linguagem clara, objetiva e adequada ao contexto científico'
  },
  {
    id: 'participacao',
    nome: 'Participação do grupo',
    hint: 'Todos os integrantes contribuem ativamente durante a apresentação'
  },
  {
    id: 'dominio',
    nome: 'Domínio do conteúdo',
    hint: 'Demonstra compreensão ao responder perguntas ou detalhar o método'
  }
];

const NOTAS = [
  { val: 0.6, label: '0,6 — Excelente',      cls: 'sel-06' },
  { val: 0.4, label: '0,4 — Satisfatório',   cls: 'sel-04' },
  { val: 0.2, label: '0,2 — Insuficiente',   cls: 'sel-02' },
  { val: 0,   label: '0 — Não apresentou',   cls: 'sel-0'  }
];

// ── Estado inicial ───────────────────────────────────────────────────────────
let grupos = [
  {
    nome: 'Trio 1',
    metodo: 'Método de Hoffman,Pons e Janer',
    membros: 'Ruth',
    notas: {},
    obs: ''
  },
  {
    nome: 'Trio 2',
    metodo: 'Método de Ritchie (MIFC/Blagg)',
    membros: '',
    notas: {},
    obs: ''
  },
  {
    nome: 'Trio 3',
    metodo: 'Método Faust',
    membros: '',
    notas: {},
    obs: ''
  }
];

let grupoAtual = 0;

// ── Utilidades ───────────────────────────────────────────────────────────────
function totalGrupo(g) {
  return CRITERIOS.reduce((soma, c) => soma + (g.notas[c.id] || 0), 0);
}

function faixa(total) {
  if (total >= 2.4) return { txt: 'Excelente', cls: 'faixa-e' };
  if (total >= 1.6) return { txt: 'Satisfatório', cls: 'faixa-s' };
  return { txt: 'Insuficiente', cls: 'faixa-i' };
}

function numBR(n) {
  return n.toFixed(1).replace('.', ',');
}

// ── Navegação entre telas ────────────────────────────────────────────────────
function mostrarTela(id) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.toggle('visible', el.id === id);
  });

  renderSteps(id);
}

function irGrupos() {
  renderGrupos();
  mostrarTela('tela-grupos');
}

// ── Step dots ────────────────────────────────────────────────────────────────
function renderSteps(telaAtiva) {
  const telas = ['tela-grupos', 'tela-avaliacao', 'tela-resultados'];
  const idx = telas.indexOf(telaAtiva);

  document.getElementById('steps').innerHTML = telas.map((_, i) => {
    let cls = 'step-dot';

    if (i === idx) cls += ' active';
    if (i < idx) cls += ' done';

    return `<div class="${cls}"></div>`;
  }).join('');
}

// ── Tela 1: lista de grupos ──────────────────────────────────────────────────
function renderGrupos() {
  const el = document.getElementById('lista-grupos');

  el.innerHTML = grupos.map((g, i) => {
    const tot = totalGrupo(g);
    const qtd = Object.keys(g.notas).length;
    const feito = qtd === CRITERIOS.length;
    const parc = qtd > 0 && !feito;

    let badgeHtml;

    if (feito) {
      badgeHtml = `<span class="badge badge-ok">✓ ${numBR(tot)} pts</span>`;
    } else if (parc) {
      badgeHtml = `<span class="badge badge-pend">Incompleto (${qtd}/${CRITERIOS.length})</span>`;
    } else {
      badgeHtml = `<span class="badge badge-vazio">Não avaliado</span>`;
    }

    return `
      <div class="grupo-card${grupoAtual === i ? ' current' : ''}" onclick="abrirGrupo(${i})">
        <div class="grupo-nome">${g.nome}</div>
        <div class="grupo-metodo">${g.metodo}</div>
        <div class="grupo-status">${badgeHtml}</div>
      </div>`;
  }).join('');

  const btnAntigo = document.getElementById('btn-ver-resultados');

  if (btnAntigo) btnAntigo.remove();

  const todosFeitos = grupos.every(g => Object.keys(g.notas).length === CRITERIOS.length);

  if (todosFeitos) {
    const btn = document.createElement('button');

    btn.id = 'btn-ver-resultados';
    btn.className = 'btn-results';
    btn.textContent = '📊 Ver resultados';
    btn.onclick = verResultados;

    el.after(btn);
  }
}

function addGrupo() {
  const n = grupos.length + 1;

  const nome = prompt('Nome do grupo:', `Trio ${n}`);
  if (!nome?.trim()) return;

  const met = prompt('Método que vão apresentar:', 'Método de Willis');
  if (!met?.trim()) return;

  const membros = prompt(
    'Nome dos integrantes:',
    'Aluno 1, Aluno 2, Aluno 3'
  );

  grupos.push({
    nome: nome.trim(),
    metodo: met.trim(),
    membros: membros ? membros.trim() : '',
    notas: {},
    obs: ''
  });

  renderGrupos();
}

// ── Tela 2: avaliação de um grupo ────────────────────────────────────────────
function abrirGrupo(i) {
  grupoAtual = i;

  const g = grupos[i];

  document.getElementById('av-nome').textContent = g.nome;
  document.getElementById('av-metodo').textContent = g.metodo;

  document.getElementById('av-membros').textContent =
    g.membros || '';

  document.getElementById('obs-input').value = g.obs || '';

  renderCriterios();
  calcTotal();
  mostrarTela('tela-avaliacao');
}

function renderCriterios() {
  const g = grupos[grupoAtual];

  document.getElementById('criterios-lista').innerHTML = CRITERIOS.map(c => `
    <div class="criterio-bloco" id="bloco-${c.id}">
      <div class="criterio-label">${c.nome}</div>
      <div class="criterio-hint">${c.hint}</div>

      <div class="botoes-nota">
        ${NOTAS.map(n => {
          const selecionado = g.notas[c.id] === n.val ? ` ${n.cls}` : '';

          return `<button class="btn-nota${selecionado}"
                    onclick="setNota('${c.id}', ${n.val}, '${n.cls}', this)">
                    ${n.label}
                  </button>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function setNota(cid, val, cls, btn) {
  grupos[grupoAtual].notas[cid] = val;

  btn.closest('.botoes-nota')
    .querySelectorAll('.btn-nota')
    .forEach(b => {
      b.className = 'btn-nota';
    });

  btn.className = `btn-nota ${cls}`;

  calcTotal();
}

function calcTotal() {
  const t = totalGrupo(grupos[grupoAtual]);
  document.getElementById('av-total').textContent = numBR(t);
}

function salvarGrupo() {
  grupos[grupoAtual].obs = document.getElementById('obs-input').value;
  irGrupos();
}

// ── Tela 3: resultados ───────────────────────────────────────────────────────
function verResultados() {
  const el = document.getElementById('resultados-lista');

  el.innerHTML = grupos.map(g => {
    const tot = totalGrupo(g);
    const f = faixa(tot);

    const detalhes = CRITERIOS.map(c =>
      `<span class="badge badge-vazio" style="font-size:11px">
         ${c.nome.split(' ')[0]}: ${numBR(g.notas[c.id] || 0)}
       </span>`
    ).join('');

    const obsHtml = g.obs
      ? `<div class="result-obs">${g.obs}</div>`
      : '';

    return `
      <div class="result-card">
        <div class="result-header">
          <div>
            <div class="result-nome">${g.nome}</div>
            <div class="result-met">${g.metodo}</div>
            <div class="result-faixa ${f.cls}">${f.txt}</div>
          </div>

          <div class="result-nota">${numBR(tot)}<span>/3,0</span></div>
        </div>

        <div class="result-detalhe">${detalhes}</div>
        ${obsHtml}
      </div>`;
  }).join('');

  mostrarTela('tela-resultados');
}

function exportar() {
  const linhas = grupos.map(g => {
    const tot = totalGrupo(g);
    const f = faixa(tot);

    const det = CRITERIOS.map(c =>
      `${c.nome}: ${numBR(g.notas[c.id] || 0)}`
    ).join(' | ');

    let linha = `${g.nome} — ${g.metodo}\nNota: ${numBR(tot)}/3,0 (${f.txt})\n${det}`;

    if (g.obs) linha += `\nObs: ${g.obs}`;

    return linha;
  });

  const texto = linhas.join('\n\n─────────────────────\n\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto)
      .then(() => alert('Resultado copiado para a área de transferência!'))
      .catch(() => fallbackCopiar(texto));
  } else {
    fallbackCopiar(texto);
  }
}

function fallbackCopiar(texto) {
  const ta = document.createElement('textarea');

  ta.value = texto;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';

  document.body.appendChild(ta);

  ta.select();
  document.execCommand('copy');

  document.body.removeChild(ta);

  alert('Resultado copiado!');
}

// ── Init ─────────────────────────────────────────────────────────────────────
renderGrupos();
renderSteps('tela-grupos');
