import { getIndexPageHTML, getListPageHTML } from "./html";
import { Format } from "./types";

const DOMAIN = "https://www.youtube.com";

addEventListener("fetch", async (event) => {
  try {
    event.respondWith(handleRequest(event.request));
  } catch (error: any) {
    event.respondWith(new Response(error.stack, { status: 500 }));
  }
});

async function handleRequest(request: Request) {
  let { hostname, origin, href, searchParams } = new URL(request.url);

  const afterOrigin = href.substring(origin.length); // /watch?v=xyzasdf

  const showList = hostname.includes(".list.");
  const videoId = searchParams.get("v");

  if (!videoId) {
    return new Response(getIndexPageHTML(hostname), {
      headers: new Headers({
        "Content-Type": "text/html;charset=UTF-8",
      }),
    });
  }

  const youtubeWatchHTMLRes = await fetch(DOMAIN + afterOrigin);
  const youtubeWatchHTMLText = await youtubeWatchHTMLRes.text();

  const apiKey = youtubeWatchHTMLText.match(
    /"INNERTUBE_API_KEY":"([^"]+)"/
  )?.[1];

  if (!apiKey) {
    throw new Error("No INNERTUBE_API_KEY found");
  }

  const youtubeAPIRes = await fetch(
    `${DOMAIN}/youtubei/v1/player?key=${apiKey}`,
    {
      method: "POST",
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "16.05",
          },
        },
        videoId,
      }),
    }
  );
  const youtubeAPIResJSON: any = await youtubeAPIRes.json();

  const streamingData = youtubeAPIResJSON?.streamingData;
  const streamingDataFormats: Format[] = streamingData?.formats;
  const streamingDataAdaptiveFormats: Format[] = streamingData?.adaptiveFormats;
  const title: string = youtubeAPIResJSON?.videoDetails?.title;

  if (!streamingDataFormats || !streamingDataAdaptiveFormats || !title) {
    throw new Error("Incompatible response from YouTube API");
  }

  // Add title to URL so that the file will be named it when downloaded
  const titleParam = "&title=" + encodeURIComponent(title);

  const formats: Format[] = [
    ...streamingDataFormats,
    ...streamingDataAdaptiveFormats,
  ]
    .filter((format) => {
      // only keep videos that also have sound
      return format.fps && format.audioQuality;
    })
    .map((format) => {
      return {
        ...format,
        url: decodeURIComponent(format.url) + titleParam,
      };
    });

  if (showList) {
    const html = getListPageHTML(formats);

    return new Response(html, {
      headers: new Headers({
        "Content-Type": "text/html;charset=UTF-8",
      }),
    });
  }

  let best = formats[0];

  if (!best) {
    throw new Error("No videos in formats");
  }

  for (let i = 1; i < formats.length; i++) {
    const format = formats[i];
    if (format.bitrate > best.bitrate) {
      best = format;
    }
  }

  return Response.redirect(best.url, 307);
}
