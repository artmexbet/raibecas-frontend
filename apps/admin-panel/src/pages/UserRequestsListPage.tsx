import {use, useEffect, useState} from 'react';
import {Button, Card, Space, Table, Modal} from "antd";
import type {ColumnsType} from "antd/es/table";
import {UserDeleteOutlined, UserAddOutlined} from "@ant-design/icons";
import type {CreateAdminRequest} from "@/types/auth.ts";
import {usersService} from "../services/users.service.ts";

export function UserRequestsListPage() {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<CreateAdminRequest[]>([]);

    // Загрузка списка запросов при монтировании компонента
    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const reqs = await usersService.fetchRegistrationRequests()
            setRequests(reqs);
        } catch (error) {
            console.error('Ошибка при загрузке запросов:', error);
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
            width: "20%",
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
            title: 'Запрос',
            dataIndex: 'request',
            key: 'request',
        },
        {
            title: 'Действия',
            key: 'actions',
            width: '10%',
            render: (_: any, record: CreateAdminRequest) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<UserAddOutlined style={{fontSize: 24}} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(record);
                        }}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<UserDeleteOutlined style={{fontSize: 24}}/>}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReject(record);
                        }}
                    />
                </Space>
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
                    <p><strong>Запрос:</strong> {record.request}</p>
                </div>
            ),
            okText: "Одобрить",
            okType: "danger",
            onOk: () => handleApprove(record),
            cancelText: "Отмена",
            footer: (
                originNode,
                extra
            ) => <>
                <Space size="small">
                    <extra.CancelBtn/>
                    <Button type="default" onClick={() => {handleReject(record)}}>Отклонить</Button>
                    <extra.OkBtn/>
                </Space>
            </>,
        });
    }

    const handleApprove = (record: CreateAdminRequest) => {
        usersService.approve(record.id); //todo: добавить обработку результата
    }

    const handleReject = (record: CreateAdminRequest) => {
        usersService.reject(record.id); //todo: добавить обработку результата
    }


    return (
        <div>
            <h1 style={{marginBottom: 24}}>Заявки на регистрацию</h1>
            <Card>
                <Table
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => showConfirmModal(record),
                    })}
                    rowKey={(record) => record.id}
                    scroll={{y: 600}}
                    pagination={false}
                    dataSource={requests}
                    loading={loading}
                />
            </Card>
        </div>
    );
}

