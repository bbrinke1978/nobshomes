import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://no-bshomes.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://no-bshomes.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://no-bshomes.com/how-it-works', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://no-bshomes.com/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
