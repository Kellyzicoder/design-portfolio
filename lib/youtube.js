// Latest videos from a YouTube channel, using YouTube's free public feed (no API key needed).
// The site checks for new videos at most once an hour.

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// works with a channel ID ("UC...") or a channel link that contains one
export function channelIdFrom(value) {
  const m = (value || '').match(/UC[\w-]{22}/);
  return m ? m[0] : null;
}

export async function getLatestVideos(channelId, max = 5) {
  if (!channelId) return [];
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, max).map(([, e]) => {
      const id = (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
      const title = decode((e.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
      const published = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
      return { id, title, published, thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
    }).filter((v) => v.id);
  } catch (e) {
    console.error('Could not load YouTube videos', e);
    return [];
  }
}
