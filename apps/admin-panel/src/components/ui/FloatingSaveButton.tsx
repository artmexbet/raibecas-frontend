import { useEffect, useRef, useState } from 'react';
import { Button, theme } from 'antd';
import type { FormInstance } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export interface FloatingSaveButtonProps {
  form: FormInstance;
  loading?: boolean;
  label?: string;
  /** Ref to the inline submit button — while it is visible the floating button hides. */
  inlineRef: React.RefObject<HTMLElement | null>;
}

/**
 * Pill-shaped floating "Save" button that appears in the bottom-right corner
 * and hides itself when the inline submit button is visible in the viewport.
 */
export function FloatingSaveButton({
  form,
  loading = false,
  label = 'Сохранить',
  inlineRef,
}: FloatingSaveButtonProps) {
  const { token } = theme.useToken();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = inlineRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating button when the inline one is NOT visible
        setVisible(!entry!.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inlineRef]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 200,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <Button
        type="primary"
        shape="round"
        icon={<SaveOutlined />}
        size="large"
        loading={loading}
        onClick={() => form.submit()}
        style={{
          boxShadow: token.boxShadowSecondary,
          paddingLeft: 20,
          paddingRight: 20,
          fontWeight: 500,
        }}
      >
        {label}
      </Button>
    </div>
  );
}
