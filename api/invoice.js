module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok:false });

  const { chat_id, stars } = req.body || {};
  const s = Math.max(1, Math.floor(Number(stars || 1)));
  const token = process.env.8173789835:AAEJL4RuQukVOgrY3hbjAl0aZ49YIZFJwP8;

  if (!chat_id || !token) return res.status(400).json({ ok:false });

  const payload = `topup_${chat_id}_${Date.now()}`;

  const body = {
    title: "Пополнение звёзд",
    description: `Начисление ${s}⭐ на баланс`,
    payload,
    currency: "XTR",
    prices: [{ label: `${s}⭐`, amount: s }],
  };

  const r = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });

  const data = await r.json();
  if (!data.ok) return res.status(400).json({ ok:false, error:data });

  res.json({ ok:true, invoice_link: data.result, payload });
};
