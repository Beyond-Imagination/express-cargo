import type { ReactNode } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

const quickStartCode = `import express from 'express';
import { body, bindingCargo, getCargo } from 'express-cargo';

const app = express();
app.use(express.json());

class SumRequest {
  @body()
  number1!: number;

  @body()
  number2!: number;
}

app.post('/sum', bindingCargo(SumRequest), (req, res) => {
  const data = getCargo<SumRequest>(req);
  const sum = data.number1 + data.number2;
  res.json({ result: sum });
});

app.listen(3000);
`;

function TwoColumnLayout() {
    const { siteConfig } = useDocusaurusContext();


    return (
        <div className={clsx('container', styles.pageContainer)}>
            <div className={styles.leftColumn}>
                <Heading as="h1" className={styles.heroTitle}>
                    {siteConfig.title}
                </Heading>
                <p className={styles.heroTagline}>
                    <Translate id="theme.tagline">{siteConfig.tagline}</Translate>
                </p>
                <div className={styles.buttons}>
                    <Link
                        className={clsx('button button--primary button--lg', styles.getStartedButton)}
                        to="/intro">
                        <Translate id="theme.homepage.getStarted">Get Started</Translate>
                    </Link>
                </div>
            </div>
            <div className={styles.rightColumn}>
                <CodeBlock language="ts">{quickStartCode}</CodeBlock>
            </div>
        </div>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Declarative, decorator-driven request data handling for Express.js.">
            <main className={styles.mainContent}>
                <TwoColumnLayout />
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
