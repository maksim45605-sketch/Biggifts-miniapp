const tg = window.Telegram?.WebApp;
const $ = (id) => document.getElementById(id);

const msg = (text, type="") => {
  const el = $("msg");
  el.className = "note " + (type || "");
  el.textContent = text || "";
};

function clampStars(n){
  n = Number(n || 1);
  if (!Number.isFinite(n)) n = 1;
  return Math.max(1, Math.floor(n));
}

async function postJSON(url, data){
  const r = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  return r.json();
}

let userId = null;

async function init(){
  if (!tg) {
    msg("Открой это внутри Telegram (Mini App).", "bad");
    return;
  }

  tg.ready();
  tg.expand();

  // Авторизация через initData (сервер проверит подпись)
  const initData = tg.initData;
  const auth = await postJSON("/api/auth", { initData });

  if (!auth.ok) {
    msg("Ошибка авторизации Mini App.", "bad");
    return;
  }

  userId = auth.user.id;
  $("who").textContent = `@${auth.user.username || "user"} • id ${userId}`;
  $("bal").textContent = "0"; // Пока заглушка (баланс лучше хранить в базе)

  // Чипы
  document.querySelectorAll(".chip").forEach(b=>{
    b.addEventListener("click", ()=>{
      $("stars").value = b.dataset.s;
    });
  });

  $("payBtn").addEventListener("click", pay);
  msg("");
}

async function pay(){
  if (!userId) return;
  const btn = $("payBtn");
  btn.disabled = true;

  const stars = clampStars($("stars").value);
  $("stars").value = stars;

  msg("Создаю счёт…");
  const inv = await postJSON("/api/invoice", { chat_id: userId, stars });

  if (!inv.ok) {
    msg("Не удалось создать счёт.", "bad");
    btn.disabled = false;
    return;
  }

  msg("Открываю оплату в Telegram…");
  tg.openInvoice(inv.invoice_link, (status) => {
    // status: "paid" | "cancelled" | "failed" | "pending"
    if (status === "paid") msg("✅ Оплачено! Баланс обновится сообщением от бота.", "ok");
    else if (status === "cancelled") msg("Оплата отменена.", "bad");
    else if (status === "failed") msg("Ошибка оплаты.", "bad");
    else msg("Ожидание…");
    btn.disabled = false;
  });
}

init();
