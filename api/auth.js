const crypto = require("crypto");

function verifyInitData(initData, botToken){
  const p = new URLSearchParams(initData);
  const hash = p.get("hash");
  p.delete("hash");

  const dataCheckString = [...p.entries()]
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calc = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return calc === hash;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok:false });

  const { initData } = req.body || {};
  const botToken = process.env.8173789835:AAEJL4RuQukVOgrY3hbjAl0aZ49YIZFJwP8;

  if (!initData || !botToken) return res.status(400).json({ ok:false });

  if (!verifyInitData(initData, botToken)) return res.status(401).json({ ok:false });

  const p = new URLSearchParams(initData);
  const user = JSON.parse(p.get("user"));

  res.json({ ok:true, user });
};
