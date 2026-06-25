---
id: type-and-polymorphism
title: 类型转换与多态
---

`@Type` 装饰器是一个强大的工具，用于将普通 JSON 对象转换为真实的类实例。

它对于保持类型安全、使用类方法，以及处理嵌套对象和多态数组等复杂数据结构非常重要。

## 基础嵌套映射

当某个属性需要成为另一个类的实例时，使用 `@Type` 指定目标类。

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
  @Type(() => Profile) // 自动转换为 Profile 实例
  profile!: Profile;
}
```

## 解决循环依赖

如果两个类互相引用（例如 `User` 拥有多个 `Posts`，而 `Post` 属于一个 `Author`），直接引用会导致 `ReferenceError`，因为类可能尚未定义。

要解决这个问题，请使用 **Thunk（箭头函数）** 延迟类解析。

```typescript
class Post {
    @Body()
    title!: string;

    @Body()
    @Type(() => User) // 延迟解析，避免 "User is not defined" 错误
    author!: User;
}

class User {
    @Body()
    name!: string;

    /**
     * @Type 会通过元数据自动检测数组类型。
     * 不需要显式的 @List(Post) 装饰器。
     */
    @Body()
    @Type(() => Post)
    posts!: Post[];
}
```

## 动态类型解析

`@Type` 最高级的能力是根据传入数据在运行时确定目标类。这在处理继承和多态时尤其有用。

### 函数式解析器

你可以传入一个函数，检查数据并返回合适的类。

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

### 结构化判别器

如果想使用更清晰、更声明式的方式，可以使用 `discriminator` 选项，将特定属性值映射到对应的类。

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
