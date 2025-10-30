// api/thumbnail.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing ?url= parameter" });
  }

  // Extract file ID from Mega link
  const match = url.match(/mega\.nz\/file\/([A-Za-z0-9_-]+)/);
  if (!match) {
    return res.status(400).json({ error: "Invalid Mega link" });
  }

  const fileId = match[1];

  // Return a thumbnail URL (this is a workaround using Mega’s embed preview)
  const embedUrl = `https://mega.nz/embed/${fileId}`;
  const thumbnailProxy = `https://image.thum.io/get/width/600/crop/400/noanimate/${embedUrl}`;

  res.status(200).json({ thumbnail: thumbnailProxy });
}

