```typescript
import express from 'express';
import { body, bindingCargo, getCargo } from 'express-cargo';

class CreateUserRequest {
    @body('email')
    email!: string;

    @body('age')
    age!: number;
}

const app = express();
app.use(express.json());

app.post('/users', bindingCargo(CreateUserRequest), (req, res) => {
    const data = getCargo<CreateUserRequest>(req);
    res.json({ message: 'User created', data });
});
```
