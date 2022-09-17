import { Format } from "./types";

function minify(html: string) {
  return html.replace(/\s+/g, " "); // trim whitespace to max 1
}

function getHTML(body: string) {
  return minify(`
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Download from Youtube</title>
    </head>
    <body>
        ${body}
    </body>
</html>
`);
}

export function getIndexPageHTML(hostname: string) {
  const index = hostname.lastIndexOf("youtube.");
  const domain = hostname.substring(index + 8);

  return minify(`
<h1>Download from Youtube</h1>

<p>Modify YouTube URL to <code>https://www.youtube.<b>${domain}</b>/watch?v=xyzasfd</code> to download the video.</p>
<p>You can also list the quality alternatives by modifying the URL to <code>https://www.youtube.<b>${domain}.list</b>.com/watch?v=xyzasfd</code>.
`);
}

export function getListPageHTML(formats: Format[]) {
  return getHTML(`
<h1>Download from Youtube</h1>

<ul>
    ${formats.map(getLI).join("")}
</ul>
`);
}

function getLI(format: Format) {
  return `
<li>
    <a href="${format.url}&title=Yoyoy" rel="noreferrer">
        ${getLIContent(format)}
    </a>
</li>
`;
}

function getLIContent(format: Format) {
  if (format.fps) {
    return format.qualityLabel;
  } else {
    return `Audio only (${Math.round(format.bitrate / 1000)}kbps)`;
  }
}
