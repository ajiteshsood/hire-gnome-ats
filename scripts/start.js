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

function run(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: 'inherit',
			env: process.env
		});

		child.on('error', reject);

		child.on('exit', (code, signal) => {
			if (signal) {
				reject(new Error(`${command} terminated by ${signal}`));
			} else if (code !== 0) {
				reject(new Error(`${command} exited with code ${code}`));
			} else {
				resolve();
			}
		});
	});
}

async function main() {
	const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

	// Apply all production Prisma migrations before starting Hire Gnome.
	await run(npx, ['prisma', 'migrate', 'deploy']);

	// Start the Next.js production server.
	await run(npx, ['next', 'start']);
}

main().catch((error) => {
	console.error('[startup] Failed:', error);
	process.exit(1);
});
