---
id: type-and-polymorphism
title: 타입 변환 & 다형성
---

`@Type` 데코레이터는 일반 JSON 객체를 실제 클래스 인스턴스로 변환하는 강력한 도구입니다.

타입 안전성을 유지하고, 클래스 메서드를 활용하며, 중첩 객체나 다형성 배열과 같은 복잡한 데이터 구조를 처리하는 데 필수적입니다.

## 기본 중첩 매핑

속성이 다른 클래스의 인스턴스여야 하는 경우, `@Type`을 사용하여 대상 클래스를 지정합니다.
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
  @Type(() => Profile) // 자동으로 Profile 인스턴스로 변환
  profile!: Profile;
}
```

## 순환 참조 해결

두 클래스가 서로를 참조하는 경우(예: `User`가 여러 `Posts`를 가지고, `Post`가 `Author`에 속하는 경우), 직접 참조를 사용하면 클래스가 아직 정의되지 않았기 때문에 `ReferenceError`가 발생합니다.

이를 해결하려면 **Thunk(화살표 함수)**를 사용하여 클래스 해석을 지연시킵니다.
```typescript
class Post {
    @Body()
    title!: string;

    @Body()
    @Type(() => User) // "User is not defined" 오류를 방지하기 위해 지연 해석
    author!: User;
}

class User {
    @Body()
    name!: string;

    /**
     * @Type은 메타데이터를 통해 배열 타입을 자동으로 감지합니다.
     * 명시적인 @List(Post) 데코레이터가 필요하지 않습니다.
     */
    @Body()
    @Type(() => Post)
    posts!: Post[];
}
```

## 동적 타입 해석

`@Type`의 가장 고급 기능은 수신 데이터를 기반으로 런타임에 대상 클래스를 결정하는 것입니다. 이는 상속과 다형성을 처리할 때 특히 유용합니다.

### 함수형 리졸버

데이터를 검사하고 적절한 클래스를 반환하는 함수를 전달할 수 있습니다.
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

### 구조적 판별자

보다 깔끔하고 선언적인 접근 방식을 위해, `discriminator` 옵션을 사용하여 특정 속성 값을 해당 클래스에 매핑할 수 있습니다.
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