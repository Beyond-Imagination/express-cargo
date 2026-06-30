## 安装

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

## 要求

- Node.js 20+
- 已启用 TypeScript


### tsconfig.json

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```
