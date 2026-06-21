import React, {useState} from 'react';
import {Button, Form, Input, message, Modal, theme, Typography} from 'antd';
import {EyeInvisibleOutlined, EyeOutlined} from '@ant-design/icons';
import {useNavigate} from '@tanstack/react-router';
import {authService} from '@/services/auth.service';
import type {RegisterRequest} from '@/types/auth';
import {AuthFolderCard, AuthHeader, PageBackground} from '@/components/common';

const {Text, Paragraph, Title} = Typography;

interface RegisterFormValues {
    login: string;
    password: string;
    confirmPassword: string;
}

export function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<RegisterFormValues>();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();
    const {token} = theme.useToken();

    const handleRegister = async (values: RegisterFormValues) => {
        setLoading(true);
        try {
            const data: RegisterRequest = {
                username: values.login,
                email: values.login,
                password: values.password,
            };
            await authService.register(data);
            setShowSuccessModal(true);
        } catch (error: unknown) {
            const err = error as { response?: { status: number; data?: { message?: string } } };
            if (err.response?.status === 409) {
                message.error('Пользователь с таким логином уже существует');
            } else {
                message.error(err.response?.data?.message ?? 'Ошибка при регистрации. Попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessOk = () => {
        setShowSuccessModal(false);
        navigate({to: '/login'});
    };

    const folderTabs = [
        {key: 'login', label: 'Авторизация', to: '/login', active: false},
        {key: 'register', label: 'Регистрация', to: '/register', active: true},
    ];

    return (
        <div
            style={{
                minHeight: '100vh',
                background: token.colorBgLayout,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Подпись на весь фон */}
            <PageBackground opacity={0.08}/>

            {/* Хедер с логотипом */}
            <AuthHeader/>

            {/* Центрированный контент */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '64px 24px 24px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <AuthFolderCard tabs={folderTabs}>
                    <Form form={form} layout="vertical" onFinish={handleRegister}>
                        <Form.Item
                            label={<Text style={{fontSize: 15}}>Логин</Text>}
                            name="login"
                            rules={[{required: true, message: 'Введите логин'}]}
                            style={{marginBottom: 20}}
                        >
                            <Input
                                placeholder="Введите логин"
                                size="large"
                                style={{
                                    borderRadius: 12,
                                    background: token.colorFillSecondary,
                                    borderColor: token.colorBorder,
                                    height: 48,
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text style={{fontSize: 15}}>Пароль</Text>}
                            name="password"
                            rules={[{required: true, message: 'Введите пароль'}]}
                            style={{marginBottom: 20}}
                        >
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Введите пароль"
                                size="large"
                                suffix={
                                    <Button
                                        type="text"
                                        icon={showPassword ? <EyeOutlined/> : <EyeInvisibleOutlined/>}
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{padding: 0, color: token.colorTextSecondary}}
                                    />
                                }
                                style={{
                                    borderRadius: 12,
                                    background: token.colorFillSecondary,
                                    borderColor: token.colorBorder,
                                    height: 48,
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text style={{fontSize: 15}}>Повторите пароль</Text>}
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                {required: true, message: 'Подтвердите пароль'},
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Пароли не совпадают'));
                                    },
                                }),
                            ]}
                            style={{marginBottom: 24}}
                        >
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Введите пароль ещё раз"
                                size="large"
                                suffix={
                                    <Button
                                        type="text"
                                        icon={showConfirmPassword ? <EyeOutlined/> : <EyeInvisibleOutlined/>}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{padding: 0, color: token.colorTextSecondary}}
                                    />
                                }
                                style={{
                                    borderRadius: 12,
                                    background: token.colorFillSecondary,
                                    borderColor: token.colorBorder,
                                    height: 48,
                                }}
                            />
                        </Form.Item>

                        <Form.Item style={{marginBottom: 0, textAlign: 'center'}}>
                            <Button
                                type="default"
                                htmlType="submit"
                                loading={loading}
                                size="large"
                                style={{
                                    borderRadius: 20,
                                    height: 44,
                                    padding: '0 48px',
                                    background: token.colorFill,
                                    borderColor: token.colorBorder,
                                    color: token.colorText,
                                }}
                            >
                                Отправить заявку
                            </Button>
                        </Form.Item>
                    </Form>
                </AuthFolderCard>
            </div>

            {/* Модалка успеха */}
            <Modal
                open={showSuccessModal}
                footer={null}
                closable={false}
                centered
                width={360}
                styles={{
                    body: {
                        padding: '32px 24px',
                        textAlign: 'center',
                    },
                }}
                style={{
                    background: token.colorBgContainer,
                    borderRadius: 16,
                }}
            >
                <Title level={4} style={{marginBottom: 16, color: token.colorText, fontSize: 18}}>
                    Ваша заявка на регистрацию успешно отправлена!
                </Title>
                <Paragraph style={{color: token.colorTextSecondary, marginBottom: 24, fontSize: 14}}>
                    Наши администраторы рассмотрят ее в ближайшее время, после чего вы сможете получить доступ к
                    платформе
                </Paragraph>
                <Button
                    type="default"
                    size="large"
                    onClick={handleSuccessOk}
                    style={{
                        borderRadius: 20,
                        padding: '0 32px',
                        height: 44,
                        background: token.colorFill,
                        borderColor: token.colorBorder,
                    }}
                >
                    Спасибо, жду!
                </Button>
            </Modal>
        </div>
    );
}
