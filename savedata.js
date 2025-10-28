// api/saveData.js
// This serverless function reads/writes data.json in your GitHub repo using GitHub Content API.
// You MUST set env vars in Vercel:
//  - GITHUB_TOKEN  (a Personal Access Token with "repo" or "public_repo" permission depending on repo visibility)
//  - GITHUB_REPO   (format: "username/reponame", e.g. "faizan/carepro-accommodation")
//  - GITHUB_FILE_PATH (path to file in repo, e.g. "data.json")
//  - BRANCH (optional, default "main")

import { Buffer } from 'buffer';

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const filePath = process.env.GITHUB_FILE_PATH || 'data.json';
  const branch = process.env.BRANCH || 'main';

  if (!token || !repo) {
    return res.status(500).json({ error: 'Missing GITHUB_TOKEN or GITHUB_REPO environment variables' });
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`;

  try {
    if (req.method === 'GET') {
      // fetch file content
      const r = await fetch(apiBase, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3.raw' }});
      if (!r.ok) return res.status(r.status).json({ error: 'GitHub GET failed', status: r.statusText });
      const text = await r.text();
      // If GitHub returns raw contents (Accept: raw), text is the JSON string
      try {
        const obj = JSON.parse(text);
        return res.status(200).json(obj);
      } catch (e) {
        // not JSON? return as-is
        return res.status(200).json({ raw: text });
      }
    }

    else if (req.method === 'POST') {
      const body = req.body;
      // get current file to obtain sha (needed for update)
      const metaR = await fetch(apiBase, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }});
      if (!metaR.ok) return res.status(metaR.status).json({ error: 'Could not fetch file metadata', status: metaR.statusText });
      const meta = await metaR.json();
      const sha = meta.sha;

      // prepare new content
      const contentStr = JSON.stringify(body, null, 2);
      const b64 = Buffer.from(contentStr).toString('base64');

      // commit (PUT)
      const putUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath)}`;
      const putBody = {
        message: req.query?.message || 'Update data.json via app',
        content: b64,
        branch
      };
      if (sha) putBody.sha = sha;

      const putR = await fetch(putUrl, {
        method: 'PUT',
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(putBody)
      });

      const j = await putR.json();
      if (!putR.ok) return res.status(putR.status).json({ error: 'GitHub PUT failed', detail: j });
      return res.status(200).json({ message: '✅ Data saved to GitHub', result: j });
    }

    else {
      res.setHeader('Allow', 'GET,POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
