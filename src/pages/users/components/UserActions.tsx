import React from 'react';
import { Space, Button, Tooltip, Modal, Form, Input } from 'antd';
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
  return (
    <Space>
      <Tooltip title="Editar">
        <Button
          icon={<EditOutlined />}
          onClick={() => onEdit(user)}
        />
      </Tooltip>
      <Tooltip title={user.active ? "Bloquear" : "Desbloquear"}>
        <Button
          icon={user.active ? <LockOutlined /> : <UnlockOutlined />}
          onClick={() => {
            if (user.active) {
              Modal.confirm({
                title: "Bloquear usuario",
                content: (
                  <Form.Item label="Razón del bloqueo" required>
                    <TextArea
                      onChange={(e) => {
                        (Modal.confirm as any).reason = e.target.value;
                      }}
                    />
                  </Form.Item>
                ),
                onOk: () => {
                  onBlock(user._id, (Modal.confirm as any).reason);
                },
              });
            } else {
              onUnblock(user._id);
            }
          }}
        />
      </Tooltip>
   {/*    {onLogout && (
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
      )} */}
      <Tooltip title="Eliminar">
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            Modal.confirm({
              title: "¿Estás seguro de eliminar este usuario?",
              content: "Esta acción no se puede deshacer",
              okText: "Sí, eliminar",
              okType: "danger",
              cancelText: "Cancelar",
              onOk: () => onDelete(user._id),
            });
          }}
        />
      </Tooltip>
    </Space>
  );
};

export default UserActions;