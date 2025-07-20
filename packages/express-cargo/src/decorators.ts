import { getFieldMetadata, setFieldMetadata } from './metadata'

export function optional(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => { 
     const meta = getFieldMetadata(target, propertyKey);
     meta.optional = true;
     setFieldMetadata(target, propertyKey, meta);
  };
}
