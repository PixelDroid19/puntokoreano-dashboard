import React from 'react';
import { Card, Col, Form, Input, Row, Select, Switch, Upload, UploadFile } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface MultimediaInformationProps {
  useGroupImages: boolean;
  setUseGroupImages: React.Dispatch<React.SetStateAction<boolean>>;
  fileList: UploadFile[];
  handleUpload: (file: any) => boolean;
  handlePreview: (file: UploadFile) => void;
  imageGroups: any;
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
}

const MultimediaInformation: React.FC<MultimediaInformationProps> = ({
  useGroupImages,
  setUseGroupImages,
  fileList,
  handleUpload,
  handlePreview,
  imageGroups,
  setVideoUrl,
}) => {
  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card title="Imágenes del Producto">
          <Form.Item
            label="Usar Grupo de Imágenes"
            name="useGroupImages"
          >
            <Switch
              checked={useGroupImages}
              onChange={setUseGroupImages}
            />
          </Form.Item>

          {useGroupImages ? (
            <Form.Item name="imageGroup" rules={[{ required: true }]}>
              <Select
                placeholder="Seleccione un grupo de imágenes"
                options={imageGroups?.data?.groups?.map((group) => ({
                  label: group.identifier,
                  value: group._id,
                }))}
              />
            </Form.Item>
          ) : (
            <Form.Item name="images" rules={[{ required: true }]}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={handleUpload}
                onPreview={handlePreview}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          )}
        </Card>

        <Card title="Video del Producto" className="mt-4">
          <Form.Item
            name="videoUrl"
            label="URL del Video (YouTube/Vimeo)"
            extra="Ingrese la URL del video de YouTube o Vimeo"
          >
            <Input
              placeholder="https://youtube.com/watch?v=..."
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
};

export default MultimediaInformation;