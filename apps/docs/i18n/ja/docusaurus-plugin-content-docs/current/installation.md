## インストール

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="package-manager">
    <TabItem value="npm" label="npm">
        ```
        npm install express-cargo reflect-metadata
        ```
    </TabItem>
    <TabItem value="yarn" label="yarn">
        ```
        yarn add express-cargo reflect-metadata
        ```
    </TabItem>
    <TabItem value="pnpm" label="pnpm">
        ```
        pnpm add express-cargo reflect-metadata
        ```
    </TabItem>
</Tabs>

## 要件

- Node.js 20+
- TypeScript 有効化


### tsconfig.json
```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```