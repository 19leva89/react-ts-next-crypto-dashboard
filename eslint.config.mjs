import jsdoc from 'eslint-plugin-jsdoc'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
})

const eslintConfig = [
	...compat.config({
		extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
			'react/react-in-jsx-scope': 'off',
		},
	}),
	{
		plugins: {
			jsdoc,
		},
		rules: {
			// Basic rules of JSDoc
			'jsdoc/require-description': 'warn', // Requires that all functions (and potentially other contexts) have a description
			'jsdoc/require-param': 'warn', // Requires that all function parameters are documented with a @param tag
			'jsdoc/require-returns': 'warn', // Requires that returns are documented with @returns
			'jsdoc/require-jsdoc': [
				'warn',
				{
					require: {
						FunctionDeclaration: true, // required function description
						MethodDefinition: false, // required method description
						ClassDeclaration: false, // required class description
						ArrowFunctionExpression: false, // required arrow function description
						FunctionExpression: false, // required function expression
					},
				},
			],
			// Additional useful rules
			'jsdoc/check-alignment': 'warn', // Reports invalid alignment of JSDoc block asterisks
			'jsdoc/check-param-names': 'warn', // Checks for dupe @param names, that nested param names have roots, and that parameter names in function declarations match JSDoc param names
			'jsdoc/check-types': 'warn', // Reports types deemed invalid (customizable and with defaults, for preventing and/or recommending replacements)
			'jsdoc/valid-types': 'warn', // Requires all types/name-paths to be valid JSDoc, Closure compiler, or TypeScript types (configurable in settings)
		},
	},
]

export default eslintConfig