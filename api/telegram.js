async function tg(method, body){
  const token = process.env.8173789835:AAEJL4RuQukVOgrY3hbjAl0aZ49YIZFJwP8;
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  return r.json();
}

// ⚠️ Тут пока нет базы — начисление просто сообщением.
// Если хочешь реальный баланс/историю/рейтинг — добавим Vercel KV/Postgres.
module.exports = async (req, res) => {
  const update = req.body || {};

  if (update.pre_checkout_query) {
    await tg("answerPreCheckoutQuery", {
      pre_checkout_query_id: update.pre_checkout_query.id,
      ok: true,
    });
    return res.json({ ok:true });
  }

  const msg = update.message;
  if (msg?.successful_payment?.currency === "XTR") {
    const stars = msg.successful_payment.total_amount;
    await tg("sendMessage", {
      chat_id: msg.chat.id,
      text: `✅ Оплата прошла! Начислено: ${stars}⭐`,
    });
  }

  res.json({ ok:true });
};
