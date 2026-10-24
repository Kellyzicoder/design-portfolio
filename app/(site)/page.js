import Portfolio from '@/components/Portfolio';
import { getSiteData } from '@/lib/getSiteData';
import { getLatestVideos, channelIdFrom } from '@/lib/youtube';

// re-check the CMS for changes at most once a minute
export const revalidate = 60;

export default async function Home() {
  const { settings, posters, start, testimonials, sections } = await getSiteData();

  // newest videos from the channel, checked at most once an hour
  const videos = await getLatestVideos(channelIdFrom(settings.youtubeChannelId) || channelIdFrom(settings.youtubeUrl));

  return <Portfolio videos={videos} settings={settings} posters={posters} start={start} testimonials={testimonials} sections={sections} />;
}
