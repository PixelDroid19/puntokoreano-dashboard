/**
 * Reemplaza los parámetros de una URL con los valores proporcionados.
 *
 * @param url La URL base.
 * @param params Un objeto con los valores de los parámetros.
 * @param mapping (Opcional) Mapeo de nombres a placeholders.
 * @param options (Opcional) Opciones.
 * @param options.defaultValue Valor por defecto si un parámetro falta.
 * @param options.throwOnMissing Si es `true`, lanza un error si falta.
 * @param options.arraySeparator Separador para arrays (por defecto, ",").
 * @param options.removeEmptyPlaceholders Si es `true`, elimina placeholders.
 * @returns La URL con los parámetros reemplazados.
 * @throws {Error} Si `options.throwOnMissing` y falta un parámetro.
 */
function replaceUrlParams(
  url: string,
  params: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >,
  mapping: Record<string, string | string[]> = {},
  options: {
    defaultValue?: string | number | boolean;
    throwOnMissing?: boolean;
    arraySeparator?: string;
    removeEmptyPlaceholders?: boolean;
  } = {}
): string {
  const {
    defaultValue = "",
    throwOnMissing = false,
    arraySeparator = ",",
    removeEmptyPlaceholders = false,
  } = options;

  // Validación de params y mapping
  const isValidKey = (key: string) => /^[a-zA-Z_]\w*$/.test(key);
  if (!Object.keys(params).every(isValidKey)) {
    throw new Error("Invalid parameter names in 'params'.");
  }
  if (!Object.keys(mapping).every(isValidKey)) {
    throw new Error("Invalid parameter names in 'mapping'.");
  }

  // 1. Mapeo inverso optimizado (usa Set y Object.entries):
  const reverseMapping: Record<string, Set<string>> = {};
  Object.entries(mapping).forEach(([key, mappedValue]) => {
    const placeholders = Array.isArray(mappedValue)
      ? mappedValue
      : [mappedValue];
    placeholders.forEach((placeholder) => {
      if (!reverseMapping[placeholder]) {
        reverseMapping[placeholder] = new Set();
      }
      reverseMapping[placeholder].add(key);
    });
  });

  // Pre-procesamiento de params para codificar valores
  const encodedParams: Record<string, string> = {};
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const value = params[key];
      if (Array.isArray(value)) {
        encodedParams[key] = value
          .map((v) => encodeURIComponent(String(v)))
          .join(arraySeparator);
      } else if (value != null) {
        // Evita null y undefined
        encodedParams[key] = encodeURIComponent(String(value));
      } // Si es null/undefined, no se añade al objeto encodedParams
    }
  }

  // Función auxiliar para manejar un placeholder individual
  const handlePlaceholder = (key: string): string => {
    const mappedKeysSet = reverseMapping[key] || new Set([key]);
    const mappedKeys = Array.from(mappedKeysSet);

    // Función auxiliar para obtener un valor individual, ya pre-procesado
    const getProcessedValue = (mappedKey: string): string => {
      const encodedValue = encodedParams[mappedKey]; // Usa el valor pre-codificado

      if (encodedValue === undefined) {
        // Comprueba si está *definido*
        if (throwOnMissing) {
          throw new Error(
            `Missing parameter: ${mappedKey} (original key: ${key})`
          );
        }
        return removeEmptyPlaceholders ? "" : String(defaultValue ?? `:${key}`);
      }

      return encodedValue; // Retorna el valor pre-codificado
    };

    // Si solo hay una clave mapeada, devuelve el valor procesado.
    if (mappedKeys.length === 1) {
      return getProcessedValue(mappedKeys[0]);
    }

    // Si hay múltiples claves mapeadas, une los valores.
    return mappedKeys.map(getProcessedValue).join(arraySeparator);
  };

  // Reemplaza los placeholders
  let replacedUrl = url.replace(/:([a-zA-Z_]\w*)/g, (match, key) =>
    handlePlaceholder(key)
  );

  // 2. Manejo optimizado de removeEmptyPlaceholders (evita dobles barras):
  if (removeEmptyPlaceholders) {
    replacedUrl = replacedUrl.replace(/\/+/g, "/"); //Mucho mejor que split/filter/join

    //Si luego de la limpieza, no hay path, y la original si, devolvemos "/"
    if (replacedUrl === "" && url.startsWith("/")) {
      return "/";
    }
  }

  return replacedUrl;
}

