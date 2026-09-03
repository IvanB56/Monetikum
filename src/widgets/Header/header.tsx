'use client';
import React from 'react';

import {ActionIcon, Button, Container, Flex, Group} from '@mantine/core';
import {ListIcon} from '@phosphor-icons/react';

import {Logo} from '@shared/ui/Logo';

import styles from './header.module.scss';

const HeaderDesktop = () => (
  <Container size="responsive" className={styles.desktopOnly}>
    <Group justify={'space-between'}>
      <Logo/>
      <Flex gap={8}>
        <Button variant={'light'}>Войти</Button>
        <Button variant={'white'}>Регистрация</Button>
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
