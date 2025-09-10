import Translate from '@docusaurus/Translate';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: ReactNode;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: <Translate id="theme.homepage.feature.declarative.title">Declarative Data Binding</Translate>,
    description: (
      <Translate id="theme.homepage.feature.declarative.description">
        Effortlessly bind request data (body, query, params) to class instances using intuitive decorators, ensuring clean and focused routing logic.
      </Translate>
    ),
  },
  {
    title: <Translate id="theme.homepage.feature.validation.title">Robust Data Validation</Translate>,
    description: (
      <Translate id="theme.homepage.feature.validation.description">
        Utilize a rich set of built-in decorators for effortless data validation, ensuring integrity before processing.
      </Translate>
    ),
  },
  {
    title: <Translate id="theme.homepage.feature.typeSafe.title">Type-Safe & Extensible</Translate>,
    description: (
      <Translate id="theme.homepage.feature.typeSafe.description">
        Built with TypeScript for full type safety, allowing you to extend the library with custom decorators and transformers.
      </Translate>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}