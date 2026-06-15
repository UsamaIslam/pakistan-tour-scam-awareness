const https = require('https');

function pingHost(host, keyLocation, urls) {
  const data = JSON.stringify({
    host: host,
    key: "b4c9e88b8d4f4e248a3138b1d9bf594e",
    keyLocation: keyLocation,
    urlList: urls
  });

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  console.log(`Submitting IndexNow request for host: ${host}...`);
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        console.log(`Response for ${host} - Status Code: ${res.statusCode}`);
        if (body) console.log(`Response Body: ${body}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`Error submitting IndexNow for ${host}:`, error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    // 1. Submit for VPS custom domain
    await pingHost(
      "touredgetouravenuescam.owasol.com",
      "https://touredgetouravenuescam.owasol.com/b4c9e88b8d4f4e248a3138b1d9bf594e.txt",
      [
        "https://touredgetouravenuescam.owasol.com/",
        "https://touredgetouravenuescam.owasol.com/index.html",
        "https://touredgetouravenuescam.owasol.com/short.html",
        "https://touredgetouravenuescam.owasol.com/long.html",
        "https://touredgetouravenuescam.owasol.com/links.html"
      ]
    );

    // 2. Submit for GitHub Pages domain
    await pingHost(
      "UsamaIslam.github.io",
      "https://UsamaIslam.github.io/pakistan-tour-scam-awareness/b4c9e88b8d4f4e248a3138b1d9bf594e.txt",
      [
        "https://UsamaIslam.github.io/pakistan-tour-scam-awareness/",
        "https://UsamaIslam.github.io/pakistan-tour-scam-awareness/index.html",
        "https://UsamaIslam.github.io/pakistan-tour-scam-awareness/short.html",
        "https://UsamaIslam.github.io/pakistan-tour-scam-awareness/long.html",
        "https://UsamaIslam.github.io/pakistan-tour-scam-awareness/links.html"
      ]
    );

    console.log("IndexNow submissions completed successfully.");
  } catch (err) {
    console.error("IndexNow submission failed:", err);
  }
}

main();
