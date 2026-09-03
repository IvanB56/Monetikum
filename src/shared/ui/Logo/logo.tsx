import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './logo.module.scss';

export const Logo = () => {
  return (
    <Link href={'/'} className={styles.logo}>
      <Image
        src={'/images/logo-index.png'}
        alt={'Monetikum'}
        width={200}
        height={32}
        priority
      />
    </Link>
  );
};