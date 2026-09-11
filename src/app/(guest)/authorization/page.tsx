import { Container, Tabs, TabsList, TabsPanel, TabsTab } from '@mantine/core';

import { SponsorLoginForm, SponsorRegisterForm, StudentLoginForm } from '@features/auth';
import { SPONSOR_LOGIN_TAB_LABEL, SPONSOR_REGISTER_TAB_LABEL, STUDENT_LOGIN_TAB_LABEL } from '@shared/constants';

const Page = () => {
  return (
    <Container size="responsive">
      <Tabs defaultValue="sponsor">
        <TabsList>
          <TabsTab value="sponsor">{ SPONSOR_LOGIN_TAB_LABEL }</TabsTab>
          <TabsTab value="student">{ STUDENT_LOGIN_TAB_LABEL }</TabsTab>
          <TabsTab value="sponsor-register">{ SPONSOR_REGISTER_TAB_LABEL }</TabsTab>
        </TabsList>
        <TabsPanel value="sponsor">
          <SponsorLoginForm/>
        </TabsPanel>
        <TabsPanel value="student">
          <StudentLoginForm/>
        </TabsPanel>
        <TabsPanel value="sponsor-register">
          <SponsorRegisterForm/>
        </TabsPanel>
      </Tabs>
    </Container>
  );
};

export default Page;
