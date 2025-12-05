function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

function processDirectory(dir, stream) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file === ".git") return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath, stream);
    } else {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const relativePath = path
          .relative(repoPath, filePath)
          .replace(/\\/g, "/");
        stream.write(`  <file path="${relativePath}">\n`);
        stream.write(escapeXml(content));
        stream.write(`\n  </file>\n`);
      } catch (e) {
        console.error(`Error reading file ${filePath}: ${e.message}`);
      }
    }
  });
}

const stream = fs.createWriteStream(outputPath, { encoding: "utf8" });
stream.write(
  '<?xml version="1.0" encoding="UTF-8"?>\n<repository name="nodebestpractices">\n'
);

processDirectory(repoPath, stream);

stream.write("</repository>");
stream.end();

stream.on("finish", () => {
  console.log(`XML generated at ${outputPath}`);
});
