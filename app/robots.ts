// app/robots.ts
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/recover'] }],
    sitemap: 'https://devcraft.shop/sitemap.xml',
  }
}