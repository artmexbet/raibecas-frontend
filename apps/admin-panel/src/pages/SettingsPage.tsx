import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  message,
} from 'antd';
import type { FormInstance } from 'antd';
import {
  BellOutlined,
  GlobalOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { PageHeader, SectionLabel } from '@/components';

const { Option } = Select;
const { TextArea } = Input;

/* ------------------------------------------------------------------ */
/* Shared card shell for settings sections                            */
/* ------------------------------------------------------------------ */

const SettingsSurface = memo(function SettingsSurface({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: '28px 32px',
      }}
    >
      {children}
    </div>
  );
});

const FormActions = memo(function FormActions({
  loading,
  form,
  onCancel,
}: {
  loading: boolean;
  form: FormInstance;
  onCancel?: () => void;
}) {
  const onReset = useCallback(() => {
    form.resetFields();
    if (onCancel) onCancel();
  }, [form, onCancel]);
  return (
    <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          Сохранить изменения
        </Button>
        <Button onClick={onReset} disabled={loading}>
          Сбросить
        </Button>
      </Space>
    </Form.Item>
  );
});

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

const GENERAL_INITIAL = {
  siteName: 'Админ-панель Raibecas',
  siteDescription: 'Система управления документами и пользователями',
  language: 'ru',
  timezone: 'Europe/Moscow',
  maintenanceMode: false,
};

const SECURITY_INITIAL = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  twoFactorAuth: false,
};

const NOTIFICATIONS_INITIAL = {
  emailNotifications: true,
  newUserRequests: true,
  documentChanges: true,
  systemAlerts: true,
  emailFrom: 'noreply@raibecas.kz',
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
};

export function SettingsPage() {
  const [generalForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const makeSaveHandler = useCallback(
    (label: string) => async (values: unknown) => {
      try {
        setLoading(true);
        console.log(`Сохранение настроек [${label}]:`, values);
        // TODO: отправить запрос на сервер
        await new Promise((resolve) => setTimeout(resolve, 1000));
        message.success(`Настройки "${label}" сохранены`);
      } catch (error) {
        console.error(`Ошибка при сохранении настроек [${label}]:`, error);
        message.error('Не удалось сохранить настройки');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSaveGeneral = useMemo(() => makeSaveHandler('Общие'), [makeSaveHandler]);
  const handleSaveSecurity = useMemo(() => makeSaveHandler('Безопасность'), [makeSaveHandler]);
  const handleSaveNotifications = useMemo(
    () => makeSaveHandler('Уведомления'),
    [makeSaveHandler],
  );

  const generalSettings = (
    <SettingsSurface>
      <SectionLabel>Идентификация платформы</SectionLabel>
      <Form
        form={generalForm}
        layout="vertical"
        onFinish={handleSaveGeneral}
        initialValues={GENERAL_INITIAL}
      >
        <Form.Item
          label="Название сайта"
          name="siteName"
          rules={[{ required: true, message: 'Введите название сайта' }]}
        >
          <Input placeholder="Название вашего сайта" />
        </Form.Item>

        <Form.Item label="Описание сайта" name="siteDescription">
          <TextArea rows={3} placeholder="Краткое описание сайта" />
        </Form.Item>

        <SectionLabel marginTop={12}>Локализация и&nbsp;часовой пояс</SectionLabel>

        <Form.Item label="Язык системы" name="language">
          <Select>
            <Option value="ru">Русский</Option>
            <Option value="en">English</Option>
            <Option value="kz">Қазақша</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Часовой пояс" name="timezone">
          <Select>
            <Option value="Europe/Moscow">Москва (UTC+3)</Option>
            <Option value="Asia/Almaty">Алматы (UTC+6)</Option>
            <Option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</Option>
          </Select>
        </Form.Item>

        <SectionLabel marginTop={12}>Режим обслуживания</SectionLabel>

        <Form.Item
          label="Режим обслуживания"
          name="maintenanceMode"
          valuePropName="checked"
          tooltip="Временно отключить доступ к сайту для всех пользователей, кроме администраторов"
        >
          <Switch />
        </Form.Item>

        <FormActions loading={loading} form={generalForm} />
      </Form>
    </SettingsSurface>
  );

  const securitySettings = (
    <SettingsSurface>
      <SectionLabel>Требования к паролю</SectionLabel>
      <Form
        form={securityForm}
        layout="vertical"
        onFinish={handleSaveSecurity}
        initialValues={SECURITY_INITIAL}
      >
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

        <SectionLabel marginTop={24}>Безопасность сеансов</SectionLabel>

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

        <Form.Item label="Длительность блокировки (минуты)" name="lockoutDuration">
          <InputNumber min={5} max={1440} />
        </Form.Item>

        <SectionLabel marginTop={24}>Двухфакторная аутентификация</SectionLabel>

        <Form.Item
          label="Требовать 2FA для всех пользователей"
          name="twoFactorAuth"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <FormActions loading={loading} form={securityForm} />
      </Form>
    </SettingsSurface>
  );

  const notificationSettings = (
    <SettingsSurface>
      <SectionLabel>Уведомления по email</SectionLabel>
      <Form
        form={notificationForm}
        layout="vertical"
        onFinish={handleSaveNotifications}
        initialValues={NOTIFICATIONS_INITIAL}
      >
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

        <Form.Item label="Системные оповещения" name="systemAlerts" valuePropName="checked">
          <Switch />
        </Form.Item>

        <SectionLabel marginTop={24}>Настройки SMTP</SectionLabel>

        <Form.Item
          label="Email отправителя"
          name="emailFrom"
          rules={[{ type: 'email', message: 'Введите корректный email' }]}
        >
          <Input placeholder="noreply@example.com" />
        </Form.Item>

        <Form.Item label="SMTP хост" name="smtpHost">
          <Input placeholder="smtp.example.com" />
        </Form.Item>

        <Form.Item label="SMTP порт" name="smtpPort">
          <InputNumber min={1} max={65535} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="SMTP имя пользователя" name="smtpUsername">
          <Input placeholder="username" />
        </Form.Item>

        <Form.Item label="SMTP пароль" name="smtpPassword">
          <Input.Password placeholder="password" />
        </Form.Item>

        <FormActions loading={loading} form={notificationForm} />
      </Form>
    </SettingsSurface>
  );

  const tabItems = useMemo(
    () => [
      {
        key: 'general',
        label: (
          <span>
            <GlobalOutlined style={{ marginRight: 6 }} /> Общие
          </span>
        ),
        children: generalSettings,
      },
      {
        key: 'security',
        label: (
          <span>
            <SafetyOutlined style={{ marginRight: 6 }} /> Безопасность
          </span>
        ),
        children: securitySettings,
      },
      {
        key: 'notifications',
        label: (
          <span>
            <BellOutlined style={{ marginRight: 6 }} /> Уведомления
          </span>
        ),
        children: notificationSettings,
      },
    ],
    [generalSettings, securitySettings, notificationSettings],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Настройки"
        title="Конфигурация системы"
        description="Общие параметры платформы, правила безопасности и каналы уведомлений."
      />
      <Tabs defaultActiveKey="general" items={tabItems} />
    </div>
  );
}
