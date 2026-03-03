import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Markiety English Mastery',
        short_name: 'Markiety',
        description: 'Master spoken English with Tuhin Khandakar. Professional training, live classes, and practical learning.',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#0073ff',
        icons: [
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
    }
}
