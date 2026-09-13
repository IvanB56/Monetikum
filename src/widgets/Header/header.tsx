'use client';
import React from 'react';
import Link from 'next/link';

import {ActionIcon, Button, Container, Flex, Group} from '@mantine/core';
import {ListIcon} from '@phosphor-icons/react';

import {SPONSOR_ROLE} from '@shared/config/auth';
import {buildAuthorizationHref} from '@shared/lib/authorization-url';
import {Logo} from '@shared/ui/Logo';

import styles from './header.module.scss';

const LOGIN_HREF = buildAuthorizationHref(null, 'login');
const REGISTER_HREF = buildAuthorizationHref(SPONSOR_ROLE, 'register');

const HeaderDesktop = () => (
  <Container size="responsive" className={styles.desktopOnly}>
    <Group justify={'space-between'}>
      <Logo/>
      <Flex gap={8}>
        <Button variant={'light'} component={Link} href={LOGIN_HREF}>
          Войти
        </Button>
        <Button variant={'white'} component={Link} href={REGISTER_HREF}>
          Регистрация
        </Button>
      </Flex>
    </Group>
  </Container>
);

const HeaderMobile = () => (
  <Container size="responsive" className={styles.mobileOnly}>
    <Group justify={'space-between'}>
      <Logo/>
      <ActionIcon variant="white" aria-label="Menu">
        <ListIcon style={{width: '70%', height: '70%'}}/>
      </ActionIcon>
    </Group>
  </Container>
);

export const Header = () => (
  <header className={styles.header}>
    <HeaderDesktop/>
    <HeaderMobile/>
  </header>
);
