import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Steps, message, Card, Divider, Space, Switch, Spin } from 'antd';
import { SaveOutlined, CarOutlined, SettingOutlined, TagOutlined, PlusOutlined } from '@ant-design/icons';
import VehicleFamiliesService, { OptionItem, VehicleData, BulkVehicleData } from '../../services/vehicle-families.service';

const { Step } = Steps;
const { Option } = Select;

interface VehicleRegistrationFormProps {
  onSubmit: (data: VehicleData | BulkVehicleData) => Promise<void>;
  initialData?: Partial<VehicleData>;
  isEdit?: boolean;
}

const VehicleRegistrationForm: React.FC<VehicleRegistrationFormProps> = ({
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  // Data for dropdowns
  const [families, setFamilies] = useState<OptionItem[]>([]);
  const [models, setModels] = useState<OptionItem[]>([]);
  const [transmissions, setTransmissions] = useState<OptionItem[]>([]);
  const [fuels, setFuels] = useState<OptionItem[]>([]);
  const [lines, setLines] = useState<OptionItem[]>([]);
  const [years, setYears] = useState<OptionItem[]>([]);
  
  // Selected values for cascading dropdowns
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedFuel, setSelectedFuel] = useState<string>('');
  
  // Loading states for each dropdown
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingTransmissions, setLoadingTransmissions] = useState(false);
  const [loadingFuels, setLoadingFuels] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  // Load families on component mount
  useEffect(() => {
    loadFamilies();
  }, []);

  // Set initial form values if in edit mode
  useEffect(() => {
    if (initialData && isEdit) {
      form.setFieldsValue(initialData);
      
      // If we have initial data, load the cascading dropdowns
      if (initialData.family) {
        setSelectedFamily(initialData.family);
        loadModels(initialData.family);
        
        if (initialData.model) {
          setSelectedModel(initialData.model);
          loadTransmissions(initialData.family, initialData.model);
          
          if (initialData.transmission) {
            setSelectedTransmission(initialData.transmission);
            loadFuels(initialData.family, initialData.model, initialData.transmission);
            
            if (initialData.fuel) {
              setSelectedFuel(initialData.fuel);
              loadLines(initialData.family, initialData.model, initialData.transmission, initialData.fuel);
            }
          }
        }
        
        // Load years for the family
        loadYears(initialData.family);
      }
    }
  }, [initialData, isEdit]);

  const loadFamilies = async () => {
    setLoading(true);
    try {
      const familiesData = await VehicleFamiliesService.getFamilies();
      setFamilies(familiesData.map(family => ({ label: family.name, value: family.id })));
    } catch (error) {
      console.error('Error loading families:', error);
      message.error('Error al cargar las familias de vehículos');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (familyName: string) => {
    setLoadingModels(true);
    try {
      const modelsData = await VehicleFamiliesService.getModelsByFamily(familyName);
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
      message.error('Error al cargar los modelos');
    } finally {
      setLoadingModels(false);
    }
  };

  const loadTransmissions = async (familyName: string, modelValue: string) => {
    setLoadingTransmissions(true);
    try {
      const transmissionsData = await VehicleFamiliesService.getTransmissionsByModel(familyName, modelValue);
      setTransmissions(transmissionsData);
    } catch (error) {
      console.error('Error loading transmissions:', error);
      message.error('Error al cargar las transmisiones');
    } finally {
      setLoadingTransmissions(false);
    }
  };

  const loadFuels = async (familyName: string, modelValue: string, transmissionValue: string) => {
    setLoadingFuels(true);
    try {
      const fuelsData = await VehicleFamiliesService.getFuelsByTransmission(familyName, modelValue, transmissionValue);
      setFuels(fuelsData);
    } catch (error) {
      console.error('Error loading fuels:', error);
      message.error('Error al cargar los combustibles');
    } finally {
      setLoadingFuels(false);
    }
  };

  const loadLines = async (familyName: string, modelValue: string, transmissionValue: string, fuelValue: string) => {
    setLoadingLines(true);
    try {
      const linesData = await VehicleFamiliesService.getLinesByFuel(familyName, modelValue, transmissionValue, fuelValue);
      setLines(linesData);
    } catch (error) {
      console.error('Error loading lines:', error);
      message.error('Error al cargar las líneas');
    } finally {
      setLoadingLines(false);
    }
  };

  const loadYears = async (familyName: string) => {
    setLoadingYears(true);
    try {
      const yearsData = await VehicleFamiliesService.getYearsByFamily(familyName);
      setYears(yearsData);
    } catch (error) {
      console.error('Error loading years:', error);
      message.error('Error al cargar los años');
    } finally {
      setLoadingYears(false);
    }
  };

  const handleFamilyChange = (value: string) => {
    setSelectedFamily(value);
    setSelectedModel('');
    setSelectedTransmission('');
    setSelectedFuel('');
    
    // Reset dependent fields
    form.setFieldsValue({
      model: undefined,
      transmission: undefined,
      fuel: undefined,
      line: undefined,
      year: undefined,
    });
    
    // Reset dependent dropdowns
    setModels([]);
    setTransmissions([]);
    setFuels([]);
    setLines([]);
    
    // Load models for the selected family
    loadModels(value);
    
    // Load years for the selected family
    loadYears(value);
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    setSelectedTransmission('');
    setSelectedFuel('');
    
    // Reset dependent fields
    form.setFieldsValue({
      transmission: undefined,
      fuel: undefined,
      line: undefined,
    });
    
    // Reset dependent dropdowns
    setTransmissions([]);
    setFuels([]);
    setLines([]);
    
    // Load transmissions for the selected model
    loadTransmissions(selectedFamily, value);
  };

  const handleTransmissionChange = (value: string) => {
    setSelectedTransmission(value);
    setSelectedFuel('');
    
    // Reset dependent fields
    form.setFieldsValue({
      fuel: undefined,
      line: undefined,
    });
    
    // Reset dependent dropdowns
    setFuels([]);
    setLines([]);
    
    // Load fuels for the selected transmission
    loadFuels(selectedFamily, selectedModel, value);
  };

  const handleFuelChange = (value: string) => {
    setSelectedFuel(value);
    
    // Reset dependent fields
    form.setFieldsValue({
      line: undefined,
    });
    
    // Reset dependent dropdowns
    setLines([]);
    
    // Load lines for the selected fuel
    loadLines(selectedFamily, selectedModel, selectedTransmission, value);
  };

  const handleBulkModeToggle = (checked: boolean) => {
    setIsBulkMode(checked);
    
    // Reset form when toggling bulk mode
    if (!isEdit) {
      form.resetFields();
      if (selectedFamily) {
        form.setFieldsValue({ family: selectedFamily });
        loadModels(selectedFamily);
        loadYears(selectedFamily);
      }
    }
  };

  const next = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setSubmitting(true);
      
      // Format the data based on whether we're in bulk mode or not
      let formattedData;
      if (isBulkMode) {
        formattedData = {
          ...values,
          transmissions: Array.isArray(values.transmissions) 
            ? values.transmissions.map((value: string) => {
                const transmission = transmissions.find(t => t.value === value);
                return transmission || { label: value, value };
              })
            : [],
          years: Array.isArray(values.years) 
            ? values.years 
            : [],
        } as BulkVehicleData;
      } else {
        formattedData = values as VehicleData;
      }
      
      await onSubmit(formattedData);
      
      if (!isEdit) {
        // Reset form after successful submission if not in edit mode
        form.resetFields();
        setCurrentStep(0);
      }
      
      message.success(`Vehículo ${isEdit ? 'actualizado' : 'registrado'} correctamente`);
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(`Error al ${isEdit ? 'actualizar' : 'registrar'} el vehículo`);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'Información básica',
      icon: <CarOutlined />,
      content: (
        <>
          <Form.Item
            name="family"
            label="Familia"
            rules={[{ required: true, message: 'Por favor selecciona una familia' }]}
          >
            <Select
              placeholder="Selecciona una familia"
              onChange={handleFamilyChange}
              loading={loading}
              disabled={loading || isEdit}
            >
              {families.map(family => (
                <Option key={family.value} value={family.value}>{family.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="model"
            label="Modelo"
            rules={[{ required: true, message: 'Por favor selecciona un modelo' }]}
          >
            <Select
              placeholder="Selecciona un modelo"
              onChange={handleModelChange}
              loading={loadingModels}
              disabled={!selectedFamily || loadingModels || isEdit}
            >
              {models.map(model => (
                <Option key={model.value} value={model.value}>{model.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          {isBulkMode ? (
            <Form.Item
              name="transmissions"
              label="Transmisiones"
              rules={[{ required: true, message: 'Por favor selecciona al menos una transmisión' }]}
            >
              <Select
                placeholder="Selecciona transmisiones"
                mode="multiple"
                loading={loadingTransmissions}
                disabled={!selectedModel || loadingTransmissions}
              >
                {transmissions.map(transmission => (
                  <Option key={transmission.value} value={transmission.value}>{transmission.label}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="transmission"
              label="Transmisión"
              rules={[{ required: true, message: 'Por favor selecciona una transmisión' }]}
            >
              <Select
                placeholder="Selecciona una transmisión"
                onChange={handleTransmissionChange}
                loading={loadingTransmissions}
                disabled={!selectedModel || loadingTransmissions || isEdit}
              >
                {transmissions.map(transmission => (
                  <Option key={transmission.value} value={transmission.value}>{transmission.label}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </>
      ),
    },
    {
      title: 'Detalles técnicos',
      icon: <SettingOutlined />,
      content: (
        <>
          <Form.Item
            name="fuel"
            label="Combustible"
            rules={[{ required: true, message: 'Por favor selecciona un combustible' }]}
          >
            <Select
              placeholder="Selecciona un combustible"
              onChange={handleFuelChange}
              loading={loadingFuels}
              disabled={!selectedTransmission || loadingFuels || isEdit}
            >
              {fuels.map(fuel => (
                <Option key={fuel.value} value={fuel.value}>{fuel.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="line"
            label="Línea"
            rules={[{ required: true, message: 'Por favor selecciona una línea' }]}
          >
            <Select
              placeholder="Selecciona una línea"
              loading={loadingLines}
              disabled={!selectedFuel || loadingLines || isEdit}
            >
              {lines.map(line => (
                <Option key={line.value} value={line.value}>{line.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          {isBulkMode ? (
            <Form.Item
              name="years"
              label="Años"
              rules={[{ required: true, message: 'Por favor selecciona al menos un año' }]}
            >
              <Select
                placeholder="Selecciona años"
                mode="multiple"
                loading={loadingYears}
                disabled={!selectedFamily || loadingYears}
              >
                {years.map(year => (
                  <Option key={year.value} value={year.value}>{year.label}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="year"
              label="Año"
              rules={[{ required: true, message: 'Por favor selecciona un año' }]}
            >
              <Select
                placeholder="Selecciona un año"
                loading={loadingYears}
                disabled={!selectedFamily || loadingYears || isEdit}
              >
                {years.map(year => (
                  <Option key={year.value} value={year.value}>{year.label}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </>
      ),
    },
    {
      title: 'Información del producto',
      icon: <TagOutlined />,
      content: (
        <>
          <Form.Item
            name={['productData', 'name']}
            label="Nombre del producto"
            rules={[{ required: true, message: 'Por favor ingresa el nombre del producto' }]}
          >
            <Input placeholder="Ej: Kit de frenos para Toyota Corolla" />
          </Form.Item>
          
          <Form.Item
            name={['productData', 'price']}
            label="Precio"
            rules={[{ required: true, message: 'Por favor ingresa el precio' }]}
          >
            <Input type="number" min={0} placeholder="Precio" prefix="$" />
          </Form.Item>
          
          <Form.Item
            name={['productData', 'stock']}
            label="Stock"
            rules={[{ required: true, message: 'Por favor ingresa el stock disponible' }]}
          >
            <Input type="number" min={0} placeholder="Cantidad disponible" />
          </Form.Item>
          
          <Form.Item
            name={['productData', 'description']}
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
          >
            <Input.TextArea rows={4} placeholder="Descripción del producto" />
          </Form.Item>
          
          <Form.Item
            name={['productData', 'active']}
            label="Activo"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Card className="vehicle-registration-form">
      <div className="form-header">
        <h2>{isEdit ? 'Editar vehículo' : 'Registrar nuevo vehículo'}</h2>
        
        {!isEdit && (
          <div className="bulk-mode-toggle">
            <span>Modo masivo:</span>
            <Switch
              checked={isBulkMode}
              onChange={handleBulkModeToggle}
              checkedChildren="Activado"
              unCheckedChildren="Desactivado"
            />
            <span className="bulk-mode-description">
              {isBulkMode ? 'Registrar múltiples vehículos a la vez' : 'Registrar un solo vehículo'}
            </span>
          </div>
        )}
      </div>
      
      <Divider />
      
      <Steps current={currentStep} className="registration-steps">
        {steps.map(item => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      
      <div className="steps-content">
        <Form
          form={form}
          layout="vertical"
          initialValues={initialData || {}}
          scrollToFirstError
        >
          {steps[currentStep].content}
        </Form>
      </div>
      
      <div className="steps-action">
        {currentStep > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={prev}>
            Anterior
          </Button>
        )}
        
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Siguiente
          </Button>
        )}
        
        {currentStep === steps.length - 1 && (
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={submitting}
            icon={<SaveOutlined />}
          >
            {isEdit ? 'Actualizar' : 'Registrar'}
          </Button>
        )}
      </div>
      
      <style jsx>{`
        .vehicle-registration-form {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .form-header h2 {
          margin: 0;
        }
        
        .bulk-mode-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .bulk-mode-description {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
        
        .registration-steps {
          margin-bottom: 24px;
        }
        
        .steps-content {
          margin-top: 16px;
          padding: 20px;
          background-color: #fafafa;
          border: 1px dashed #e9e9e9;
          border-radius: 2px;
          min-height: 200px;
        }
        
        .steps-action {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </Card>
  );
};

export default VehicleRegistrationForm;