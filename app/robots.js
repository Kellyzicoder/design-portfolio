// Tells search engines what to look at, and where the sitemap is (kelvstudio.com/robots.txt).
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    sitemap: 'https://kelvstudio.com/sitemap.xml',
    host: 'https://kelvstudio.com',
  };
}
