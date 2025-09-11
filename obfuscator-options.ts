export const obfuscatorOptions = {
	compact: true, // Minify the code
	controlFlowFlattening: true, // Radically changes the structure of the code
	controlFlowFlatteningThreshold: 0.5, // Balance of protection/performance
	deadCodeInjection: false, // Increases the bundle size
	debugProtection: false, // May cause infinite loops
	disableConsoleOutput: false, // Removes console.log
	identifierNamesGenerator: 'mangled-shuffled', // Generating new identifier names
	rotateStringArray: true, // Dynamically shuffles lines
	selfDefending: false, // Conflicts with CDN optimizations
	stringArray: true, // Good protection without big problems
	stringArrayThreshold: 0.7, // What proportion of string literals in your code will be moved to stringArray
	transformObjectKeys: true, // Hide API structure
	unicodeEscapeSequence: false, // Bloats the code a lot
	reservedNames: [
		'^__next', // Next.js runtime
		'^__webpack', // Webpack chunks
		'^_app', // Next.js App component
		'^_document', // Next.js Document
		'^require', // CommonJS require
		'^exports', // CommonJS/ES6 exports
		'^module', // Module system
	],
}

export const pluginOptions = {
	enabled: process.env.NODE_ENV === 'production',
	patterns: ['.next/static/**/*.js'],
	obfuscateFiles: {
		buildManifest: false,
		ssgManifest: false,
		webpack: false,
	},
	log: true,
}
