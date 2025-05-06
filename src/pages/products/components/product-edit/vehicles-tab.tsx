import type React from "react"
import { Form, Card, Tag, Divider, Alert } from "antd"
import { CarOutlined } from "@ant-design/icons"
import { Product } from "../../../../api/types"
import VehicleSelector from "../../../vehicle-manager/selectors/vehicle-selector"

interface VehiclesTabProps {
  productData: Product | undefined
}

const VehiclesTab: React.FC<VehiclesTabProps> = ({ productData }) => {
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
        <Form.Item
          name="compatible_vehicles"
          label="Seleccionar Vehículos Compatibles"
          extra="Seleccione todos los vehículos con los que este producto es compatible"
          className="mb-6"
        >
          <VehicleSelector isMulti={true} placeholder="Buscar vehículos..." className="vehicle-selector" />
        </Form.Item>

        {productData?.compatible_vehicles && productData.compatible_vehicles.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
            <Divider orientation="left" className="text-blue-500 mb-4">
              <CarOutlined className="mr-2" />
              Vehículos Asociados Actualmente ({productData.compatible_vehicles.length})
            </Divider>

            <div className="flex flex-wrap gap-2">
              {productData.compatible_vehicles.map((vehicle, index) => {
                // Obtener los nombres del modelo y línea del vehículo
                const modelName = vehicle.line?.model?.name || ""
                const lineName = vehicle.line?.name || ""
                const displayName =
                  modelName && lineName ? `${modelName} ${lineName}` : vehicle.tag_id || `Vehículo ${index + 1}`

                return (
                  <Tag
                    key={String(vehicle.id || vehicle._id || index)}
                    color="blue"
                    className="mb-2 py-1.5 px-3 rounded-full text-sm flex items-center hover:shadow-sm transition-all duration-300"
                    icon={<CarOutlined className="mr-1" />}
                  >
                    {displayName}
                  </Tag>
                )
              })}
            </div>
          </div>
        )}

        <Alert
          type="info"
          message="Información de Compatibilidad"
          description="La asociación correcta con vehículos mejora la experiencia de búsqueda y ayuda a los clientes a encontrar productos compatibles con sus vehículos específicos."
          showIcon
          className="mt-6 shadow-sm"
        />
      </Card>
    </div>
  )
}

export default VehiclesTab
