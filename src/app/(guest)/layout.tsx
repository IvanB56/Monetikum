import { ReactNode } from 'react';

import { Header } from '@widgets/Header';

export default function GuestLayout({ children }: { children: ReactNode }) {
  return <><Header/>{ children }</>;
}