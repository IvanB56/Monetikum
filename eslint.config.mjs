import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
        ],
    },
    {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": ["error", {
                groups: [
                    // импорты side-effect (например, полифиллы)
                    ["^\\u0000"],
                    // встроенные модули Node
                    ["^node:"],
                    // react/next — всегда первыми среди внешних пакетов
                    ["^react", "^next"],
                    // остальные внешние пакеты
                    ["^@?\\w"],
                    // внутренние алиасы FSD-слоёв: app → widgets → features → entities → shared
                    ["^@app(/.*|$)", "^@widgets(/.*|$)", "^@features(/.*|$)", "^@entities(/.*|$)", "^@shared(/.*|$)"],
                    // относительные импорты из родительских директорий
                    ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
                    // относительные импорты из текущей директории
                    ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
                    // стили — всегда последними
                    ["^.+\\.s?css$"],
                ],
            }],
            "simple-import-sort/exports": "error",
        },
    },
    {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        plugins: {
            boundaries,
        },
        settings: {
            "boundaries/include": ["src/**/*"],
            "boundaries/elements": [
                // Next.js App Router: весь src/app — один элемент "app" (роутинг, а не слайсы)
                { type: "app", pattern: "src/app", partialMatch: false },
                { type: "widgets", pattern: "src/widgets/*" },
                { type: "features", pattern: "src/features/*" },
                { type: "entities", pattern: "src/entities/*" },
                { type: "shared", pattern: "src/shared/*" },
            ],
        },
        rules: {
            "boundaries/dependencies": ["error", {
                default: "disallow",
                policies: [
                    // app → widgets → features → entities → shared, только вниз по слоям
                    { from: { element: { type: "app" } }, allow: { to: { element: { type: ["widgets", "features", "entities", "shared"] } } } },
                    { from: { element: { type: "widgets" } }, allow: { to: { element: { type: ["features", "entities", "shared"] } } } },
                    { from: { element: { type: "features" } }, allow: { to: { element: { type: ["entities", "shared"] } } } },
                    { from: { element: { type: "entities" } }, allow: { to: { element: { type: "shared" } } } },
                    { from: { element: { type: "shared" } }, allow: { to: { element: { type: "shared" } } } },
                    {
                        to: { element: { type: ["widgets", "features", "entities"] } },
                        disallow: { to: { element: { fileInternalPath: "!index.ts" } } },
                    },
                ],
            }],
        },
    },
];

export default eslintConfig;
