import puppeteer from "puppeteer";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("Missing ?url parameter");

    // Convert normal link to embed version
    const embedUrl = url.includes("/embed/") ? url : url.replace("/file/", "/embed/");

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Go to Mega embed and wait for video frame
    await page.goto(embedUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(7000); // wait 7s for video to render

    // Try to capture the main video area
    let buffer;
    const video = await page.$("video");
    if (video) {
      const box = await video.boundingBox();
      buffer = await page.screenshot({
        clip: {
          x: Math.max(0, box.x),
          y: Math.max(0, box.y),
          width: Math.min(1280, box.width),
          height: Math.min(720, box.height)
        },
        type: "jpeg",
        quality: 85
      });
    } else {
      // fallback: screenshot visible page
      buffer = await page.screenshot({ type: "jpeg", quality: 80 });
    }

    await browser.close();

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=3600");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating thumbnail: " + err.message);
  }
}
