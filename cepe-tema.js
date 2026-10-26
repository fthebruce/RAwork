/* =====================================================================
   TEMA CEPE (padrão AXON) — comportamento da tela, sem dependências.
   Uso: incluir cepe-tema.js no fim do <body> (tag script com src).

   Automático:
     - botão ☰ ([data-cepe-alternar]): recolhe o menu (lembra a escolha);
       no celular abre/fecha a gaveta;
     - menus suspensos do topo ([data-cepe-suspenso]);
     - UM PASSO POR VEZ: com 2 ou mais <section class="cepe-passo" id="...">,
       a tela mostra só o passo do endereço (#id); âncoras internas abrem o
       passo que as contém; botões "← anterior / próximo →" no fim de cada
       passo; o item do menu com href="#id" fica marcado.

   Funções (window.CEPE):
     CEPE.toast("Gravado com sucesso.")          aviso rápido no alto (× fecha)
     CEPE.toast("Não foi possível…", "erro")
     CEPE.janela({titulo, texto, icone, botoes:[{rotulo, valor, classe}]})
         -> Promise com o valor do botão escolhido (Esc = null)
     const c = CEPE.carregando("Lendo o modelo", "arquivo.ifc · 38 MB")
         c.progresso(40, "Lendo as entidades…"); c.concluir(); c.erro("…"); c.fechar()
   ===================================================================== */
