import React from "react";
import { Alert, Card, Descriptions, Tag, Tooltip, Typography } from "antd";
import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

interface CriteriaHelperProps {
  criteria: {
    brands?: string[];
    families?: string[];
    models?: string[];
    lines?: string[];
    transmissions?: string[];
    fuels?: string[];
    minYear?: number;
    maxYear?: number;
    specificYears?: number[];
  };
  selectedData: {
    brands?: Array<{ label: string; value: string }>;
    families?: Array<{ label: string; value: string }>;
    models?: Array<{ label: string; value: string }>;
    lines?: Array<{ label: string; value: string }>;
    transmissions?: Array<{ label: string; value: string }>;
    fuels?: Array<{ label: string; value: string }>;
  };
  includedVehicles?: Array<{ label: string; value: string }>;
  excludedVehicles?: Array<{ label: string; value: string }>;
}

const CriteriaHelper: React.FC<CriteriaHelperProps> = ({
  criteria,
  selectedData,
  includedVehicles = [],
  excludedVehicles = []
}) => {
  // Verificar si hay criterios definidos
  const hasCriteria = (
    (criteria.brands && criteria.brands.length > 0) ||
    (criteria.families && criteria.families.length > 0) ||
    (criteria.models && criteria.models.length > 0) ||
    (criteria.lines && criteria.lines.length > 0) ||
    (criteria.transmissions && criteria.transmissions.length > 0) ||
    (criteria.fuels && criteria.fuels.length > 0) ||
    criteria.minYear ||
    criteria.maxYear ||
    (criteria.specificYears && criteria.specificYears.length > 0) ||
    includedVehicles.length > 0
  );

  // Determinar el nivel de especificidad de los criterios
  const getCriteriaLevel = (): { level: "basic" | "medium" | "detailed"; color: string } => {
    let score = 0;
    let categories = 0;

    if (criteria.brands && criteria.brands.length) {
      score += 1;
      categories++;
    }
    if (criteria.families && criteria.families.length) {
      score += 2;
      categories++;
    }
    if (criteria.models && criteria.models.length) {
      score += 3;
      categories++;
    }
    if (criteria.transmissions && criteria.transmissions.length) {
      score += 2;
      categories++;
    }
    if (criteria.fuels && criteria.fuels.length) {
      score += 2;
      categories++;
    }
    if (criteria.minYear || criteria.maxYear || (criteria.specificYears && criteria.specificYears.length)) {
      score += 2;
      categories++;
    }

    // Nivel basado en puntuación y categorías
    if (categories >= 3 && score >= 6) {
      return { level: "detailed", color: "green" };
    } else if (categories >= 2 && score >= 3) {
      return { level: "medium", color: "orange" };
    } else {
      return { level: "basic", color: "red" };
    }
  };

  const criteriaLevel = getCriteriaLevel();

  // Sugerencias basadas en el nivel de criterios
  const getSuggestions = () => {
    if (criteriaLevel.level === "basic") {
      return [
        "Añade más categorías de criterios para mejorar la precisión",
        "Considera especificar modelos específicos",
        "Añade criterios de años para limitar la aplicabilidad temporal"
      ];
    } else if (criteriaLevel.level === "medium") {
      return [
        "Considera añadir criterios de tipo de motor o combustible",
        "Añade vehículos específicos si es necesario"
      ];
    } else {
      return [
        "Tus criterios son detallados, revisa que sean precisos",
        "Verifica los vehículos compatibles para confirmar"
      ];
    }
  };

  if (!hasCriteria) {
    return (
      <Alert
        message="Sin criterios de aplicabilidad"
        description="No has definido criterios de aplicabilidad. Los vehículos compatibles dependerán únicamente de los vehículos específicamente incluidos."
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
      />
    );
  }

  return (
    <Card className="mt-4 bg-gray-50">
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <Text strong>Nivel de especificidad:</Text>
          <Tag color={criteriaLevel.color}>
            {criteriaLevel.level === "detailed" && "Detallado"}
            {criteriaLevel.level === "medium" && "Medio"}
            {criteriaLevel.level === "basic" && "Básico"}
          </Tag>
          <Tooltip title="El nivel de especificidad indica qué tan precisos son tus criterios para determinar vehículos compatibles">
            <InfoCircleOutlined className="text-blue-500 cursor-help" />
          </Tooltip>
        </div>
      </div>

      <Descriptions
        bordered
        size="small"
        column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        {selectedData.brands && selectedData.brands.length > 0 && (
          <Descriptions.Item label="Marcas">
            <div className="flex flex-wrap gap-1">
              {selectedData.brands.map(brand => (
                <Tag key={brand.value}>{brand.label}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {selectedData.families && selectedData.families.length > 0 && (
          <Descriptions.Item label="Familias">
            <div className="flex flex-wrap gap-1">
              {selectedData.families.map(family => (
                <Tag key={family.value}>{family.label}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {selectedData.models && selectedData.models.length > 0 && (
          <Descriptions.Item label="Modelos">
            <div className="flex flex-wrap gap-1">
              {selectedData.models.map(model => (
                <Tag key={model.value}>{model.label}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {criteria.minYear || criteria.maxYear ? (
          <Descriptions.Item label="Rango de años">
            {criteria.minYear && criteria.maxYear
              ? `${criteria.minYear} - ${criteria.maxYear}`
              : criteria.minYear
              ? `Desde ${criteria.minYear}`
              : `Hasta ${criteria.maxYear}`}
          </Descriptions.Item>
        ) : criteria.specificYears && criteria.specificYears.length > 0 ? (
          <Descriptions.Item label="Años específicos">
            <div className="flex flex-wrap gap-1">
              {criteria.specificYears.map(year => (
                <Tag key={year}>{year}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        ) : null}

        {selectedData.transmissions && selectedData.transmissions.length > 0 && (
          <Descriptions.Item label="Transmisiones">
            <div className="flex flex-wrap gap-1">
              {selectedData.transmissions.map(transmission => (
                <Tag key={transmission.value}>{transmission.label}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {selectedData.fuels && selectedData.fuels.length > 0 && (
          <Descriptions.Item label="Combustibles">
            <div className="flex flex-wrap gap-1">
              {selectedData.fuels.map(fuel => (
                <Tag key={fuel.value}>{fuel.label}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {includedVehicles.length > 0 && (
          <Descriptions.Item label="Vehículos incluidos">
            <div className="flex flex-wrap gap-1">
              {includedVehicles.map(vehicle => (
                <Tag key={vehicle.value} color="green">{vehicle.label}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}

        {excludedVehicles.length > 0 && (
          <Descriptions.Item label="Vehículos excluidos">
            <div className="flex flex-wrap gap-1">
              {excludedVehicles.map(vehicle => (
                <Tag key={vehicle.value} color="red">{vehicle.label}</Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Alert
        className="mt-4"
        message="Sugerencias para mejorar"
        type="info"
        showIcon
        icon={<CheckCircleOutlined />}
        description={
          <ul className="list-disc list-inside">
            {getSuggestions().map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        }
      />
    </Card>
  );
};

export default CriteriaHelper; 