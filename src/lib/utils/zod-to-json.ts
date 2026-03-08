import { z } from 'zod';

export interface FieldSchema {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // for enums
  min?: number;
  max?: number;
  defaultValue?: any;
}

export function zodToJsonSchema(schema: z.ZodObject<any>): FieldSchema[] {
  const fields: FieldSchema[] = [];
  const shape = schema.shape;

  for (const [name, rawDef] of Object.entries(shape)) {
    let def = rawDef as any;
    const field: FieldSchema = {
      name,
      type: 'string',
      label: name,
      required: true,
    };

    // Unwrap ZodDefault — check _def.type or instanceof
    if (def instanceof z.ZodDefault) {
      field.defaultValue = def._def.defaultValue;
      field.required = false;
      def = def._def.innerType;
    }

    // Unwrap ZodOptional
    if (def instanceof z.ZodOptional) {
      field.required = false;
      def = def._def.innerType;
    }

    // Extract description (Zod v4 stores it via globalRegistry, accessible as .description getter)
    if (def.description) {
      field.description = def.description;
      field.label = def.description;
    }

    // Determine type and extract metadata
    if (def instanceof z.ZodString) {
      field.type = 'string';
    } else if (def instanceof z.ZodNumber) {
      field.type = 'number';
      // Zod v4 exposes minValue/maxValue directly on the instance
      if (def.minValue != null) {
        field.min = def.minValue;
      }
      if (def.maxValue != null) {
        field.max = def.maxValue;
      }
    } else if (def instanceof z.ZodEnum) {
      field.type = 'enum';
      // Zod v4: .options returns Array<T[keyof T]>
      field.options = def.options as string[];
    } else if (def instanceof z.ZodBoolean) {
      field.type = 'boolean';
    }

    fields.push(field);
  }

  return fields;
}
