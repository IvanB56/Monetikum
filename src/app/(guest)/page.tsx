import {Button, Title} from "@mantine/core";

import {Header} from "@widgets/Header";

export default function Page() {
  return (
    <div>
      <Header />
      <Title order={1}>Hello, Next.js!</Title>
      <Button size="sm">
        Кнопка
      </Button>
    </div>
  )
}