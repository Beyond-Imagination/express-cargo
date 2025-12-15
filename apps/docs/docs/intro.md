# Introduction to express-cargo

## Overview

express-cargo is a lightweight middleware library
designed for web application development based on the Express.js framework.
This library leverages the decorator pattern to provide class-based request data binding and validation functionalities.
It enables the automatic mapping of diverse data formats received via HTTP requests (Request)
to developer-defined classes,
and simultaneously facilitates streamlined validation of this data.

## Why express-cargo?

While Express.js offers a flexible architecture, 
challenges related to repetitive tasks and maintenance can arise during the request data processing.
express-cargo addresses these development challenges, 
thereby enhancing development efficiency and code robustness.

### 1. Reduction of Boilerplate Code

- **Challenges with Traditional Approach**: In an Express.js environment, extracting data from `req.body`, `req.query`,
  `req.params`, `req.headers`, and repeatedly implementing type checking and validation logic within each route handler
  leads to code duplication and decreased productivity.
- **express-cargo's Solution**: express-cargo utilizes decorators to declaratively define data extraction and mapping
  logic within Request classes. Developers can focus on declaring data sources, minimizing repetitive data processing
  code, and thereby improving productivity.

### 2. Enhanced Type Safety and Readability

- **Challenges with Traditional Approach**: In a JavaScript environment, the type reliability of request data is low,
  and even in a TypeScript environment, manual type assertions carry the risk of runtime errors. Furthermore, the
  intertwining of data processing logic and business logic often detracts from code readability.
- **express-cargo's Solution**: By performing automatic data mapping and type conversion based on the types declared in
  Request classes, express-cargo enables early detection of type errors during compilation and strengthens runtime
  stability. Clearly defined DTO classes intuitively represent the expected input structure for an API, enhancing code
  readability.

### 3. Structured Validation and Consistent Error Handling

- **Challenges with Traditional Approach**: When data validation logic is dispersed across multiple controllers,
  maintenance becomes challenging, and applying a consistent error handling strategy becomes complex.
- **express-cargo's Solution**: express-cargo provides built-in and custom validation decorators, allowing validation
  rules to be declaratively defined within Request classes. Automatic validation is performed during the request data
  binding process, and in case of validation failure, user-definable error handling provides consistent and predictable
  responses.

## ✨ Key Features

- Class-based request binding
- Built-in and custom validation decorators
- Support for nested objects
- Automatic type casting
- Support for virtual fields and computed values
- Customizable error handling

> A lightweight middleware for Express that enables class-based request binding and validation using decorators.

express-cargo contributes to alleviating the burden of repetitive tasks, improving code quality and stability, and
allowing developers to concentrate on implementing core business logic within the Express.js development environment.
Experience robust and efficient application development with Express.js using express-cargo.
