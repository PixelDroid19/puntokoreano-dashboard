// src/utils/filters.ts
export const formatValue = (str) => {
    return str.toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_');
};
export const validateYear = (year) => {
    if (!year)
        return false;
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 1;
};
export const validateDependentFields = (form, yearIndex, fieldType) => {
    const yearGroup = form.getFieldValue(['yearGroups', yearIndex]);
    switch (fieldType) {
        case 'transmissions':
            return yearGroup?.models?.length > 0;
        case 'fuels':
            return yearGroup?.transmissions?.length > 0;
        case 'lines':
            return yearGroup?.fuels?.length > 0;
        default:
            return false;
    }
};
export const validationRules = {
    year: [
        { required: true, message: 'El año es requerido' },
        {
            pattern: /^\d{4}$/,
            message: 'Debe ser un año válido (YYYY)'
        },
        {
            validator: (_, value) => {
                if (!validateYear(value)) {
                    return Promise.reject(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`);
                }
                return Promise.resolve();
            }
        }
    ],
    familyName: [
        { required: true, message: 'El nombre de familia es requerido' },
        { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
        { max: 50, message: 'El nombre no puede exceder 50 caracteres' },
        {
            pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
            message: 'Solo se permiten letras y espacios'
        }
    ],
    model: [
        { required: true, message: 'El modelo es requerido' },
        { min: 2, message: 'El modelo debe tener al menos 2 caracteres' },
        { max: 50, message: 'El modelo no puede exceder 50 caracteres' },
        {
            pattern: /^[a-zA-Z0-9À-ÿ\s\-_.]+$/,
            message: 'Solo se permiten letras, números, espacios y guiones'
        }
    ],
    transmission: [
        { required: true, message: 'La transmisión es requerida' },
        { min: 2, message: 'La transmisión debe tener al menos 2 caracteres' },
        { max: 50, message: 'La transmisión no puede exceder 50 caracteres' }
    ],
    fuel: [
        { required: true, message: 'El combustible es requerido' },
        { min: 2, message: 'El combustible debe tener al menos 2 caracteres' },
        { max: 50, message: 'El combustible no puede exceder 50 caracteres' }
    ],
    line: [
        { required: true, message: 'La línea es requerida' },
        { min: 2, message: 'La línea debe tener al menos 2 caracteres' },
        { max: 100, message: 'La línea no puede exceder 100 caracteres' }
    ],
    select: {
        model: [{ required: true, message: 'Debe seleccionar un modelo' }],
        transmission: [{ required: true, message: 'Debe seleccionar una transmisión' }],
        fuel: [{ required: true, message: 'Debe seleccionar un combustible' }]
    }
};
