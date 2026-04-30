/// <reference types="vitest/config" />

import path from "node:path";
// https://vite.dev/config/
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [
					[
						"@locator/babel-jsx/dist",
						{
							env: "development",
						},
					],
				],
			},
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	test: {
		projects: [
			{
				test: {
					name: "unit",
					environment: "node",
					include: ["src/test/**/*.ts"],
					alias: {
						"@": path.resolve(__dirname, "src"),
					},
				},
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(__dirname, ".storybook"),
					}),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: "chromium",
							},
						],
					},
					setupFiles: [".storybook/vitest.setup.ts"],
				},
			},
		],
	},
});
