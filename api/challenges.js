export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const r = await fetch('https://yukon.org/api/challenges');
    if (!r.ok) throw new Error(`yukon.org returned ${r.status}`);
    const data = await r.json();

    const challenges = (data.challenges || [])
      .filter(c => c.tracks?.some(t => t.status === 'open'))
      .map(c => {
        const openTrack = c.tracks.find(t => t.status === 'open');
        // Use sourceUrl repo name when available (e.g. "sig.golf" instead of "sig-golf")
        const srcName = openTrack?.sourceUrl?.split('/').pop() || c.name.split('/').pop();
        return { name: srcName, description: openTrack.description };
      });

    res.json({ challenges });
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) });
  }
}
