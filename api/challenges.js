export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const r = await fetch('https://yukon.org', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YukonBannerBot/1.0)' },
    });
    if (!r.ok) throw new Error(`yukon.org returned ${r.status}`);
    const html = await r.text();

    // Match active challenge cards: name span immediately followed by --active badge,
    // then description paragraph somewhere within the same card body.
    const cardRe =
      /challenge-card-name">([^<]+)<\/span><span class="challenge-card-badge challenge-card-badge--active">[^<]*<\/span>[\s\S]*?challenge-card-desc">([^<]+)<\/p>/g;

    const challenges = [];
    let m;
    while ((m = cardRe.exec(html)) !== null) {
      challenges.push({
        name: m[1].trim(),
        description: m[2].replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
      });
    }

    if (challenges.length === 0) throw new Error('No active challenges found — page structure may have changed');

    res.json({ challenges });
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) });
  }
}
