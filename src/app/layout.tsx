import {ReactNode} from "react";

import {ColorSchemeScript, mantineHtmlProps} from "@mantine/core";

import {montserrat} from "@shared/config/fonts";
import {AppMantineProvider} from "@shared/config/mantine-provider";
import {QueryProvider} from "@shared/lib/query";

import '@mantine/core/styles.css';
import '@shared/config/typography.scss';
import '@shared/config/container.scss';
import '@shared/config/button-variants.scss';

export default function RootLayout({children}: { children: ReactNode }) {

  return (
    <html lang="ru" className={montserrat.variable} {...mantineHtmlProps}>
    <head>
      <title>Monetikum</title>
      <ColorSchemeScript/>
    </head>
    <body>
    <QueryProvider>
      <AppMantineProvider>
        {children}
      </AppMantineProvider>
    </QueryProvider>
    </body>
    </html>
  )
}