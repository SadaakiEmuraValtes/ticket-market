// ============================================================
//  TicketMarket Demo – Shared Layout Builder & UI Helpers
// ============================================================

function buildDisclaimer() {
  const _t = I18n.t.bind(I18n);
  return `
<div class="disclaimer-banner" id="disclaimer-banner">
  ⚠️ <strong>${_t("デモサイト：", "Demo Site:")}</strong>
  ${_t(
    "このサイトはデモンストレーション目的で作成された架空のチケット販売サービスです。掲載されているイベント・出演者・会場・料金はすべてフィクションです。実際の購入・決済は行われません。",
    "This is a fictitious ticketing service for demonstration purposes. All events, performers, venues and prices are fictional. No actual purchases or payments are made."
  )}
</div>`;
}

function buildHeader(activePage = "") {
  const _t = I18n.t.bind(I18n);
  const _u = I18n.urlWith.bind(I18n);
  const act = key => (activePage === key ? " active" : "");
  return `
<header id="site-header" class="site-header">
  <div class="header-inner">
    <a href="${_u("index.html")}" class="logo" id="logo">
      <span class="logo-icon">🎫</span> TicketMarket
    </a>
    <div class="header-search">
      <input type="text" id="hs-keyword" placeholder="${_t("イベント名・出演者・会場", "Event, performer, venue")}" onkeydown="if(event.key==='Enter')headerSearch()">
      <button id="btn-header-search" onclick="headerSearch()" title="${_t("検索", "Search")}">🔍</button>
    </div>
    <nav id="global-nav" class="header-nav">
      <a href="${_u("index.html")}" class="header-nav${act("home")}" id="nav-home">${_t("ホーム", "Home")}</a>
      <a href="${_u("search.html")}" class="header-nav${act("search")}" id="nav-search">${_t("イベントを探す", "Find Events")}</a>
      <a href="${_u("help.html")}" class="header-nav${act("help")}" id="nav-help">${_t("ヘルプ", "Help")}</a>
      <span id="header-nav-dynamic" class="header-nav-dynamic"></span>
      <button id="btn-lang-toggle" class="btn-lang" onclick="toggleLang()">${_t("EN", "日本語")}</button>
    </nav>
  </div>
  <div class="genre-nav" id="genre-nav">
    <div class="genre-nav-inner">
      ${GENRES.map(g => `<a href="${_u("search.html?mode=genre&genre=" + g.id)}" id="gnav-${g.id}" class="genre-nav-item" data-genre="${g.id}">${g.emoji} ${_t(g.name, g.en)}</a>`).join("")}
    </div>
  </div>
</header>`;
}

function buildFooter() {
  const _t = I18n.t.bind(I18n);
  const _u = I18n.urlWith.bind(I18n);
  return `
<footer class="site-footer" id="site-footer">
  <div class="footer-nav">
    <a href="${_u("index.html")}" id="footer-home">${_t("ホーム", "Home")}</a>
    <a href="${_u("search.html")}" id="footer-search">${_t("イベントを探す", "Find Events")}</a>
    <a href="${_u("mypage.html")}" id="footer-mypage">${_t("マイページ", "My Page")}</a>
    <a href="${_u("help.html")}" id="footer-help">${_t("ヘルプ・よくある質問", "Help & FAQ")}</a>
    <a href="${_u("help.html#rules")}" id="footer-rules">${_t("ご利用ルール", "Rules")}</a>
  </div>
  <div>© 2026 TicketMarket Demo – Valtes Inc.</div>
  <div class="disclaimer-footer">
    ${_t(
      "【免責事項】本サイトはデモンストレーション目的で作成された架空のサービスです。掲載されているイベント名・出演者・団体名・会場名・料金・座席情報はすべて架空のフィクションであり、実在の人物・団体・施設とは一切関係ありません。本サイト上でのチケット購入・決済・個人情報の送受信は行われず、いかなる法的拘束力も生じません。本デモは株式会社バルテスの内部デモ用途のみに使用されます。",
      "[Disclaimer] This site is a fictitious service created for demonstration purposes. All event names, performers, organizations, venues, prices and seat information are entirely fictional and have no connection to real people, organizations or facilities. No ticket purchases, payments or personal data transmissions are made, and no legal obligations arise. This demo is for internal use by Valtes Inc. only."
    )}
  </div>
</footer>
<div id="toast-container"></div>`;
}

function buildPage({ title, activePage = "" }) {
  document.title = title ? `${title} | TicketMarket Demo` : "TicketMarket Demo";
  document.body.insertAdjacentHTML("afterbegin", buildDisclaimer() + buildHeader(activePage));
  document.body.insertAdjacentHTML("beforeend", buildFooter());
  // buildPage は App.init() の renderHeader() より後に実行されるためここで再描画する
  App.renderHeader();
  I18n.apply();
}

