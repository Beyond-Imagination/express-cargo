import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const isVercel = process.env.VERCEL === '1'

const config: Config = {
    title: 'express-cargo',
    tagline: 'Declarative, decorator-driven request data handling for Express.js.',
    favicon: 'img/favicon.png',

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: isVercel ? 'https://dev-docs.express-cargo.beyond-imagination.net/' : 'https://beyond-imagination.github.io',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: isVercel ? '/' : '/express-cargo/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'Beyond-Imagination', // Usually your GitHub org/user name.
    projectName: 'express-cargo', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'ko'],
        localeConfigs: {
            en: {
                label: 'English',
            },
            ko: {
                label: '한국어',
                direction: 'ltr',
            },
        },
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    routeBasePath: '/',
                    sidebarPath: './sidebars.ts',
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/logo.png',
        navbar: {
            logo: {
                alt: 'My Site Logo',
                src: 'img/logo.png',
                srcDark: 'img/logo_dark.png',
            },
            items: [
                {
                    type: 'localeDropdown',
                    position: 'right',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'docs',
                    position: 'left',
                    label: 'Docs',
                },
                // {to: '/blog', label: 'Blog', position: 'left'},
                {
                    href: 'https://github.com/Beyond-Imagination/express-cargo',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'light',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Getting Started',
                            to: '/intro',
                        },
                        {
                            label: 'Core Concepts',
                            to: '/decorators/overview',
                        },
                        {
                            label: 'Examples',
                            to: '/examples/basic-usage',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'GitHub',
                            href: 'https://github.com/Beyond-Imagination/express-cargo',
                        },
                    ],
                },
            ],
            copyright: `Copyright © 2025 Beyond_Imagination Team. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
        metadata: [
            { name: 'keywords', content: 'express, middleware, express middleware, express-cargo, express decorator, request, express request, node.js, typescript, npm' },
            { name: 'description', content: 'A TypeScript-based Express.js middleware for structured request data handling.' },
            { name: 'author', content: 'Beyond_Imagination' },
        ],
    } satisfies Preset.ThemeConfig,

    headTags: [
        {
            tagName: 'script',
            attributes: { type: 'application/ld+json' },
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "express-cargo",
                "applicationCategory": "Web development library",
                "operatingSystem": "any",
                "url": isVercel ? 'https://dev-docs.express-cargo.beyond-imagination.net/' : 'https://beyond-imagination.github.io/express-cargo',
                "author": {
                    "@type": "Organization",
                    "name": "Beyond_Imagination"
                },
                "description": "A TypeScript-based Express.js middleware for structured request data handling.",
            }),
        },
    ],
}

export default config

