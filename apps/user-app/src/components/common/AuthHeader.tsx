import React from 'react';
import {theme} from 'antd';
import {ThemeToggleButton} from './ThemeToggleButton';
import loginLogoSvg from '../../login_logo.svg';

/**
 * Хедер для страниц авторизации (login_logo по центру + переключатель темы справа)
 */
export function AuthHeader() {
    const {token} = theme.useToken();

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                height: 64,
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <div style={{width: 40}}/>

            <img
                src={loginLogoSvg}
                alt="Райбекас"
                style={{height: 36, width: 'auto'}}
            />

            <ThemeToggleButton/>
        </header>
    );
}

