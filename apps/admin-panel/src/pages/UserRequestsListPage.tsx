import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Empty, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import type { CreateAdminRequest } from '@/types/auth.ts';
import { usersService } from '../services/users.service.ts';
import { RoleSelectionModal } from '@/components/RoleSelectionModal.tsx';
import { AdminRole } from '@/types/permissions.ts';
import { PageHeader } from '@/components';

/* ------------------------------------------------------------------ */
/* Static data                                                        */
/* ------------------------------------------------------------------ */

const STATUS_TONES = {
  pending: {
    bg: 'var(--amber-soft)',
    color: 'var(--ochre-deep)',
    label: 'На рассмотрении',
  },
  approved: {
    bg: 'var(--forest-soft)',
    color: 'var(--forest)',
    label: 'Одобрено',
  },
  rejected: {
    bg: 'var(--burgundy-soft)',
    color: 'var(--burgundy)',
    label: 'Отклонено',
  },
} as const;

const STATUS_OPTIONS = [
  { label: 'На рассмотрении', value: 'pending' },
  { label: 'Одобрено', value: 'approved' },
  { label: 'Отклонено', value: 'rejected' },
];

const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function UserRequestsListPage() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<CreateAdminRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CreateAdminRequest | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersService.fetchRegistrationRequests(
        selectedStatus,
        pagination.current,
        pagination.pageSize,
      );
      setRequests(response.requests);
      setPagination((prev) => ({ ...prev, total: response.total_count }));
    } catch (error) {
      console.error('Ошибка при загрузке запросов:', error);
      message.error('Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const showRoleModal = useCallback((record: CreateAdminRequest) => {
    setSelectedRequest(record);
    setRoleModalVisible(true);
  }, []);

  const handleApprove = useCallback(
    async (requestId: string, role: AdminRole) => {
      try {
        await usersService.approve(requestId, role);
        message.success('Заявка одобрена');
        setRoleModalVisible(false);
        setSelectedRequest(null);
        loadRequests();
      } catch (error) {
        message.error('Ошибка при одобрении заявки');
        console.error(error);
      }
    },
    [loadRequests],
  );

  const handleReject = useCallback(
    async (requestId: string) => {
      try {
        await usersService.reject(requestId);
        message.success('Заявка отклонена');
        setRoleModalVisible(false);
        setSelectedRequest(null);
        loadRequests();
      } catch (error) {
        message.error('Ошибка при отклонении заявки');
        console.error(error);
      }
    },
    [loadRequests],
  );

  const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    }));
  }, []);

  const handleStatusChange = useCallback((value: string | undefined) => {
    setSelectedStatus(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const columns: ColumnsType<CreateAdminRequest> = useMemo(
    () => [
      {
        title: 'Имя пользователя',
        dataIndex: 'username',
        key: 'username',
        width: '20%',
        sorter: (a, b) => a.username.localeCompare(b.username),
        render: (value: string) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-800)' }}>
            {value}
          </span>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '25%',
        sorter: (a, b) => a.email.localeCompare(b.email),
        render: (value: string) => <span className="mono-meta">{value}</span>,
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        width: '15%',
        render: (status: string) => {
          const tone = STATUS_TONES[status as keyof typeof STATUS_TONES];
          if (!tone) return <Tag>{status}</Tag>;
          return (
            <Tag
              style={{
                background: tone.bg,
                color: tone.color,
                borderColor: 'transparent',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontSize: 10,
              }}
            >
              {tone.label}
            </Tag>
          );
        },
      },
      {
        title: 'Дата создания',
        dataIndex: 'created_at',
        key: 'created_at',
        width: '20%',
        render: (date: string) => (
          <span className="mono-meta">{DATE_FORMATTER.format(new Date(date))}</span>
        ),
        sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      },
      {
        title: '',
        key: 'actions',
        width: 120,
        align: 'right',
        render: (_, record) =>
          record.status === 'pending' ? (
            <Space size={2}>
              <Button
                type="text"
                icon={<UserAddOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  showRoleModal(record);
                }}
                aria-label="Одобрить"
              />
              <Button
                type="text"
                danger
                icon={<UserDeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(record.id);
                }}
                aria-label="Отклонить"
              />
            </Space>
          ) : (
            <span
              style={{
                color: 'var(--ink-300)',
                fontStyle: 'italic',
                fontFamily: 'var(--font-display)',
              }}
            >
              обработано
            </span>
          ),
      },
    ],
    [showRoleModal, handleReject],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Приёмная"
        title="Заявки на регистрацию"
        description="Одобряйте или отклоняйте новые заявки. При одобрении можно сразу назначить роль администратора."
        actions={
          <Space>
            <span
              className="eyebrow"
              style={{ fontSize: 10, color: 'var(--ink-500)' }}
            >
              Фильтр
            </span>
            <Select
              placeholder="Все статусы"
              style={{ width: 200 }}
              value={selectedStatus}
              onChange={handleStatusChange}
              allowClear
              options={STATUS_OPTIONS}
            />
          </Space>
        }
      />

      {requests.length === 0 && !loading ? (
        <Empty description="Заявок не найдено" style={{ padding: '60px 0' }} />
      ) : (
        <Table<CreateAdminRequest>
          columns={columns}
          onRow={(record) => ({
            onClick: () => record.status === 'pending' && showRoleModal(record),
            style: record.status === 'pending' ? { cursor: 'pointer' } : undefined,
          })}
          rowKey={(record) => record.id}
          scroll={{ y: 600 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Всего: ${total}`,
          }}
          onChange={handleTableChange}
          dataSource={requests}
          loading={loading}
        />
      )}

      <RoleSelectionModal
        visible={roleModalVisible}
        request={selectedRequest}
        onCancel={() => {
          setRoleModalVisible(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
