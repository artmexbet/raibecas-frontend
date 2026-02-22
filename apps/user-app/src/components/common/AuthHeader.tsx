import React from 'react';
import {theme} from 'antd';
import loginLogoSvg from '../../login_logo.svg';

/**
 * Хедер для страниц авторизации (только login_logo)
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
                justifyContent: 'center',
                padding: '0 40px',
                height: 64,
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <img
                src={loginLogoSvg}
                alt="Райбекас"
                style={{height: 36, width: 'auto'}}
            />
        </header>
    );
}

