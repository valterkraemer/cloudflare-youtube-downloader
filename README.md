# Cloudflare YouTube Downloader

When deployed to a Cloudflare Worker you can go to `https://my-origin/watch?v=xyzasfd` to download the video.

You could set it so that you only need to insert your domain to the YouTube URL to download it. Like `https://www.youtube.example.com/watch?v=xyzasfd`.

This will download the highest quality available using this method, which will likely be 720p MP4.

If the hostname contains "`.list.`" (`https://www.youtube.list.example.com/watch?v=xyzasfd`), you will be presented with a list of video quality alternatives to download.
