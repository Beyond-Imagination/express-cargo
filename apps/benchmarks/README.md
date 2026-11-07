# express-cargo 벤치마크

express-cargo를 zod, class-validator + class-transformer와 같은 요청 스키마로 비교합니다.
측정 전에 세 라이브러리가 공통 검증 44건에서 같은 응답을 내는지 먼저 확인합니다.

## 폴더 구조

```
src/
├── http/
│   ├── app.ts
│   ├── benchmark.ts
│   └── order.ts
├── inline/
│   └── benchmark.ts
├── version/
│   └── compare.ts
└── testcase/
    ├── libraries/
    │   ├── express-cargo/
    │   ├── zod/
    │   └── class-validator/
    ├── scenarios/
    └── common/
```

| 폴더                 | 역할                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `http`               | 실제 HTTP 요청으로 측정합니다. Express 앱, 라이브러리 비교, 측정 순서 비교가 있습니다.                    |
| `inline`             | HTTP 없이 express-cargo 미들웨어를 직접 호출해 바인딩 비용만 측정합니다.                                  |
| `version`            | express-cargo의 두 git ref를 HTTP와 직접 호출로 측정해 비교합니다.                                        |
| `testcase`           | 위 측정들이 함께 쓰는 코드입니다.                                                                         |
| `testcase/libraries` | 라이브러리별 폴더입니다. `routes.ts`에 시나리오별 라우트를, `types.ts`에 DTO 또는 스키마를 선언합니다.    |
| `testcase/scenarios` | 측정 케이스별 파일입니다. 각 파일에 요청·응답 타입, 실제 값, 라우트를 선언합니다. 공통 정규식도 있습니다. |
| `testcase/common`    | 옵션 파싱, 결과 집계, 라이브러리가 만들어야 할 파싱 결과 타입입니다.                                      |

## 명령어

`apps/benchmarks`에서 실행합니다. 모든 명령은 `express-cargo`와 벤치마크 앱을 먼저 빌드합니다.

| 명령어                                                                                                           | 측정 내용                                                        |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm benchmark:http [calls=1000] [concurrency=1000] [rounds=3]`                                                 | 시나리오·라이브러리별 HTTP 처리량과 지연 (라운드 중앙값)         |
| `pnpm benchmark:http:order [rounds=2] [calls=20000] [concurrency=1000]`                                          | 측정 순서 6가지를 모두 실행해 측정 위치가 결과에 주는 영향 확인  |
| `pnpm benchmark:inline [calls=20000] [samples=7]`                                                                | express-cargo 미들웨어 직접 호출                                 |
| `pnpm benchmark:version <base ref> <target ref> [rounds=6] [calls=20000] [concurrency=1000] [--inline-rounds=3]` | 같은 앱에서 express-cargo의 두 git ref를 HTTP와 직접 호출로 비교 |
| `pnpm test`                                                                                                      | 측정 없이 공통 검증만 실행                                       |
| `pnpm start`                                                                                                     | 벤치마크 서버만 실행                                             |

## 옵션과 동작

- **측정 순서:** `benchmark:http`는 라운드마다 라이브러리와 시나리오의 순서를 돌려가며 측정합니다.
  `--order=zod,express-cargo,class-validator`를 지정하면 모든 라운드에서 라이브러리 순서를 고정합니다.
- **결과 저장:** `--json=<file>`을 지정하면 중앙값 요약을 HTML 리포트와 함께 저장합니다.
- **포트:** `http/app.ts`를 불러오면 서버가 바로 시작됩니다. 기본 포트는 3001이고 `PORT`로 바꿀 수 있습니다.
  `pnpm start`를 켜 둔 채 HTTP 측정을 실행하면 `EADDRINUSE`로 실패합니다.
- **버전 비교:** `benchmark:version`은 각 ref의 `packages/express-cargo/src`를 `dist/cjs`로 컴파일하고, 끝나면 작업
  트리 기준으로 다시 빌드합니다. 먼저 실행하는 빌드는 라운드마다 번갈아 바뀝니다. 앱은 항상 작업 트리의 코드를 쓰므로,
  두 ref 모두 `src/testcase/libraries/express-cargo/`가 import하는 것을 export해야 합니다.

결과는 현재 디렉터리의 `benchmark-results-*`에 저장되며 git에서 제외됩니다.
