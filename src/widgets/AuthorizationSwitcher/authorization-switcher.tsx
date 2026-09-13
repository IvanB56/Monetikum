'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { SegmentedControl, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text } from '@mantine/core';

import type { UserRole } from '@shared/config/auth';
import { SPONSOR_ROLE, STUDENT_ROLE } from '@shared/config/auth';
import {
  AUTHORIZATION_ROLE_PLACEHOLDER,
  AUTHORIZATION_SPONSOR_ROLE_LABEL,
  AUTHORIZATION_STUDENT_ROLE_LABEL,
  LOGIN_MODE_LABEL,
  REGISTER_MODE_LABEL,
} from '@shared/constants';
import type { AuthMode } from '@shared/lib/authorization-url';
import { buildAuthorizationSearch, isAuthMode, isUserRole, parseMode, parseRole } from '@shared/lib/authorization-url';
import { SuspenseFallback } from '@shared/ui/Suspense';

const ROLE_OPTIONS = [
  { label: AUTHORIZATION_SPONSOR_ROLE_LABEL, value: SPONSOR_ROLE },
  { label: AUTHORIZATION_STUDENT_ROLE_LABEL, value: STUDENT_ROLE },
];

// Формы разбиты на отдельный чанк через next/dynamic — до выбора роли ни одна
// из них не нужна, а рендерится максимум одна-две одновременно. `loading`
// рендерит тот же брендированный SuspenseFallback, что и внешняя граница в
// (guest)/authorization/page.tsx: у dynamic() своя внутренняя Suspense-граница,
// которая перехватывает suspend раньше внешней.
const SponsorLoginForm = dynamic(() => import('@features/auth').then((m) => m.SponsorLoginForm), {
  loading: () => <SuspenseFallback/>
});
const SponsorRegisterForm = dynamic(() => import('@features/auth').then((m) => m.SponsorRegisterForm), {
  loading: () => <SuspenseFallback/>
});
const StudentLoginForm = dynamic(() => import('@features/auth').then((m) => m.StudentLoginForm), {
  loading: () => <SuspenseFallback/>
});

export const AuthorizationSwitcher = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const role = parseRole(searchParams);
  const mode = parseMode(searchParams, role);

  const updateSearch = (nextRole: UserRole | null, nextMode: AuthMode) => {
    router.replace(`${ pathname }?${ buildAuthorizationSearch(nextRole, nextMode) }`, { scroll: false });
  };

  return (
    <Stack>
      { role === null ? <Text>{ AUTHORIZATION_ROLE_PLACEHOLDER }</Text> : null }
      <SegmentedControl
        data={ ROLE_OPTIONS }
        value={ role ?? '' }
        onChange={ (next) => {
          if (isUserRole(next)) updateSearch(next, 'login');
        } }
      />
      { role === STUDENT_ROLE ? <StudentLoginForm/> : null }
      { role === SPONSOR_ROLE ? (
        <Tabs value={ mode } onChange={ (next) => {
          if (next !== null && isAuthMode(next)) updateSearch(SPONSOR_ROLE, next);
        } }>
          <TabsList>
            <TabsTab value="login">{ LOGIN_MODE_LABEL }</TabsTab>
            <TabsTab value="register">{ REGISTER_MODE_LABEL }</TabsTab>
          </TabsList>
          <TabsPanel value="login">
            <SponsorLoginForm/>
          </TabsPanel>
          <TabsPanel value="register">
            <SponsorRegisterForm onSwitchToLogin={ () => updateSearch(SPONSOR_ROLE, 'login') }/>
          </TabsPanel>
        </Tabs>
      ) : null }
    </Stack>
  );
};
