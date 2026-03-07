---
id: getting-started
title: Начало работы
---

## 🚀 Начало работы с express-cargo
Этот документ содержит руководство по минимальной конфигурации для **быстрого ознакомления с express-cargo в среде TypeScript + Express**.
Примеры основаны на **pnpm + Node.js 18 или новее**.

---

### 1. Требования

- Node.js **18 или новее (рекомендуется LTS)**

Менеджер пакетов: npm | yarn | pnpm
→ В этом документе используется pnpm.

> Поскольку express-cargo использует декораторы и метаданные, рекомендуется использовать TypeScript.

---

### 2. Установка Node.js
Установите версию LTS, подходящую для вашей ОС, с официального сайта ниже.

- Официальный сайт загрузки Node.js
    https://nodejs.org


Проверьте установку:
```shell
node -v
pnpm -v
```
В случае успеха будет отображена версия.

---

### 3. Создание нового проекта (pnpm)
#### pnpm
```shell
mkdir express-cargo-example
cd express-cargo-example
pnpm init
```

### 4. Настройка среды TypeScript
#### 4-1. Установка TypeScript и зависимостей для разработки
```shell
pnpm add -D typescript ts-node @types/node
```

#### 4-2. Создание tsconfig.json
```shell
pnpm tsc --init
```
#### 4-3. Рекомендуемые настройки tsconfig
```json
{
  "compilerOptions": {
    ...,
    "experimentalDecorators": true,     // требуется для express-cargo
    "emitDecoratorMetadata": true,      // использовать метаданные типов
    ...
  },
  ...
}
```

>⚠️ Без `experimentalDecorators` и `emitDecoratorMetadata` валидация/преобразование в express-cargo работать не будут.

---

### 5. Установка express и express-cargo
```shell
pnpm add express express-cargo
pnpm add -D @types/express
pnpm add reflect-metadata
```

---

### 6. Базовый сервер + настройки express-cargo
#### 6-1. `src/app.ts`

```typescript
import express from 'express'
import { bindingCargo, getCargo, Body, Query, Header, Params, Min, Max, Equal, NotEqual, Prefix, Suffix } from 'express-cargo'
import errorHandlerRouter from './errorHandler'

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(errorHandlerRouter)

app.listen(port, () => {console.log(`Пример приложения запущен на порту ${port}`)})

class ExampleRequest {
  @Body() // Извлечение полей из тела запроса
  @Equal('1') // Если значение не равно "1", возникает ошибка валидации
  id!: string
}

app.post('/example', bindingCargo(ExampleRequest), (req, res) => { // bindingCargo(Class): Запрос → Преобразование в DTO + валидация
  const cargo = getCargo<ExampleRequest>(req) // Возврат валидированного типобезопасного объекта
  res.json(cargo)
})
```

### 7. Запуск
```shell
npm run dev
```
Тестовый запрос:

```
POST http://localhost:3000/example
Content-Type: application/json

{
  "id": "1"
}

```

Ответ:

```
{ "id": "1" }
```

- ❌ `"id": "2"` → Возникает ошибка валидации
