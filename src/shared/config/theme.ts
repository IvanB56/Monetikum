import {createTheme, defaultVariantColorsResolver, type MantineColorsTuple, rem, type VariantColorsResolver} from '@mantine/core';

const brand: MantineColorsTuple = [
  '#f0f8fa',
  '#d5ecf1',
  '#acd8e3',
  '#82c2d2',
  '#59acc0',
  '#4190a4',
  '#2b798c',
  '#226778',
  '#1b5361',
  '#15404a',
];

const orange: MantineColorsTuple = [
  '#fff6f0',
  '#feece0',
  '#fcdac2',
  '#fac6a3',
  '#f7b284',
  '#f4a16a',
  '#fb9048',
  '#fd7112',
  '#da5901',
  '#a74401',
];

const red: MantineColorsTuple = [
  '#fef0f0',
  '#fdd8d8',
  '#fbb2b2',
  '#f78b8b',
  '#f36464',
  '#ee4343',
  '#f71818',
  '#df0404',
  '#b50303',
  '#8a0303',
];

const textBrand: MantineColorsTuple = [
  '#f0f8fa',
  '#d5ecf1',
  '#acd8e2',
  '#82c2d2',
  '#59abc0',
  '#418fa3',
  '#2b788b',
  '#226677',
  '#1b5360',
  '#153f4a',
];

const fontFamily = 'var(--font-montserrat), sans-serif';

const variantColorResolver: VariantColorsResolver = (input) => {
  const defaultResolvedColors = defaultVariantColorsResolver(input);

  if (input.variant === 'white') {
    return {
      ...defaultResolvedColors,
      background: 'var(--mantine-color-white)',
      color: 'var(--mantine-primary-color-filled)',
      border: '1px solid var(--mantine-primary-color-filled)',
      hover: 'var(--mantine-primary-color-filled)',
      hoverColor: 'var(--mantine-color-white)',
    };
  }

  if (input.variant === 'light') {
    return {
      ...defaultResolvedColors,
      background: 'var(--mantine-color-white)',
      color: 'var(--mantine-primary-color-filled)',
      // border always tracks the current background (--button-bg at rest, --button-hover on hover — see button-variants.scss)
      border: '1px solid var(--button-bg)',
      hover: 'var(--mantine-primary-color-filled)',
      hoverColor: 'var(--mantine-color-white)',
    };
  }

  return defaultResolvedColors;
};

export const theme = createTheme({
  colors: {brand, orange, red, textBrand},
  primaryColor: 'brand',
  defaultRadius: 8,
  fontFamily,
  fontSizes: {
    sm: rem(13),
    md: rem(14),
    lg: rem(18),
  },
  headings: {
    fontFamily
  },
  variantColorResolver,
});
