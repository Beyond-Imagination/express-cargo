---
title: よくある質問
sidebar_label: よくある質問
---

ライブラリの使用に関するよくある質問への回答を掲載しています。質問をクリックすると回答が表示されます。

### 1. はじめに

<details>
<summary><b>Q: express-cargo プロジェクトとは何ですか？</b></summary>

**A:** Express.js における繰り返しで面倒なリクエストデータ処理（`req.body`、`req.query` など）を、クラスベースのアプローチで自動化するために設計されたミドルウェアです。TypeScript デコレータを活用することで、データバインディングとバリデーションを一箇所で宣言的に処理できます。
</details>

<details>
<summary><b>Q: インストール時の注意点はありますか？</b></summary>

**A:** **Node.js バージョン 20 以上**を推奨します。既存の Express プロジェクトに標準ミドルウェアとして柔軟に統合できるよう設計されています。
</details>

<details>
<summary><b>Q: TypeScript の設定は必須ですか？</b></summary>

**A:** はい。デコレータを使用するため、`tsconfig.json` で以下の 2 つのオプションを `true` に設定する必要があります：
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

また、ランタイムで型情報を読み取るために `reflect-metadata` パッケージのインストールが必要です。
</details>

### 2. データバインディング & デコレータ

<details>
<summary><b>Q: `@Body` と `@Query` の違いは何ですか？</b></summary>

**A:** データの抽出元が異なります：
- **`@Body`**: HTTP リクエストボディからデータを抽出します。主に `POST` や `PUT` リクエストで使用されます。
- **`@Query`**: URL クエリ文字列（例: `?id=1&name=test`）からパラメータを抽出します。主に `GET` リクエストでのフィルタリングやソートに使用されます。
- `@Params()`（または `@Uri()`）、`@Header()`、`@Session()` を使用して、他のリクエストデータもバインドできます。
</details>

<details>
<summary><b>Q: @Uri() とは何ですか？@Params() と異なりますか？</b></summary>

**A:** `@Uri()` は `@Params()` の**エイリアス**です。URL パスパラメータ（例: `/:id`）をバインドする際に、可読性の好みに応じて選択できます。
</details>

<details>
<summary><b>Q: バインドされたデータはどのように取得しますか？</b></summary>

**A:** ルーターで `bindingCargo(ClassName)` ミドルウェアを通過させた後、ハンドラ内で `getCargo<ClassName>(req)` 関数を呼び出すことでインスタンスを取得できます。
</details>

### 3. バリデーション & トランスフォーメーション

<details>
<summary><b>Q: バリデーション失敗時はどのように処理されますか？</b></summary>

**A:** `@Min`、`@Max`、`@Length` などのデコレータを使用して内部的にバリデーションが実行されます。無効なデータが検出されると、ミドルウェアは自動的にエラーレスポンスを返すか、例外をスローします。
</details>

<details>
<summary><b>Q: フィールドの値を加工・変換するにはどうすればよいですか？</b></summary>

**A:** **`@Transform()`** デコレータを使用します。例えば、`@Transform(v => v.trim())` と記述することで、バインディング前に入力データを希望の形式に変換できます。
</details>

<details>
<summary><b>Q: 特定のフィールドが存在しない場合にエラーを回避するには？</b></summary>

**A:** **`@Optional()`** デコレータを使用します。値が `null` または `undefined` でもフィールドは正常にバインドされ、そのフィールドのバリデーションはスキップされます。
</details>

### 4. フレームワーク互換性

<details>
<summary><b>Q: Fastify や NestJS で使用できますか？</b></summary>

**A:** このライブラリは **Express.js 専用ミドルウェア**として設計されています。
- **NestJS**: NestJS には独自の `ValidationPipe` やデコレータがあり、機能が重複する場合があります。Express アダプターを使用すれば技術的には可能ですが、このライブラリの主な目的は純粋な Express 環境での DX 向上です。
- **Fastify**: 現在、公式にはサポートされていません。
</details>

### 5. トラブルシューティング

<details>
<summary><b>Q: クラスインスタンスのデータが `undefined` を返すのはなぜですか？</b></summary>

**A:** 以下の 2 点をご確認ください：
- `express.json()` などのボディパースミドルウェアが `bindingCargo` の**前**に宣言されていますか？
- `reflect-metadata` がアプリケーションのエントリポイントの最上部でインポートされていますか？
</details>

<details>
<summary><b>Q: 自動型変換は行われますか？</b></summary>

**A:** はい。クラスフィールドで定義された型（`string`、`number`、`boolean` など）に基づいて、値の自動変換を試みます。例えば、`@Query()` から取得した文字列 `"123"` は、フィールドの型が `number` として定義されている場合、自動的に数値に変換されます。
</details>

### 6. その他

<details>
<summary><b>Q: 商用プロジェクトで無料で使用できますか？</b></summary>

**A:** このライブラリは **MIT ライセンス**で提供されています。商用目的でも自由に使用、変更、配布することができます。
</details>