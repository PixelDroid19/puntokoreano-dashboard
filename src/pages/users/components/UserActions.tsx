import React, { useState } from 'react';
import { Space, Button, Tooltip, Modal, Form, Input, Checkbox } from 'antd';
import { EditOutlined, LockOutlined, UnlockOutlined, DeleteOutlined, ReloadOutlined, LogoutOutlined, StopOutlined } from '@ant-design/icons';
import { User } from '../../../types/users.types';

const { TextArea } = Input;

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onBlock: (id: string, reason: string) => void;
  onUnblock: (id: string) => void;
  onDelete: (id: string) => void;
  onRefreshToken?: (id: string) => void;
  onInvalidateSessions?: (id: string) => void;
  onLogout?: (id: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEdit,
  onBlock,
  onUnblock,
  onDelete,
  onLogout,
}) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  
  return (
    <Space size="small">
      <Tooltip title="Editar">
        <Button
          icon={<EditOutlined />}
          onClick={() => onEdit(user)}
        />
      </Tooltip>

      {user.active ? (
        <Tooltip title="Bloquear">
          <Button
            icon={<LockOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Bloquear usuario",
                content: (
                  <div>
                    <p>¿Estás seguro de bloquear a este usuario?</p>
                    <Form.Item label="Razón del bloqueo">
                      <Input.TextArea
                        id="block-reason"
                        rows={3}
                      />
                    </Form.Item>
                  </div>
                ),
                okText: "Bloquear",
                okType: "danger",
                cancelText: "Cancelar",
                onOk: () => {
                  const reason = document.getElementById("block-reason") as HTMLTextAreaElement;
                  onBlock(user._id, reason ? reason.value : "No especificada");
                },
              });
            }}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Desbloquear">
          <Button
            type="primary"
            icon={<UnlockOutlined />}
            onClick={() => onUnblock(user._id)}
          />
        </Tooltip>
      )}
      {onLogout && (
        <Tooltip title="Cerrar sesión">
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Cerrar sesión de usuario",
                content: "¿Estás seguro de cerrar la sesión de este usuario?",
                okText: "Sí, cerrar sesión",
                okType: "danger",
                cancelText: "Cancelar",
                onOk: () => onLogout(user._id),
              });
            }}
          />
        </Tooltip>
      )}
      <Tooltip title="Eliminar">
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => setIsDeleteModalVisible(true)}
        />
      </Tooltip>
      
      <Modal
        title="Eliminar usuario"
        open={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setIsDeleteConfirmed(false);
        }}
        okText="Sí, eliminar"
        okType="danger"
        okButtonProps={{
          danger: true,
          disabled: !isDeleteConfirmed
        }}
        cancelText="Cancelar"
        onOk={() => {
          if (isDeleteConfirmed) {
            onDelete(user._id);
            setIsDeleteModalVisible(false);
            setIsDeleteConfirmed(false);
          }
        }}
      >
        <div>
          <p>¿Estás seguro de eliminar a este usuario?</p>
          <p>Esta acción no se puede deshacer.</p>
          <Checkbox 
            onChange={(e) => setIsDeleteConfirmed(e.target.checked)}
            checked={isDeleteConfirmed}
          >
            Confirmo la eliminación permanente
          </Checkbox>
        </div>
      </Modal>
    </Space>
  );
};

export default UserActions;