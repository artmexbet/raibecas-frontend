import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Divider,
  message,
  Tabs,
  Space,
  InputNumber,
} from 'antd';
import {
  SettingOutlined,
  SafetyOutlined,
  BellOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export function SettingsPage() {
  const [generalForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSaveGeneral = async (values: any) => {
    try {
      setLoading(true);
      console.log('Сохранение общих настроек:', values);
      // TODO: Отправить запрос на сервер
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Общие настройки успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      message.error('Не удалось сохранить настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async (values: any) => {
    try {
      setLoading(true);
      console.log('Сохранение настроек безопасности:', values);
      // TODO: Отправить запрос на сервер
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Настройки безопасности успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      message.error('Не удалось сохранить настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async (values: any) => {
    try {
      setLoading(true);
      console.log('Сохранение настроек уведомлений:', values);
      // TODO: Отправить запрос на сервер
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Настройки уведомлений успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      message.error('Не удалось сохранить настройки');
    } finally {
      setLoading(false);
    }
  };

  const generalSettings = (
    <Card>
      <Form
        form={generalForm}
        layout="vertical"
        onFinish={handleSaveGeneral}
        initialValues={{
          siteName: 'Админ-панель Raibecas',
          siteDescription: 'Система управления документами и пользователями',
          language: 'ru',
          timezone: 'Europe/Moscow',
          maintenanceMode: false,
        }}
      >
        <Form.Item
          label="Название сайта"
          name="siteName"
          rules={[{ required: true, message: 'Введите название сайта' }]}
        >
          <Input placeholder="Название вашего сайта" />
        </Form.Item>

        <Form.Item
          label="Описание сайта"
          name="siteDescription"
        >
          <TextArea
            rows={3}
            placeholder="Краткое описание сайта"
          />
        </Form.Item>

        <Form.Item
          label="Язык системы"
          name="language"
        >
          <Select>
            <Option value="ru">Русский</Option>
            <Option value="en">English</Option>
            <Option value="kz">Қазақша</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Часовой пояс"
          name="timezone"
        >
          <Select>
            <Option value="Europe/Moscow">Москва (UTC+3)</Option>
            <Option value="Asia/Almaty">Алматы (UTC+6)</Option>
            <Option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</Option>
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item
          label="Режим обслуживания"
          name="maintenanceMode"
          valuePropName="checked"
          tooltip="Временно отключить доступ к сайту для всех пользователей, кроме администраторов"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить изменения
            </Button>
            <Button onClick={() => generalForm.resetFields()}>
              Сбросить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const securitySettings = (
    <Card>
      <Form
        form={securityForm}
        layout="vertical"
        onFinish={handleSaveSecurity}
        initialValues={{
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: true,
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          twoFactorAuth: false,
        }}
      >
        <h3>Требования к паролю</h3>

        <Form.Item
          label="Минимальная длина пароля"
          name="passwordMinLength"
          rules={[{ required: true, message: 'Укажите минимальную длину' }]}
        >
          <InputNumber min={6} max={32} />
        </Form.Item>

        <Form.Item
          label="Требовать заглавные буквы"
          name="passwordRequireUppercase"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Требовать цифры"
          name="passwordRequireNumbers"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Требовать специальные символы"
          name="passwordRequireSpecialChars"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider />

        <h3>Безопасность сеансов</h3>

        <Form.Item
          label="Время сеанса (минуты)"
          name="sessionTimeout"
          tooltip="Время неактивности до автоматического выхода"
        >
          <InputNumber min={5} max={480} />
        </Form.Item>

        <Form.Item
          label="Максимум попыток входа"
          name="maxLoginAttempts"
          tooltip="Количество неудачных попыток до блокировки"
        >
          <InputNumber min={3} max={10} />
        </Form.Item>

        <Form.Item
          label="Длительность блокировки (минуты)"
          name="lockoutDuration"
        >
          <InputNumber min={5} max={1440} />
        </Form.Item>

        <Divider />

        <Form.Item
          label="Двухфакторная аутентификация"
          name="twoFactorAuth"
          valuePropName="checked"
          tooltip="Требовать двухфакторную аутентификацию для всех пользователей"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить изменения
            </Button>
            <Button onClick={() => securityForm.resetFields()}>
              Сбросить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const notificationSettings = (
    <Card>
      <Form
        form={notificationForm}
        layout="vertical"
        onFinish={handleSaveNotifications}
        initialValues={{
          emailNotifications: true,
          newUserRequests: true,
          documentChanges: true,
          systemAlerts: true,
          emailFrom: 'noreply@raibecas.kz',
          smtpHost: '',
          smtpPort: 587,
          smtpUsername: '',
          smtpPassword: '',
        }}
      >
        <h3>Уведомления по email</h3>

        <Form.Item
          label="Включить email-уведомления"
          name="emailNotifications"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Уведомления о новых заявках"
          name="newUserRequests"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Уведомления об изменениях документов"
          name="documentChanges"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Системные оповещения"
          name="systemAlerts"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider />

        <h3>Настройки SMTP</h3>

        <Form.Item
          label="Email отправителя"
          name="emailFrom"
          rules={[{ type: 'email', message: 'Введите корректный email' }]}
        >
          <Input placeholder="noreply@example.com" />
        </Form.Item>

        <Form.Item
          label="SMTP хост"
          name="smtpHost"
        >
          <Input placeholder="smtp.example.com" />
        </Form.Item>

        <Form.Item
          label="SMTP порт"
          name="smtpPort"
        >
          <InputNumber min={1} max={65535} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="SMTP имя пользователя"
          name="smtpUsername"
        >
          <Input placeholder="username" />
        </Form.Item>

        <Form.Item
          label="SMTP пароль"
          name="smtpPassword"
        >
          <Input.Password placeholder="password" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить изменения
            </Button>
            <Button onClick={() => notificationForm.resetFields()}>
              Сбросить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  const items = [
    {
      key: 'general',
      label: (
        <span>
          <GlobalOutlined /> Общие
        </span>
      ),
      children: generalSettings,
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyOutlined /> Безопасность
        </span>
      ),
      children: securitySettings,
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Уведомления
        </span>
      ),
      children: notificationSettings,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <SettingOutlined style={{ fontSize: 24, marginRight: 12 }} />
        <h1 style={{ margin: 0 }}>Настройки системы</h1>
      </div>

      <Tabs defaultActiveKey="general" items={items} />
    </div>
  );
}