export default replaceUrlParams;
/* 
// Casos base
console.log(replaceUrlParams('/users/:userId/posts/:postId', { userId: '123', postId: '456' }));
console.log(replaceUrlParams('/users/:userId', { userId: '123' }, { userId: 'id' }));
console.log(replaceUrlParams('/users/:userId', { id: '123' }, { userId: 'id' }));

// Opciones
console.log(replaceUrlParams('/users/:userId/posts/:postId', { userId: '123' }, {}, { defaultValue: 'missing' }));
console.log(replaceUrlParams('/users/:userId/posts/:postId', { userId: '123' }, {}, { defaultValue: 0 }));
console.log(replaceUrlParams('/users/:userId/active/:isActive', { userId: '123' }, {}, { defaultValue: false }));
try { console.log(replaceUrlParams('/users/:userId/posts/:postId', { userId: '123' }, {}, { throwOnMissing: true })); } catch (e) { console.error(e.message); }
console.log(replaceUrlParams('/tags/:tagIds', { tagIds: ['a', 'b'] }, {}, { arraySeparator: '-' }));
console.log(replaceUrlParams('/users/:userId', { userId: '123' }, {}, { removeEmptyPlaceholders: true }));

// encodeURIComponent
console.log(replaceUrlParams('/search/:query', { query: 'hello world' }));
console.log(replaceUrlParams('/file/:path', { path: ['a', 'b c'] }, {}, { arraySeparator: '/' }));

// Mapeo bidireccional
console.log(replaceUrlParams('/users/:id1/:id2', { userId: '123' }, { userId: ['id1', 'id2'] }));
console.log(replaceUrlParams('/:a/:b/:c', { x: 1, y: 2, z: 3 }, { p1: 'a', p2: ['a', 'b'], p3: ['b', 'c'] }));
console.log(replaceUrlParams('/:a/:b/:c', { x: [1, 2], z: "hi" }, { paramBC: ['b', 'c'] }, { arraySeparator: "/", removeEmptyPlaceholders: true }));

// removeEmptyPlaceholders
console.log(replaceUrlParams('/:a/:b/:c', { a: 1 }, { p1: ['a', 'b', 'c'] }, { removeEmptyPlaceholders: true }));
console.log(replaceUrlParams('/users/:userId/posts/:postId', { userId: '123' }, {}, { removeEmptyPlaceholders: true }));
console.log(replaceUrlParams('/users///:userId///posts/:postId/', { userId: '123', postId: "44" }, { removeEmptyPlaceholders: true }))
console.log(replaceUrlParams('/:a/:b/:c/', {}, { p1: ['a', 'b', 'c'] }, { removeEmptyPlaceholders: true }));
console.log(replaceUrlParams('/:a/:b/:c/', {}, { p1: ['a', 'b', 'c'] }, { removeEmptyPlaceholders: true, defaultValue: "x" }));
console.log(replaceUrlParams('/:a/:b/:c', {}, { p1: ['a', 'b', 'c'] }, { removeEmptyPlaceholders: true, defaultValue: "" }));
console.log(replaceUrlParams('/:a', { a: null }, {}, { removeEmptyPlaceholders: true }));

// Combinando opciones
console.log(replaceUrlParams(
  '/:a/:b/:c/:d',
  { x: [1, 2], z: "hi" },
  { paramBC: ['b', 'c'], other: 'd' },
  { defaultValue: "def", arraySeparator: "/", removeEmptyPlaceholders: true }
));

// Casos extremos y defaultValue
console.log(replaceUrlParams('', {}));
console.log(replaceUrlParams('/no-params', { a: 1 }));
console.log(replaceUrlParams('/:a', { a: null }, {}, { defaultValue: "test" }));
console.log(replaceUrlParams('/:a', { a: null }, {}, { removeEmptyPlaceholders: true }));
console.log(replaceUrlParams('/:a', { a: null }, {}, { defaultValue: 0 }));
console.log(replaceUrlParams('/:a', { a: null }, {}, { defaultValue: false }));
console.log(replaceUrlParams('/:a', { a: null }, {}, { removeEmptyPlaceholders: true, defaultValue: 0 }));
console.log(replaceUrlParams('/:a', { a: null }, {}, { removeEmptyPlaceholders: true, defaultValue: false }));
console.log(replaceUrlParams('/users/:userId/posts/:postId', {}, { removeEmptyPlaceholders: true, defaultValue: '' }));
console.log(replaceUrlParams('/users/:userId/posts/:postId', {}, { defaultValue: '' }));
console.log(replaceUrlParams('/users/:userId/posts/:postId', {}, { defaultValue: 0 }));
console.log(replaceUrlParams('/', {}, { removeEmptyPlaceholders: true }));
console.log(replaceUrlParams('/', {}, { removeEmptyPlaceholders: true, defaultValue: 123 }));

//Validación de keys
try { console.log(replaceUrlParams('/:a', { '1a': 1 })); } catch (e) { console.error(e.message); }
try { console.log(replaceUrlParams('/:a', { a: 1 }, { '1b': 'a' })); } catch (e) { console.error(e.message); } */
