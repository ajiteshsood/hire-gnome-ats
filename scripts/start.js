const { spawn } = require('node:child_process');

function buildDatabaseUrl() {
	const {
		DB_HOST,
		DB_PORT,
		DB_NAME,
		DB_USER,
		DB_PASSWORD
	} = process.env;

	if (!DB_HOST || !DB_NAME || !DB_USER || typeof DB_PASSWORD === 'undefined') {
		throw new Error(
			'Missing GoDaddy database environment variables. Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD.'
		);
	}

	const user = encodeURIComponent(DB_USER);
	const password = encodeURIComponent(DB_PASSWORD);
	const database = encodeURIComponent(DB_NAME);
	const port = DB_PORT || '3306';

	return `mysql://${user}:${password}@${DB_HOST}:${port}/${database}`;
}

process.env.DATABASE_URL = buildDatabaseUrl();

const next = spawn(
	process.platform === 'win32' ? 'npx.cmd' : 'npx',
	['next', 'start'],
	{
		stdio: 'inherit',
		env: process.env
	}
);

next.on('exit', (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
	} else {
		process.exit(code ?? 1);
	}
});