// 言語切替
function toggleLang() {
  const url = new URL(window.location.href);
  if (I18n.isEN()) url.searchParams.delete("lang"); else url.searchParams.set("lang", "en");
  window.location.href = url.toString();
}

// ヘッダー検索 → キーワード検索
function headerSearch() {
  const kw = document.getElementById("hs-keyword")?.value.trim() || "";
  App.saveSearchParams({ mode: "keyword", keyword: kw });
  I18n.go("search.html?mode=keyword&keyword=" + encodeURIComponent(kw));
}

// ── 日付テキスト入力の自動フォーマット（yyyy/mm/dd） ─────
function autoFormatDate(input) {
  const digits = input.value.replace(/[^0-9]/g, "").slice(0, 8);
  let v = digits;
  if (digits.length > 6) v = digits.slice(0, 4) + "/" + digits.slice(4, 6) + "/" + digits.slice(6);
  else if (digits.length > 4) v = digits.slice(0, 4) + "/" + digits.slice(4);
  input.value = v;
}

function openDatePicker(id) { Cal.open(id); }

// ── カスタムカレンダーポップアップ ──
const Cal = (() => {
  let _id = null, _y = null, _m = null;

  function _outside(e) {
    const popup = document.getElementById("cal-popup");
    if (!popup) return;
    if (!document.contains(e.target)) return; // 再描画で切り離された要素は無視
    const wrap = _id && document.getElementById(_id)?.closest(".date-input-wrap");
    if (!popup.contains(e.target) && (!wrap || !wrap.contains(e.target))) _close();
  }

  function _open(inputId) {
    _close();
    _id = inputId;
    const input = document.getElementById(inputId);
    const mt = (input?.value || "").match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    const now = new Date();
    _y = mt ? +mt[1] : now.getFullYear();
    _m = mt ? +mt[2] - 1 : now.getMonth();

    const popup = document.createElement("div");
    popup.id = "cal-popup";
    popup.className = "cal-popup";
    document.body.appendChild(popup);
    _render();

    const wrap = input?.closest(".date-input-wrap");
    if (wrap) {
      const r = wrap.getBoundingClientRect();
      popup.style.top  = (r.bottom + window.scrollY + 4) + "px";
      popup.style.left = Math.max(8, Math.min(r.left + window.scrollX, window.innerWidth - 290 + window.scrollX)) + "px";
    }
    setTimeout(() => document.addEventListener("click", _outside), 0);
  }

  function _close() {
    document.getElementById("cal-popup")?.remove();
    document.removeEventListener("click", _outside);
    _id = null;
  }

  function _move(delta) {
    _m += delta;
    if (_m < 0)  { _m = 11; _y--; }
    if (_m > 11) { _m = 0;  _y++; }
    _render();
  }

  function _pick(ds) {
    const input = document.getElementById(_id);
    if (input) {
      input.value = ds.replace(/-/g, "/");
      input.dispatchEvent(new Event("input",  { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    _close();
  }

  function _render() {
    const popup = document.getElementById("cal-popup");
    if (!popup) return;
    const input = document.getElementById(_id);
    const mt  = (input?.value || "").match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    const sel = mt ? `${mt[1]}-${mt[2]}-${mt[3]}` : null;
    const today = App.todayStr();
    const en = I18n.isEN();
    const MONTHS = en ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] : ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
    const first = new Date(_y, _m, 1), last = new Date(_y, _m + 1, 0);

    let head = [0,1,2,3,4,5,6].map(i => `<div class="cal-dow${i === 0 ? " cal-sun" : i === 6 ? " cal-sat" : ""}">${App.dowName(i)}</div>`).join("");
    let cells = "";
    for (let i = 0; i < first.getDay(); i++) cells += `<div class="cal-day cal-other"></div>`;
    for (let d = 1; d <= last.getDate(); d++) {
      const ds = `${_y}-${String(_m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dow = new Date(_y, _m, d).getDay();
      let cls = "cal-day";
      if (ds === today) cls += " cal-today";
      if (ds === sel) cls += " cal-sel";
      if (dow === 0) cls += " cal-sun";
      if (dow === 6) cls += " cal-sat";
      cells += `<div class="${cls}" data-date="${ds}" onclick="Cal.pick('${ds}')">${d}</div>`;
    }

    popup.innerHTML = `
      <div class="cal-header" id="cal-header">
        <button class="cal-nav" id="cal-prev" onclick="Cal.move(-1)" title="${en ? "Previous month" : "前の月"}">◀</button>
        <span id="cal-month-label">${en ? `${MONTHS[_m]} ${_y}` : `${_y}年 ${MONTHS[_m]}`}</span>
        <button class="cal-nav" id="cal-next" onclick="Cal.move(1)" title="${en ? "Next month" : "次の月"}">▶</button>
      </div>
      <div class="cal-grid" id="cal-grid">${head}${cells}</div>
      <div class="cal-footer" id="cal-footer">
        <button class="btn btn-secondary btn-sm" id="cal-close-btn" onclick="Cal.close()">${en ? "✕ Close" : "✕ 閉じる"}</button>
      </div>`;
  }

  return { open: _open, close: _close, move: _move, pick: _pick };
})();

// ── イベントカード（一覧・トップ・お気に入りで共通） ─────────
// opts.idPrefix: 同一ページで同じイベントが複数回出る場合のID接頭辞
// opts.mode: "grid" | "list"
// opts.favRemove: お気に入り解除ボタンを表示（マイページ用）
function eventCardHtml(e, opts = {}) {
  const _t = I18n.t.bind(I18n);
  const pre = opts.idPrefix || "";
  const name = App.idSafe(e.title);
  const st = App.salesStatus(e);
  const venues = [...new Set(e.perfs.map(pf => App.venueName(pf.venue)))];
  const venueText = venues[0] + (venues.length > 1 ? _t(` ほか${venues.length - 1}会場`, ` +${venues.length - 1} more`) : "");
  const buyLabel = { before: _t("発売前", "Coming Soon"), soldout: _t("予定枚数終了", "Sold Out"), closed: _t("受付終了", "Closed"),
                     lottery: _t("抽選に申し込む", "Enter Lottery") }[st.key] || _t("チケット購入", "Buy Tickets");
  const buyDisabled = ["before", "soldout", "closed"].includes(st.key);
  const isValtes = e.tags.includes("バルテス");

  const img = `
    <div class="${opts.mode === "list" ? "eli-img" : "event-card-img"}" style="background:${App.genreColor(e.genre)}">
      <span class="event-emoji">${App.genreEmoji(e.genre)}</span>
      <span class="tag-ribbon ${st.cls} sales-status" data-sales-status="${st.key}">${st.label}</span>
      ${isValtes ? `<span class="tag-valtes">${_t("バルテス", "Valtes")}</span>` : ""}
    </div>`;

  const info = `
    <div class="event-badges">
      <span class="badge badge-genre event-genre" data-genre="${e.genre}">${App.genreName(e.genre)}</span>
      <span class="badge badge-gray event-sub">${App.subName(e.sub)}</span>
      ${e.saleType === "lottery" ? `<span class="badge badge-purple">${_t("抽選", "Lottery")}</span>` : ""}
    </div>
    <div class="event-card-title event-title">${e.title}</div>
    <div class="event-card-performer event-performer">${e.performer}</div>
    <div class="event-card-meta event-period">📅 ${App.fmtPeriod(e)}</div>
    <div class="event-card-meta event-venue">📍 ${venueText}</div>
    ${st.key === "before" ? `<div class="event-card-meta event-sales-start" style="color:var(--warn)">🕙 ${_t("一般発売", "On sale")}: ${App.fmtDateDow(App.salesStartDate(e))} 10:00〜</div>` : ""}
    <div class="event-card-price event-price">${App.fmtPrice(App.minPrice(e))}<span>${_t("〜", "~")}</span></div>`;

  const actions = `
    <button id="${pre}btn-detail-${name}" class="btn btn-secondary btn-sm btn-detail" onclick="I18n.open('event.html?id=${e.id}','_blank')">${_t("詳細 ↗", "Details ↗")}</button>
    ${opts.favRemove
      ? `<button id="${pre}btn-fav-remove-${name}" class="btn btn-danger btn-sm btn-fav-remove" onclick="removeFav('${e.id}')">${_t("♥ 解除", "♥ Remove")}</button>`
      : `<button id="${pre}btn-buy-${name}" class="btn btn-primary btn-sm btn-buy" ${buyDisabled ? "disabled" : ""} onclick="handleBuy('${e.id}')">${buyLabel}</button>`}`;

  if (opts.mode === "list") {
    return `
    <div class="event-list-item" id="${pre}event-${e.id}" data-event-id="${e.id}" data-genre="${e.genre}" data-sales-status="${st.key}">
      ${img}
      <div class="eli-body">${info}<p class="event-desc">${e.desc}</p></div>
      <div class="eli-actions">${actions}</div>
    </div>`;
  }
  return `
    <div class="event-card" id="${pre}event-${e.id}" data-event-id="${e.id}" data-genre="${e.genre}" data-sales-status="${st.key}">
      ${img}
      <div class="event-card-body">${info}</div>
      <div class="event-card-actions">${actions}</div>
    </div>`;
}

// 購入ボタン共通処理（ログイン必須 → チケット選択画面へ）
function handleBuy(eventId, perfId) {
  if (!App.requireLogin(I18n.urlWith(`ticket-select.html?eventId=${eventId}${perfId ? "&perfId=" + perfId : ""}`))) return;
  I18n.go(`ticket-select.html?eventId=${eventId}${perfId ? "&perfId=" + perfId : ""}`);
}
