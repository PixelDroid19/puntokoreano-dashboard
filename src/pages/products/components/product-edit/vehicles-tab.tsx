import type React from "react"
import { useEffect, useState } from "react"
import { Form, Card, Tag, Divider, Alert, Typography, Space, Button, notification } from "antd"
import { CarOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined, GroupOutlined, BulbOutlined, WarningOutlined } from "@ant-design/icons"
import { Product } from "../../../../api/types"
import VehicleSelector from "../../../vehicle-manager/selectors/vehicle-selector"
import ApplicabilityGroupSelector from "../../../vehicle-manager/selectors/applicability-group-selector"

const { Title, Text } = Typography

interface VehiclesTabProps {
  productData: Product | undefined
  form: any // Añadir el formulario como prop
}

const VehiclesTab: React.FC<VehiclesTabProps> = ({ productData, form }) => {
  const [vehicleCompatibilityWarnings, setVehicleCompatibilityWarnings] = useState<{
    hasIndividualVehicles: boolean;
    hasApplicabilityGroups: boolean;
    shouldSuggestGroups: boolean;
    totalVehicles: number;
  }>({
    hasIndividualVehicles: false,
    hasApplicabilityGroups: false,
    shouldSuggestGroups: false,
    totalVehicles: 0,
  });

  // Valores observados del formulario
  const watchedCompatibleVehicles = Form.useWatch("compatible_vehicles", form);
  const watchedApplicabilityGroups = Form.useWatch("applicabilityGroups", form);

  // Efecto para analizar compatibilidad de vehículos
  useEffect(() => {
    const hasIndividual = watchedCompatibleVehicles && watchedCompatibleVehicles.length > 0;
    const hasGroups = watchedApplicabilityGroups && watchedApplicabilityGroups.length > 0;
    const shouldSuggest = hasIndividual && watchedCompatibleVehicles.length >= 5;
    
    setVehicleCompatibilityWarnings({
      hasIndividualVehicles: hasIndividual,
      hasApplicabilityGroups: hasGroups,
      shouldSuggestGroups: shouldSuggest,
      totalVehicles: (watchedCompatibleVehicles?.length || 0) + (watchedApplicabilityGroups?.length || 0),
    });

    // Notificación inteligente cuando se seleccionan muchos vehículos individuales
    if (shouldSuggest && !hasGroups) {
      notification.info({
        message: "Sugerencia: Considera usar Grupos de Aplicabilidad",
        description: `Has seleccionado ${watchedCompatibleVehicles.length} vehículos individuales. Los grupos de aplicabilidad podrían ser más eficientes.`,
        placement: "bottomRight",
        icon: <BulbOutlined style={{ color: "#faad14" }} />,
        duration: 8,
      });
    }
  }, [watchedCompatibleVehicles, watchedApplicabilityGroups]);

  // Función para renderizar alertas de compatibilidad
  const renderCompatibilityAlerts = () => {
    const { hasIndividualVehicles, hasApplicabilityGroups, shouldSuggestGroups } = vehicleCompatibilityWarnings;

    if (!hasIndividualVehicles && !hasApplicabilityGroups) return null;

    return (
      <div className="space-y-3 mt-4">
        {/* Alerta informativa cuando se usan ambos */}
        {hasIndividualVehicles && hasApplicabilityGroups && (
          <Alert
            message="Usando Vehículos Individuales + Grupos de Aplicabilidad"
            description="Estás combinando ambos métodos. El sistema evitará automáticamente duplicados, pero asegúrate de que esta combinación sea necesaria."
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            closable
          />
        )}

        {/* Sugerencia para usar grupos */}
        {shouldSuggestGroups && !hasApplicabilityGroups && (
          <Alert
            message="Considera usar Grupos de Aplicabilidad"
            description={`Has seleccionado ${watchedCompatibleVehicles?.length} vehículos individuales. Para productos con muchas compatibilidades, los grupos son más eficientes.`}
            type="warning"
            icon={<BulbOutlined />}
            showIcon
            closable
          />
        )}

        {/* Información sobre cobertura total */}
        {(hasIndividualVehicles || hasApplicabilityGroups) && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <Space>
              <InfoCircleOutlined className="text-blue-600" />
              <span className="text-blue-800 font-medium">Cobertura de Compatibilidad:</span>
            </Space>
            <div className="mt-2 text-blue-700">
              {hasIndividualVehicles && (
                <div>• {watchedCompatibleVehicles?.length || 0} vehículos seleccionados individualmente</div>
              )}
              {hasApplicabilityGroups && (
                <div>• {watchedApplicabilityGroups?.length || 0} grupos de aplicabilidad seleccionados</div>
              )}
              <div className="text-xs text-blue-600 mt-1">
                El sistema combinará automáticamente todos los vehículos compatibles y eliminará duplicados.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn mt-4">
      <Card
        title={
          <div className="flex items-center">
            <CarOutlined className="text-blue-500 mr-2" />
            <span>Compatibilidad de Vehículos</span>
          </div>
        }
        className="shadow-sm hover:shadow-md transition-shadow duration-300"
        bordered={false}
      >
        <div className="space-y-6">
          {/* Descripción general */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Title level={5} className="text-blue-800 mb-3 flex items-center">
              <InfoCircleOutlined className="mr-2" />
              Configuración de Compatibilidad
            </Title>
            <Text className="text-blue-700">
              Define con qué vehículos es compatible este producto. Puedes usar vehículos individuales, 
              grupos de aplicabilidad, o ambos según tus necesidades. El sistema combinará automáticamente 
              todos los vehículos compatibles y eliminará duplicados.
            </Text>
          </div>

          {/* Selector de vehículos individuales */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <Title level={5} className="text-green-800 mb-3 flex items-center">
              <CarOutlined className="mr-2" />
              Vehículos Compatibles Individuales
            </Title>
            
            <Form.Item
              name="compatible_vehicles"
              label={
                <div className="flex items-center">
                  <CarOutlined className="mr-2 text-green-600" />
                  <span className="font-medium">Seleccionar Vehículos Específicos</span>
                </div>
              }
              extra="Selecciona vehículos específicos uno por uno. Ideal para productos con compatibilidades muy específicas o pocas compatibilidades."
              className="mb-0"
            >
              <VehicleSelector 
                isMulti={true} 
                placeholder="Buscar vehículos compatibles específicos..." 
                className="vehicle-selector" 
              />
            </Form.Item>
          </div>

          {/* Selector de grupos de aplicabilidad */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <Title level={5} className="text-purple-800 mb-3 flex items-center">
              <GroupOutlined className="mr-2" />
              Grupos de Aplicabilidad
            </Title>
            
            <Form.Item
              name="applicabilityGroups"
              label={
                <div className="flex items-center">
                  <GroupOutlined className="mr-2 text-purple-600" />
                  <span className="font-medium">Seleccionar Grupos de Aplicabilidad</span>
                </div>
              }
              extra="Selecciona grupos predefinidos que contienen múltiples vehículos. Ideal para productos compatibles con muchos vehículos o familias completas de vehículos."
              className="mb-0"
            >
              <ApplicabilityGroupSelector 
                isMulti={true} 
                placeholder="Buscar grupos de aplicabilidad..." 
                className="applicability-group-selector" 
              />
            </Form.Item>
          </div>

          {/* Alertas y sugerencias de compatibilidad */}
          {renderCompatibilityAlerts()}

          {/* Información actual de vehículos individuales */}
          {(watchedCompatibleVehicles && watchedCompatibleVehicles.length > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
              <Divider orientation="left" className="text-green-500 mb-4">
                <Space>
                  <CarOutlined />
                  <span>Vehículos Individuales Seleccionados ({watchedCompatibleVehicles.length})</span>
                </Space>
              </Divider>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {watchedCompatibleVehicles.map((vehicle: any, index: number) => {
                  // El displayName ahora viene del formulario con información completa
                  const displayName = vehicle.label || `Vehículo ${index + 1}`
                  
                  // Información adicional disponible
                  const brand = vehicle.brand || ""
                  const family = vehicle.family || ""
                  const model = vehicle.model || ""
                  const engineType = vehicle.engine_type || ""
                  const year = vehicle.year || ""
                  const tagId = vehicle.tag_id || ""
                  const transmission = vehicle.transmission || ""
                  const fuel = vehicle.fuel || ""

                  return (
                    <div
                      key={String(vehicle.value || vehicle.id || vehicle._id || index)}
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Text strong className="text-gray-800 block text-sm">
                            {displayName}
                          </Text>
                          {transmission && (
                            <Text className="text-gray-500 text-xs block mt-1">
                              Transmisión: {transmission}
                            </Text>
                          )}
                          {fuel && (
                            <Text className="text-gray-500 text-xs block mt-1">
                              Combustible: {fuel}
                            </Text>
                          )}
                        </div>
                        <Tag
                          color="green"
                          className="ml-2 flex items-center"
                          icon={<CarOutlined />}
                        >
                          Individual
                        </Tag>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Información actual de grupos de aplicabilidad */}
          {(watchedApplicabilityGroups && watchedApplicabilityGroups.length > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
              <Divider orientation="left" className="text-purple-500 mb-4">
                <Space>
                  <GroupOutlined />
                  <span>Grupos de Aplicabilidad Seleccionados ({watchedApplicabilityGroups.length})</span>
                </Space>
              </Divider>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {watchedApplicabilityGroups.map((group: any, index: number) => (
                  <div
                    key={String(group.value || group.id || group._id || index)}
                    className="bg-white p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Text strong className="text-gray-800 block text-sm">
                          {group.label || group.name || `Grupo ${index + 1}`}
                        </Text>
                        {group.description && (
                          <Text className="text-gray-500 text-xs block mt-1">
                            {group.description}
                          </Text>
                        )}
                        {group.category && (
                          <Text className="text-purple-600 text-xs block mt-1">
                            Categoría: {group.category}
                          </Text>
                        )}
                        {group.vehicleCount && (
                          <Text className="text-blue-600 text-xs block mt-1">
                            ~{group.vehicleCount} vehículos
                          </Text>
                        )}
                      </div>
                      <Tag
                        color="purple"
                        className="ml-2 flex items-center"
                        icon={<GroupOutlined />}
                      >
                        Grupo
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mostrar datos originales del producto si existen y no hay datos del formulario */}
          {!watchedCompatibleVehicles?.length && !watchedApplicabilityGroups?.length && (
            <>
              {/* Datos originales de vehículos individuales */}
              {productData?.compatible_vehicles && productData.compatible_vehicles.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg transition-all duration-300 hover:bg-yellow-100 border border-yellow-200">
                  <Divider orientation="left" className="text-amber-600 mb-4">
                    <Space>
                      <CarOutlined />
                      <span>Vehículos Individuales Guardados ({productData.compatible_vehicles.length})</span>
                    </Space>
                  </Divider>

                  <Alert
                    message="Datos Guardados"
                    description="Estos son los vehículos actualmente guardados. Usa los selectores superiores para modificarlos."
                    type="info"
                    showIcon
                    className="mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productData.compatible_vehicles.map((vehicle, index) => {
                      // Extraer información completa del vehículo guardado
                      const brand = vehicle.model?.family?.brand?.name || ""
                      const familyName = vehicle.model?.family?.name || ""
                      const modelName = vehicle.model?.name || ""
                      const engineType = vehicle.model?.engine_type || ""
                      const year = vehicle.model?.year || ""
                      const tagId = vehicle.tag_id || ""
                      const transmission = vehicle.transmission_id?.name || ""
                      const fuel = vehicle.fuel_id?.name || ""
                      
                      // Construir displayName completo
                      const parts = []
                      
                      // Agregar componentes disponibles
                      if (brand) parts.push(brand)
                      if (familyName) parts.push(familyName)
                      if (engineType) parts.push(engineType)
                      if (year) parts.push(`(${year})`)
                      if (tagId) parts.push(`- ${tagId}`)
                      if (transmission) parts.push(`- ${transmission}`)
                      if (fuel) parts.push(fuel)
                      
                      const displayName = parts.length > 0 ? parts.join(' ') : 'Vehículo Compatible'

                      return (
                        <div
                          key={String(vehicle.id || vehicle._id || index)}
                          className="bg-white p-3 rounded-lg border border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Text strong className="text-gray-800 block text-sm">
                                {displayName}
                              </Text>
                              {transmission && (
                                <Text className="text-gray-500 text-xs block mt-1">
                                  Transmisión: {transmission}
                                </Text>
                              )}
                              {fuel && (
                                <Text className="text-gray-500 text-xs block mt-1">
                                  Combustible: {fuel}
                                </Text>
                              )}
                            </div>
                            <Tag
                              color="gold"
                              className="ml-2 flex items-center"
                              icon={<CarOutlined />}
                            >
                              Guardado
                            </Tag>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Datos originales de grupos de aplicabilidad */}
              {productData?.applicabilityGroups && productData.applicabilityGroups.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg transition-all duration-300 hover:bg-yellow-100 border border-yellow-200">
                  <Divider orientation="left" className="text-amber-600 mb-4">
                    <Space>
                      <GroupOutlined />
                      <span>Grupos de Aplicabilidad Guardados ({productData.applicabilityGroups.length})</span>
                    </Space>
                  </Divider>

                  <Alert
                    message="Datos Guardados"
                    description="Estos son los grupos actualmente guardados. Usa los selectores superiores para modificarlos."
                    type="info"
                    showIcon
                    className="mb-3"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {productData.applicabilityGroups.map((group, index) => (
                      <div
                        key={String(group.id || group._id || index)}
                        className="bg-white p-3 rounded-lg border border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Text strong className="text-gray-800 block text-sm">
                              {group.name || `Grupo ${index + 1}`}
                            </Text>
                            {group.description && (
                              <Text className="text-gray-500 text-xs block mt-1">
                                {group.description}
                              </Text>
                            )}
                            {group.category && (
                              <Text className="text-amber-600 text-xs block mt-1">
                                Categoría: {group.category}
                              </Text>
                            )}
                            {group.estimatedVehicleCount && (
                              <Text className="text-blue-600 text-xs block mt-1">
                                ~{group.estimatedVehicleCount} vehículos
                              </Text>
                            )}
                          </div>
                          <Tag
                            color="gold"
                            className="ml-2 flex items-center"
                            icon={<GroupOutlined />}
                          >
                            Guardado
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Información importante */}
          <Alert
            type="warning"
            message="Importante"
            description={
              <div>
                <p className="mb-2">• Verifique cuidadosamente la compatibilidad antes de asociar vehículos o grupos</p>
                <p className="mb-2">• Los cambios se guardarán al actualizar el producto</p>
                <p className="mb-2">• Puede combinar vehículos individuales y grupos de aplicabilidad</p>
                <p className="mb-0">• El sistema evitará automáticamente duplicados entre vehículos individuales y grupos</p>
              </div>
            }
            showIcon
            className="shadow-sm"
          />
        </div>
      </Card>
    </div>
  )
}

export default VehiclesTab
