const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: "imaginizedlabs.com",
      user: "imaginizedlabs",
      password: "#=}`C4\\5tVf~y>%~2;/e",
      secure: false,
    });

    const distPath = path.resolve(__dirname, "dist");
    const remoteBase = "/public_html/ds360/";

    // Upload dist files
    const files = fs.readdirSync(distPath);
    for (const file of files) {
      const localFile = path.join(distPath, file);
      const remoteFile = remoteBase + file;
      const stat = fs.statSync(localFile);
      if (stat.isDirectory()) {
        await client.uploadFromDir(localFile, remoteFile);
      } else {
        await client.uploadFrom(localFile, remoteFile);
      }
      console.log("Uploaded:", file);
    }

    console.log("\n✅ Deployment complete!");
  } catch (err) {
    console.error("Deploy failed:", err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();