// api/saveData.js
import { Buffer } from 'buffer';

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const filePath = process.env.GITHUB_FILE_PATH || 'data.json';
  const branch = process.env.BRANCH || 'main';

  if (!token || !repo) return res.status(500).json({ error: 'Missing GITHUB_TOKEN or GITHUB_REPO' });

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`;

  try {
    if (req.method === 'GET') {
      // Fetch file content
      const r = await fetch(apiUrl, {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3.raw' }
      });
      if (!r.ok) return res.status(r.status).json({ error: 'GitHub GET failed', status: r.statusText });
      const text = await r.text();
      try {
        return res.status(200).json(JSON.parse(text));
      } catch {
        return res.status(200).json({ workers: [], camps: [], campData: {} });
      }
    }

    if (req.method === 'POST') {
      const body = req.body;
      // Get SHA if file exists
      let sha = null;
      const metaR = await fetch(apiUrl, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } });
      if (metaR.ok) {
        const meta = await metaR.json();
        sha = meta.sha;
      }

      const contentB64 = Buffer.from(JSON.stringify(body, null, 2)).toString('base64');

      const putR = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath)}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update data.json via Care-Pro app',
          content: contentB64,
          branch,
          ...(sha ? { sha } : {})
        })
      });

      const result = await putR.json();
      if (!putR.ok) return res.status(putR.status).json({ error: 'GitHub PUT failed', detail: result });
      return res.status(200).json({ message: '✅ Data saved successfully', result });
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
