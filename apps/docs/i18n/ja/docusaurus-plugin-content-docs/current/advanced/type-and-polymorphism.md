---
id: type-and-polymorphism
title: 型変換とポリモーフィズム
---

`@Type` デコレータは、プレーンな JSON オブジェクトを実際のクラスインスタンスに変換するための強力なツールです。

型安全性の維持、クラスメソッドの活用、ネストされたオブジェクトやポリモーフィックな配列などの複雑なデータ構造の処理に不可欠です。

## 基本的なネストマッピング

プロパティが別のクラスのインスタンスである必要がある場合、`@Type` を使用してターゲットクラスを指定します。

```typescript
import { Body, Type } from 'express-cargo';

class Profile {
  @Body()
  bio!: string;
}

class User {
  @Body()
  name!: string;

  @Body()
  @Type(() => Profile) // 自動的に Profile インスタンスに変換
  profile!: Profile;
}
```

## 循環依存の解決

2 つのクラスが互いに参照する場合（例: `User` が多数の `Posts` を持ち、`Post` が `Author` に属する）、直接参照を使用するとクラスがまだ定義されていないため `ReferenceError` が発生します。

これを解決するには、**Thunk（アロー関数）**を使用してクラスの解決を遅延させます。

```typescript
class Post {
    @Body()
    title!: string;

    @Body()
    @Type(() => User) // "User is not defined" エラーを避けるため遅延解決
    author!: User;
}

class User {
    @Body()
    name!: string;

    /**
     * @Type はメタデータを通じて配列型を自動検出します。
     * 明示的な @List(Post) デコレータは不要です。
     */
    @Body()
    @Type(() => Post)
    posts!: Post[];
}
```

## 動的型解決

`@Type` の最も高度な機能は、受信データに基づいてランタイムでターゲットクラスを決定することです。これは継承とポリモーフィズムの処理に特に便利です。

### 関数リゾルバ

データを検査して適切なクラスを返す関数を渡すことができます。

```typescript
class Example {
    @Type((data) => {
        if (data.type === 'video') return Video;
        if (data.type === 'image') return Image;
        return DefaultMedia;
    })
    featuredMedia!: Video | Image | DefaultMedia;
}
```

### 構造的ディスクリミネータ

よりクリーンで宣言的なアプローチとして、`discriminator` オプションを使用して特定のプロパティ値をそれぞれのクラスにマッピングします。

```typescript
class Example {
    @Type(() => Media, {
        discriminator: {
            property: 'kind',
            subTypes: [
                { name: 'v', value: Video },
                { name: 'i', value: Image },
            ],
        },
    })
    gallery!: (Video | Image)[];
}
```