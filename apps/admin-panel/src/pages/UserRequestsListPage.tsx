import {useEffect, useState} from 'react';
import {Button, Card, Space, Table, Modal, Select, Tag, Empty, message} from "antd";
import type {ColumnsType, TablePaginationConfig} from "antd/es/table";
import {UserDeleteOutlined, UserAddOutlined} from "@ant-design/icons";
import type {CreateAdminRequest} from "@/types/auth.ts";
import {usersService} from "../services/users.service.ts";

const STATUS_COLORS = {
    pending: 'blue',
    approved: 'green',
    rejected: 'red'
};

const STATUS_LABELS = {
    pending: 'На рассмотрении',
    approved: 'Одобрено',
    rejected: 'Отклонено'
};

export function UserRequestsListPage() {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<CreateAdminRequest[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Загрузка списка запросов при монтировании компонента и изменении фильтров
    useEffect(() => {
        loadRequests();
    }, [selectedStatus, pagination.current, pagination.pageSize]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await usersService.fetchRegistrationRequests(
                selectedStatus,
                pagination.current,
                pagination.pageSize
            );
            setRequests(response.requests);
            setPagination(prev => ({
                ...prev,
                total: response.total_count
            }));
        } catch (error) {
            console.error('Ошибка при загрузке запросов:', error);
            message.error('Ошибка при загрузке заявок');
        } finally {
            setLoading(false);
        }
    }

    // Описание колонок таблицы
    const columns: ColumnsType<CreateAdminRequest> = [
        {
            title: 'Имя пользователя',
            dataIndex: 'username',
            key: 'username',
            width: "15%",
            sorter: (a: CreateAdminRequest, b: CreateAdminRequest) => a.username.localeCompare(b.username),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: "20%",
            sorter: (a: CreateAdminRequest, b: CreateAdminRequest) => a.email.localeCompare(b.email),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: "15%",
            render: (status: string) => (
                <Tag color={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}>
                    {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
                </Tag>
            ),
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            key: 'created_at',
            width: "15%",
            render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
            sorter: (a: CreateAdminRequest, b: CreateAdminRequest) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: '10%',
            render: (_: any, record: CreateAdminRequest) => (
                record.status === 'pending' ? (
                    <Space size="small">
                        <Button
                            type="text"
                            icon={<UserAddOutlined style={{fontSize: 24}} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(record);
                            }}
                            title="Одобрить"
                        />
                        <Button
                            type="text"
                            danger
                            icon={<UserDeleteOutlined style={{fontSize: 24}}/>}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReject(record);
                            }}
                            title="Отклонить"
                        />
                    </Space>
                ) : (
                    <span style={{color: '#ccc'}}>Обработано</span>
                )
            ),
        }
    ];

    const showConfirmModal = (record: CreateAdminRequest) => {
        Modal.confirm({
            title: "Действия с пользователем",
            content: (
                <div>
                    <p><strong>Имя пользователя:</strong> {record.username}</p>
                    <p><strong>Email:</strong> {record.email}</p>
                    <p><strong>Статус:</strong> <Tag color={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[record.status as keyof typeof STATUS_LABELS] || record.status}
                    </Tag></p>
                    <p><strong>Дата создания:</strong> {new Date(record.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
            ),
            okText: "Одобрить",
            okType: "primary",
            onOk: () => handleApprove(record),
            cancelText: "Отклонить",
            footer: (
                originNode,
                extra
            ) => (
                <Space size="small" style={{float: 'right'}}>
                    <extra.CancelBtn/>
                    <Button type="default" danger onClick={() => {handleReject(record)}}>Отклонить</Button>
                    <extra.OkBtn/>
                </Space>
            ),
        });
    }

    const handleApprove = async (record: CreateAdminRequest) => {
        try {
            await usersService.approve(record.id);
            message.success('Заявка одобрена');
            loadRequests();
        } catch (error) {
            message.error('Ошибка при одобрении заявки');
            console.error(error);
        }
    }

    const handleReject = async (record: CreateAdminRequest) => {
        try {
            await usersService.reject(record.id);
            message.success('Заявка отклонена');
            loadRequests();
        } catch (error) {
            message.error('Ошибка при отклонении заявки');
            console.error(error);
        }
    }

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
            total: pagination.total
        });
    };

    const handleStatusChange = (value: string | undefined) => {
        setSelectedStatus(value);
        setPagination(prev => ({
            ...prev,
            current: 1 // Сброс на первую страницу при изменении фильтра
        }));
    };

    return (
        <div>
            <h1 style={{marginBottom: 24}}>Заявки на регистрацию</h1>
            <Card>
                <Space style={{marginBottom: 16}} size="large">
                    <span>Фильтр по статусу:</span>
                    <Select
                        placeholder="Все статусы"
                        style={{width: 200}}
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        allowClear
                        options={[
                            {label: 'На рассмотрении', value: 'pending'},
                            {label: 'Одобрено', value: 'approved'},
                            {label: 'Отклонено', value: 'rejected'},
                        ]}
                    />
                </Space>

                {requests.length === 0 && !loading ? (
                    <Empty description="Заявок не найдено" />
                ) : (
                    <Table
                        columns={columns}
                        onRow={(record) => ({
                            onClick: () => record.status === 'pending' && showConfirmModal(record),
                        })}
                        rowKey={(record) => record.id}
                        scroll={{y: 600}}
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
            </Card>
        </div>
    );
}

