# Система тем приложения

## Обзор

Вместо разрозненных стилей в отдельных CSS-файлах, все настройки цветов и стилей теперь централизованы в файле `src/theme/index.ts` и применяются глобально через `ConfigProvider` от Ant Design.

## Структура

```
src/
├── theme/
│   └── index.ts          # Централизованная конфигурация темы
├── App.tsx               # ConfigProvider оборачивает всё приложение
└── components/           # Компоненты используют значения из темы
```

## Конфигурация темы

### Файл: `src/theme/index.ts`

Содержит:
1. **`appTheme`** - основная конфигурация темы для ConfigProvider
2. **`statisticCardColors`** - цвета для статистических карточек
3. **`statisticColors`** - цвета для компонентов статистики

### Основные токены темы

```typescript
{
  token: {
    // Основные цвета
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    
    // Цвета текста
    colorTextBase: '#262626',
    colorTextSecondary: '#8c8c8c',
    
    // Фоновые цвета
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    
    // Размеры и отступы
    borderRadius: 6,
    fontSize: 14,
    margin: 16,
    ...
  }
}
```

### Настройки компонентов

```typescript
{
  components: {
    Card: {
      colorBgContainer: '#ffffff',
      borderRadiusLG: 8,
    },
    Statistic: {
      contentFontSize: 24,
      titleFontSize: 14,
    },
    Button: {
      controlHeight: 32,
      controlHeightLG: 40,
    },
    ...
  }
}
```

## Использование

### 1. В компонентах React

Импортируйте нужные константы из темы:

```typescript
import { statisticCardColors, statisticColors } from '@/theme';

// Использование
<Card style={{ background: statisticCardColors.time.background }}>
  <Statistic 
    valueStyle={{ color: statisticColors.views }}
    value={1234}
  />
</Card>
```

### 2. В CSS файлах

CSS файлы теперь содержат только структурные стили (layout, positioning), без цветов:

```css
.document-viewer__content {
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  max-width: 900px;
  margin: 0 auto;
}
```

Цвета применяются либо через theme tokens, либо через inline styles с константами из темы.

## Преимущества

✅ **Централизация** - все цвета и настройки в одном месте  
✅ **Переиспользование** - легко применить тему к новым компонентам  
✅ **Консистентность** - единый дизайн во всём приложении  
✅ **Гибкость** - легко изменить тему для всего приложения  
✅ **Масштабируемость** - легко добавлять темы (тёмная, светлая и т.д.)  

## Изменение темы

Чтобы изменить цвета или стили во всём приложении:

1. Откройте `src/theme/index.ts`
2. Измените нужные значения в `appTheme`
3. Изменения применятся ко всем компонентам автоматически

## Добавление новых цветов

Если нужно добавить новые цвета для специфических случаев:

```typescript
// src/theme/index.ts
export const customColors = {
  myFeature: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
  },
};
```

Затем используйте в компонентах:

```typescript
import { customColors } from '@/theme';

<div style={{ color: customColors.myFeature.primary }}>
  ...
</div>
```

## Поддержка темизации в будущем

Для добавления поддержки нескольких тем (светлая/тёмная):

1. Создайте разные конфигурации:
```typescript
export const lightTheme: ThemeConfig = { ... };
export const darkTheme: ThemeConfig = { ... };
```

2. Используйте состояние для переключения:
```typescript
const [theme, setTheme] = useState(lightTheme);
<ConfigProvider theme={theme}>
  <App />
</ConfigProvider>
```

## Миграция существующих компонентов

При добавлении новых компонентов:
1. НЕ используйте хардкодные hex-цвета (#ffffff, #1890ff и т.д.)
2. Импортируйте цвета из `@/theme`
3. CSS файлы - только для структурных стилей
4. Цвета - только из темы или через theme tokens

