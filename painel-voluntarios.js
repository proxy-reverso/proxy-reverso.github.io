// Painel: fila de inscrições da equipe de dados (/api/voluntarios). Usa o mesmo código do painel (variável `codigo`
// do script principal). Só muda o status na fila: quem manda a ficha e abre acesso é a coordenação, pelo contato da pessoa.
(function () {
  const box = document.getElementById("vol"), resumo = document.getElementById("vol-resumo");
  if (!box) return;
  const ROTULO = { novo: "Novos", conversa: "Em conversa", nivel1: "Nível 1", nivel2: "Nível 2", recusado: "Recusados" };
  const ACAO = { conversa: "Chamar para conversa", nivel1: "Liberar nível 1", nivel2: "Liberar nível 2", recusado: "Recusar", novo: "Voltar para novos" };
  const HAB = { python: "programa", sql: "SQL", redes: "redes sociais", checagem: "checagem", jornalismo: "jornalismo", geo: "mapas", curadoria: "curadoria", juridico: "jurídico", outro: "outro",
    iniciante: "começando agora", planilha: "planilhas", escrita: "escrita", design: "design" };
  const FUNC = { liderar: "coordenar um grupinho", triagem: "receber quem chega", revisao: "revisar e checar", comunicacao: "comunicação", curadoria: "curadoria de vídeos", codigo: "programar (site ou bot)",
    cidades: "conferir informações por cidade", leitura: "ficar de olho nos painéis", checagem: "conferir fonte", videos: "escolher vídeos", textos: "escrever ou revisar textos",
    divulgar: "divulgar", mapas: "mapas e dados por cidade", acolher: "receber quem chega", qualquer: "onde precisar",
    pesquisa: "pesquisar e conferir", conteudo: "criar conteúdo", organizar: "organizar" };
  const HORAS = { ate5: "algumas h/sem", "5a10": "5 a 10 h/sem", "10a20": "10 a 20 h/sem", mais20: "+20 h/sem" };
  // número para o wa.me: só dígitos, com 55 na frente quando a pessoa não pôs
  const wa = t => { const d = String(t || "").replace(/\D/g, ""); return d.length <= 11 ? "55" + d : d; };
  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cod = () => (typeof codigo !== "undefined" && codigo) || (() => { try { return localStorage.getItem("painel-codigo") || ""; } catch { return ""; } })();
  let itens = [], aba = "novo";

  const st = document.createElement("style");
  st.textContent = `.vol-abas{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.vol-abas button{background:transparent;color:var(--creme);border:1px solid var(--linha);border-radius:999px;padding:6px 10px;cursor:pointer;font:600 13px/1 var(--f-corpo)}
.vol-abas button[aria-pressed=true]{background:var(--amarelo);color:#140B0B;border-color:var(--amarelo)}
.vol-i{border-top:1px solid var(--linha);padding:10px 0;display:grid;gap:6px}.vol-i:first-child{border-top:0}
.vol-i h3{margin:0;font:700 16px/1.2 var(--f-corpo)}.vol-i small{color:var(--creme-3)}.vol-i p{margin:0;overflow-wrap:anywhere}
.vol-ind{color:var(--amarelo);font-weight:700}.vol-acoes{display:flex;flex-wrap:wrap;gap:6px}
.vol-acoes button{background:transparent;color:var(--creme);border:1px solid var(--linha);border-radius:6px;padding:6px 10px;cursor:pointer;font:600 13px/1 var(--f-corpo)}
.vol-acoes button.at{border-color:var(--amarelo);color:var(--amarelo)}.vol-acoes button:disabled{opacity:.5;cursor:default}`;
  document.head.appendChild(st);

  function desenha() {
    const n = s => itens.filter(i => i.status === s).length;
    resumo.textContent = itens.length ? `${itens.length} inscrições · ${n("novo")} novas` : "";
    const lista = itens.filter(i => i.status === aba);
    box.innerHTML = `<div class="vol-abas" role="group" aria-label="Filtrar">${Object.keys(ROTULO).map(s => `<button type="button" data-aba="${s}" aria-pressed="${s === aba}">${ROTULO[s]} · ${n(s)}</button>`).join("")}</div>` +
      (lista.length ? lista.map(i => `<div class="vol-i" data-id="${esc(i.id)}">
        <h3>${esc(i.apelido)} <small>· ${new Date(i.criado).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</small></h3>
        ${i.indicacao ? `<p class="vol-ind">Indicação: ${esc(i.indicacao)}</p>` : `<p><small>Sem indicação</small></p>`}
        <p>${esc(i.contato_tipo)}: <b>${esc(i.contato)}</b> <button type="button" class="btn sec" data-copia="${esc(i.contato)}" style="padding:3px 8px;font-size:12px">copiar</button>${i.contato_tipo === "whatsapp" && /^\d{10,13}$/.test(wa(i.contato)) ? ` <a href="https://wa.me/${wa(i.contato)}" target="_blank" rel="noopener noreferrer">abrir no WhatsApp</a>` : ""}</p>
        <p><small>${[(i.habilidades || "").split(",").filter(Boolean).map(h => HAB[h] || h).join(" · "),
          i.investigacao ? "investigações " + esc(i.investigacao.replace("qualquer", "onde precisar").split(",").join(", ")) : "",
          HORAS[i.horas] || ""].filter(Boolean).join(" · ")}</small></p>
        ${i.funcoes ? `<p>Também topa: ${i.funcoes.split(",").map(f => FUNC[f] || esc(f)).join(", ")}</p>` : ""}
        ${i.ideia ? `<p><b>Ideia:</b> ${esc(i.ideia)}</p>` : ""}
        ${i.github ? `<p>GitHub: <a href="https://github.com/${esc(i.github)}" target="_blank" rel="noopener noreferrer">@${esc(i.github)}</a></p>` : ""}
        ${i.link ? `<p><a href="${esc(i.link)}" target="_blank" rel="noopener noreferrer">${esc(i.link)}</a></p>` : ""}
        ${i.motivo ? `<p>“${esc(i.motivo)}”</p>` : ""}
        <div class="vol-acoes">${["conversa", "nivel1", "nivel2", "recusado", "novo"].map(s => `<button type="button" data-st="${s}" class="${i.status === s ? "at" : ""}"${i.status === s ? " disabled" : ""}>${ACAO[s]}</button>`).join("")}</div>
      </div>`).join("") : `<p class="vazio">Nada aqui.</p>`);
  }

  async function carrega() {
    if (!cod()) return;
    try {
      const r = await fetch("/api/voluntarios", { headers: { "X-Painel": cod() }, cache: "no-store" });
      if (!r.ok) { box.innerHTML = `<p class="vazio">Não foi possível ler as inscrições (${r.status}).</p>`; return; }
      const j = await r.json(); itens = j.itens || []; desenha();
      if (j.aviso) box.insertAdjacentHTML("afterbegin", `<p class="vazio">${esc(j.aviso)}</p>`);
    } catch { box.innerHTML = `<p class="vazio">Não foi possível ler as inscrições agora.</p>`; }
  }

  box.addEventListener("click", async ev => {
    const b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.aba) { aba = b.dataset.aba; desenha(); return; }
    if (b.dataset.copia) { navigator.clipboard?.writeText(b.dataset.copia).then(() => { b.textContent = "copiado"; }).catch(() => {}); return; }
    if (b.dataset.st) {
      const bruto = b.closest(".vol-i").dataset.id, id = /^\d+$/.test(bruto) ? Number(bruto) : bruto, status = b.dataset.st;
      b.disabled = true;
      const r = await fetch("/api/voluntarios", { method: "PATCH", headers: { "Content-Type": "application/json", "X-Painel": cod() }, body: JSON.stringify({ id, status }) }).catch(() => null);
      if (r && r.ok) { const it = itens.find(i => String(i.id) === String(id)); if (it) it.status = status; desenha(); }
      else { b.disabled = false; b.textContent = "falhou, tente de novo"; }
    }
  });

  // carrega quando o painel abre (depois do código) e a cada clique em Atualizar
  const painel = document.getElementById("painel");
  new MutationObserver(() => { if (!painel.hidden) carrega(); }).observe(painel, { attributes: true, attributeFilter: ["hidden"] });
  document.getElementById("atualizar")?.addEventListener("click", carrega);
  if (!painel.hidden) carrega();
})();