(function () {
  "use strict";
  var CEPE = window.CEPE = window.CEPE || {};

  /* ícones (SVG em linha, funcionam sem internet): usados com
     <svg class="cepe-ico"><use href="#i-NOME"/></svg>. Se a página não trouxer
     os símbolos, eles são incluídos aqui. */
  var ICONES = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol><symbol id="i-casa" viewBox="0 0 24 24"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></symbol><symbol id="i-cubo" viewBox="0 0 24 24"><path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/></symbol><symbol id="i-lista" viewBox="0 0 24 24"><path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/></symbol><symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h6"/></symbol><symbol id="i-docs" viewBox="0 0 24 24"><path d="M8 3h8l4 4v12H8z"/><path d="M16 3v4h4M4 7v14h12"/></symbol><symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></symbol><symbol id="i-base" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></symbol><symbol id="i-caixa" viewBox="0 0 24 24"><path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/></symbol><symbol id="i-pasta" viewBox="0 0 24 24"><path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></symbol><symbol id="i-pessoas" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2.4.6 4 2.3 4 5.4"/></symbol><symbol id="i-usuario" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></symbol><symbol id="i-chave" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/></symbol><symbol id="i-engrenagem" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></symbol><symbol id="i-sino" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/></symbol><symbol id="i-baixar" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></symbol><symbol id="i-enviar" viewBox="0 0 24 24"><path d="M12 21V9M7 14l5-5 5 5M4 4h16"/></symbol><symbol id="i-entrar" viewBox="0 0 24 24"><path d="M15 4h4v16h-4M10 8l4 4-4 4M14 12H3"/></symbol><symbol id="i-sair" viewBox="0 0 24 24"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/></symbol><symbol id="i-codigo" viewBox="0 0 24 24"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></symbol><symbol id="i-seta" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol><symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></symbol><symbol id="i-alerta" viewBox="0 0 24 24"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></symbol><symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></symbol><symbol id="i-relogio" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol><symbol id="i-mais" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol><symbol id="i-busca" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol><symbol id="i-editar" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/></symbol><symbol id="i-lixo" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></symbol></svg>';
  if (!document.getElementById("i-menu")) {
    var caixaIcones = document.createElement("div");
    caixaIcones.innerHTML = ICONES;
    document.body.insertBefore(caixaIcones.firstChild, document.body.firstChild);
  }

  function el(tag, classe, html) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function ico(nome) {
    return '<svg class="cepe-ico" aria-hidden="true"><use href="#i-' + nome + '"/></svg>';
  }

  /* ---------------- menu lateral: recolher / gaveta no celular ---------------- */
  var corpo = document.querySelector(".cepe-corpo");
  var celular = window.matchMedia("(max-width: 991px)");
  var CHAVE = "cepe-menu-recolhido";
  if (corpo) {
    try { if (localStorage.getItem(CHAVE) === "1") corpo.classList.add("cepe-recolhido"); } catch (e) {}
    document.querySelectorAll("[data-cepe-alternar]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (celular.matches) { corpo.classList.toggle("cepe-aberto-mobile"); return; }
        var r = corpo.classList.toggle("cepe-recolhido");
        try { localStorage.setItem(CHAVE, r ? "1" : "0"); } catch (e) {}
      });
    });
    var fundo = corpo.querySelector(".cepe-fundo-escuro");
    if (fundo) fundo.addEventListener("click", function () { corpo.classList.remove("cepe-aberto-mobile"); });
  }

  /* ---------------- menus suspensos do topo ---------------- */
  document.querySelectorAll("[data-cepe-suspenso]").forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var li = b.parentElement, aberto = li.classList.toggle("cepe-aberto");
      b.setAttribute("aria-expanded", String(aberto));
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".cepe-topnav > li.cepe-aberto").forEach(function (li) { li.classList.remove("cepe-aberto"); });
  });

  /* ---------------- um passo por vez ---------------- */
  var passos = [].slice.call(document.querySelectorAll("main section.cepe-passo[id]"));
  if (passos.length > 1) {
    document.body.classList.add("cepe-um-passo");
    var nomes = passos.map(function (s) {
      var t = s.querySelector(".cepe-passo-cab h2");
      return t ? t.textContent.trim() : s.id;
    });
    passos.forEach(function (s, i) {
      var nav = el("nav", "cepe-passo-nav");
      if (i > 0) nav.innerHTML += '<a class="cepe-ant" href="#' + passos[i - 1].id + '">← <span><small>Passo ' + i +
        "</small><br>" + esc(nomes[i - 1]) + "</span></a>";
      if (i < passos.length - 1) nav.innerHTML += '<a class="cepe-prox" href="#' + passos[i + 1].id + '"><span><small>Passo ' +
        (i + 2) + "</small><br>" + esc(nomes[i + 1]) + "</span> →</a>";
      s.appendChild(nav);
    });
    var links = [].slice.call(document.querySelectorAll(".cepe-menu a")).filter(function (a) {
      return (a.getAttribute("href") || "").charAt(0) === "#";
    });
    var mostrar = function () {
      var h = decodeURIComponent(location.hash.slice(1));
      var alvo = h && document.getElementById(h);
      var sec = (alvo && alvo.closest("section.cepe-passo")) || passos[0];
      passos.forEach(function (s) { s.classList.toggle("cepe-atual", s === sec); });
      links.forEach(function (a) { a.classList.toggle("ativo", a.getAttribute("href") === "#" + sec.id); });
      if (alvo && alvo !== sec) alvo.scrollIntoView({ block: "start" }); else window.scrollTo(0, 0);
      if (corpo) corpo.classList.remove("cepe-aberto-mobile");
    };
    CEPE.irPara = function (id) { if (location.hash === "#" + id) mostrar(); else location.hash = "#" + id; };
    window.addEventListener("hashchange", mostrar);
    mostrar();
  }

  /* ---------------- aviso rápido (toast) ---------------- */
  var toastEl = null;
  CEPE.toast = function (msg, tipo) {
    if (!toastEl) {
      toastEl = el("div", "cepe-toast", '<span class="cepe-toast-txt"></span>' +
        '<button class="cepe-toast-x" type="button" aria-label="Fechar aviso">×</button>');
      toastEl.setAttribute("role", "status");
      toastEl.querySelector(".cepe-toast-x").onclick = function () { clearTimeout(toastEl._h); toastEl.className = "cepe-toast"; };
      document.body.appendChild(toastEl);
    }
    toastEl.querySelector(".cepe-toast-txt").textContent = msg;
    toastEl.className = "cepe-toast cepe-on" + (tipo === "erro" ? " erro" : "");
    clearTimeout(toastEl._h);
    toastEl._h = setTimeout(function () { toastEl.className = "cepe-toast"; }, tipo === "erro" ? 8000 : 5000);
  };

  /* ---------------- janela (popup) com botões ---------------- */
  CEPE.janela = function (op) {
    op = op || {};
    return new Promise(function (resolver) {
      var botoes = op.botoes || [{ rotulo: "OK", valor: true, classe: "prim" }];
      var f = el("div", "cepe-janela-fundo");
      f.setAttribute("role", "dialog"); f.setAttribute("aria-modal", "true");
      var j = el("div", "cepe-janela" + (op.tipo === "erro" ? " erro" : ""),
        '<div class="cepe-janela-ic">' + ico(op.icone || "info") + "</div>" +
        "<h3>" + esc(op.titulo || "") + "</h3>" + (op.html || (op.texto ? "<p>" + esc(op.texto) + "</p>" : "")) +
        '<div class="cepe-janela-acoes"></div>');
      var acoes = j.querySelector(".cepe-janela-acoes");
      function fechar(v) { document.removeEventListener("keydown", tecla); f.remove(); resolver(v); }
      function tecla(ev) { if (ev.key === "Escape") fechar(op.esc !== undefined ? op.esc : null); }
      botoes.forEach(function (b) {
        var bt = el("button", "cepe-btn grande " + (b.classe || ""), esc(b.rotulo));
        bt.type = "button"; bt.onclick = function () { fechar(b.valor); };
        acoes.appendChild(bt);
      });
      f.appendChild(j); document.body.appendChild(f);
      document.addEventListener("keydown", tecla);
      var ultimo = acoes.lastElementChild; if (ultimo) ultimo.focus();
    });
  };

  /* ---------------- carregamento com barra de progresso ---------------- */
  CEPE.carregando = function (titulo, sub) {
    var f = el("div", "cepe-janela-fundo");
    var j = el("div", "cepe-janela",
      '<div class="cepe-janela-ic">' + ico("relogio") + "</div><h3>" + esc(titulo || "Carregando…") + "</h3>" +
      '<div class="cepe-carga-arq">' + esc(sub || "") + "</div>" +
      '<div class="cepe-carga-barra"><i></i></div>' +
      '<div class="cepe-carga-linha"><span class="cepe-carga-etapa">Preparando…</span><span class="cepe-carga-pct">0%</span></div>' +
      '<div class="cepe-carga-tempo"></div>');
    j.setAttribute("role", "dialog"); j.setAttribute("aria-live", "polite");
    f.appendChild(j); document.body.appendChild(f);
    var barra = j.querySelector(".cepe-carga-barra i"), etapa = j.querySelector(".cepe-carga-etapa"),
        pct = j.querySelector(".cepe-carga-pct"), tempo = j.querySelector(".cepe-carga-tempo");
    var atual = 0, inicio = Date.now();
    var relogio = setInterval(function () { tempo.textContent = Math.round((Date.now() - inicio) / 1000) + " s"; }, 500);
    var api = {
      progresso: function (p, texto) {
        if (p > atual) atual = Math.min(p, 100);
        barra.style.width = atual + "%"; pct.textContent = Math.round(atual) + "%";
        if (texto) etapa.textContent = texto;
      },
      concluir: function (texto) { api.progresso(100, texto || "Pronto!"); clearInterval(relogio); },
      erro: function (texto) {
        clearInterval(relogio); j.classList.add("erro"); etapa.textContent = texto || "Erro.";
        var b = el("button", "cepe-btn grande", "Fechar"); b.type = "button"; b.style.marginTop = "16px";
        b.onclick = api.fechar; j.appendChild(b); b.focus();
      },
      fechar: function () { clearInterval(relogio); f.remove(); }
    };
    return api;
  };

  /* ---------------- aviso vindo do servidor: <body data-cepe-aviso="..."> ---------------- */
  var aviso = document.body.getAttribute("data-cepe-aviso");
  if (aviso) CEPE.toast(aviso, document.body.getAttribute("data-cepe-aviso-tipo") || "ok");
})();
