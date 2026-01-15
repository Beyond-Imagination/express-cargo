// src/theme/Root.tsx
import type { ReactNode } from 'react'
import React, { useEffect } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

interface RootProps {
    children: ReactNode;
}

export default function Root({ children }: RootProps) {
    const { siteConfig } = useDocusaurusContext()
    const newRelicConfig = siteConfig.customFields?.newRelic as any

    useEffect(() => {
        if (typeof window === 'undefined' || !newRelicConfig) {
            return
        }

        import('@newrelic/browser-agent/loaders/browser-agent').then(
            ({ BrowserAgent }) => {
                console.log('newrelic',newRelicConfig)
                const options = {
                    init: {
                        distributed_tracing: { enabled: true },
                        performance: { capture_measures: true },
                        browser_consent_mode: { enabled: false },
                        privacy: { cookies_enabled: true },
                        ajax: { deny_list: ['bam.nr-data.net'] },
                    },
                    info: {
                        beacon: 'bam.nr-data.net',
                        errorBeacon: 'bam.nr-data.net',
                        licenseKey: newRelicConfig.licenseKey,
                        applicationID: newRelicConfig.applicationID,
                        sa: 1,
                    },
                    loader_config: {
                        accountID: newRelicConfig.accountID,
                        trustKey: newRelicConfig.trustKey,
                        agentID: newRelicConfig.agentID,
                        licenseKey: newRelicConfig.licenseKey,
                        applicationID: newRelicConfig.applicationID,
                    },
                }

                new BrowserAgent(options)
            },
        ).catch(err => {
            console.error('Failed to load New Relic:', err)
        })
    }, [newRelicConfig])

    return <>{children}</>
}
