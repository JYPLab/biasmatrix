import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: '/report/',
            },
        ],
        sitemap: 'https://biasmatrix.com/sitemap.xml',
    };
}
