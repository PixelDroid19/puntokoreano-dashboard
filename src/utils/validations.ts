// src/utils/validations.ts

export const yearValidationRules = [
    { required: true, message: 'El año es requerido' },
    {
      pattern: /^\d{4}$/,
      message: 'Debe ser un año válido (YYYY)'
    },
    {
      validator: async (_: any, value: string) => {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear + 1) {
          throw new Error(`El año debe estar entre 1900 y ${currentYear + 1}`);
        }
      }
    }
  ];
  
  export const nameValidationRules = [
    { required: true, message: 'El nombre es requerido' },
    { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
    { max: 50, message: 'El nombre no puede exceder 50 caracteres' },
    {
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
      message: 'Solo se permiten letras y espacios'
    }
  ];
  
  export const modelValidationRules = [
    { required: true, message: 'El modelo es requerido' },
    { min: 2, message: 'El modelo debe tener al menos 2 caracteres' },
    { max: 50, message: 'El modelo no puede exceder 50 caracteres' },
    {
      pattern: /^[a-zA-Z0-9À-ÿ\s\-_.]+$/,
      message: 'Caracteres no válidos en el modelo'
    }
  ];