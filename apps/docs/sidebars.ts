import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
    docs: [
        {
            type: 'category',
            label: 'Getting Started',
            items: [
                'intro',
                'installation',
                'quick-start',
            ],
        },
        {
            type: 'category',
            label: 'Core Concepts',
            items: [
                'decorators/overview',
                'decorators/source-decorators',
                'decorators/virtual',
                'decorators/transforms',
                'decorators/validators',
            ],
        },
        {
            type: 'category',
            label: 'Advanced Usage',
            items: [
                'advanced/inherited-binding',
                'advanced/nested-binding',
                'advanced/custom-transformer',
                'advanced/array-decorator',
            ],
        },
        {
            type: 'category',
            label: 'Examples',
            items: [
                'examples/basic-usage',
                'examples/nested-request',
                'examples/validation-errors',
            ],
        },
        'faq',
    ],
}

export default sidebars
