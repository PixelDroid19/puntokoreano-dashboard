import { Form, Input, InputNumber } from "antd";
import { useState, useEffect } from "react";

interface LocationTabProps {
  form: any;
  onFieldChange?: (fieldPath: string) => void;
}

const LocationTab = ({ form, onFieldChange }: LocationTabProps) => {
  const [mapUrl, setMapUrl] = useState<string>("");

  // Observar cambios en la URL del mapa y cargar valor inicial
  useEffect(() => {
    const currentValue = form.getFieldValue(['location', 'mapUrl']);
    setMapUrl(currentValue || "");
  }, [form]);

  // Cargar valor inicial cuando el formulario se actualice
  useEffect(() => {
    const unsubscribe = form.getFieldsValue();
    if (unsubscribe?.location?.mapUrl) {
      setMapUrl(unsubscribe.location.mapUrl);
    }
  }, [form.getFieldsValue()]);

  // Función para convertir URL de Google Maps a embed
  const getEmbedUrl = (url: string) => {
    if (!url || !url.includes('google.com/maps')) return "";
    
    try {
      // Si ya es una URL embed, devolverla tal como está
      if (url.includes('/embed')) {
        return url;
      }
      
      // Extraer coordenadas o lugar de diferentes formatos de URL
      let embedUrl = "";
      
      if (url.includes('@')) {
        // Formato: https://www.google.com/maps/@lat,lng,zoom
        const match = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) {
          const [, lat, lng] = match;
          embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15904.29307286465!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sco!4v1600000000000!5m2!1sen!2sco`;
        }
      } else if (url.includes('place/')) {
        // URL de lugar específico: https://www.google.com/maps/place/...
        try {
          const placeMatch = url.match(/place\/([^\/]+)/);
          if (placeMatch) {
            const placeName = encodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
            embedUrl = `https://www.google.com/maps/embed/v1/place?key=&q=${placeName}`;
          }
        } catch (e) {
          // Fallback: usar la URL base de embed
          embedUrl = url.replace(/maps\.google\.com\/maps/, 'maps.google.com/maps/embed');
        }
      } else if (url.includes('search/')) {
        // URL de búsqueda: https://www.google.com/maps/search/...
        try {
          const searchMatch = url.match(/search\/([^\/]+)/);
          if (searchMatch) {
            const searchTerm = encodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
            embedUrl = `https://www.google.com/maps/embed/v1/search?key=&q=${searchTerm}`;
          }
        } catch (e) {
          embedUrl = url.replace(/maps\.google\.com\/maps/, 'maps.google.com/maps/embed');
        }
      } else {
        // Fallback genérico: intentar convertir cualquier URL de maps
        embedUrl = url.replace(/maps\.google\.com\/maps/, 'maps.google.com/maps/embed');
        
        // Si no funciona, usar modo básico
        if (!embedUrl.includes('/embed')) {
          embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976!2d-74.08175!3d4.60971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sco!4v1600000000000!5m2!1sen!2sco`;
        }
      }
      
      return embedUrl;
    } catch (error) {
      console.warn('Error al convertir URL de Google Maps:', error);
      return "";
    }
  };
  return (
    <div className="space-y-6 p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Información de Ubicación
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dirección Completa <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name={["location", "address"]}
            rules={[{ required: true, message: "La dirección es requerida" }]}
            className="mb-0"
          >
            <Input
              placeholder="Calle, Número, Ciudad, País"
              className="h-10"
              onChange={() => onFieldChange?.("location.address")}
            />
          </Form.Item>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URL de Google Maps <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name={["location", "mapUrl"]}
            rules={[
              { required: true, message: "La URL del mapa es requerida" },
              { type: "url", message: "Por favor ingresa una URL válida" },
            ]}
            className="mb-0"
          >
            <Input
              placeholder="https://maps.google.com/..."
              className="h-10"
              onChange={(e) => {
                setMapUrl(e.target.value);
                onFieldChange?.("location.mapUrl");
              }}
            />
          </Form.Item>
        </div>

        {/* Previsualización del Mapa */}
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Previsualización del Mapa
          </label>
          {mapUrl && getEmbedUrl(mapUrl) ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <iframe
                src={getEmbedUrl(mapUrl)}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Previsualización del Mapa"
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
              <div className="text-gray-400 text-lg mb-2">🗺️</div>
              <p className="text-gray-500 text-sm">
                {mapUrl && !getEmbedUrl(mapUrl) 
                  ? "URL de Google Maps no válida. Asegúrate de usar una URL que contenga 'google.com/maps'"
                  : "Ingresa una URL de Google Maps para ver la previsualización"
                }
              </p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {mapUrl && getEmbedUrl(mapUrl)
              ? "Esta es una previsualización de cómo se verá el mapa en el sitio web"
              : "Formatos compatibles: URLs de lugar, búsqueda, coordenadas o embed de Google Maps"
            }
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Coordenadas Geográficas <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name={["location", "coordinates", "lat"]}
              rules={[{ required: true, message: "Latitud requerida" }]}
              className="mb-0"
            >
              <InputNumber
                placeholder="Latitud (ej: 4.60971)"
                className="w-full h-10"
                min={-90}
                max={90}
                step={0.000001}
                onChange={() => onFieldChange?.("location.coordinates.lat")}
              />
            </Form.Item>
            <Form.Item
              name={["location", "coordinates", "lng"]}
              rules={[{ required: true, message: "Longitud requerida" }]}
              className="mb-0"
            >
              <InputNumber
                placeholder="Longitud (ej: -74.08175)"
                className="w-full h-10"
                min={-180}
                max={180}
                step={0.000001}
                onChange={() => onFieldChange?.("location.coordinates.lng")}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTab; 