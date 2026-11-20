import { spawn } from 'node:child_process';

const commands = [
  ['server/index.js'],
  ['node_modules/vite/bin/vite.js'],
];
const children = commands.map(([file]) =>
  spawn(process.execPath, [file], { stdio: 'inherit', env: process.env }),
);

let shuttingDown = false;
const stopChildren = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
};

process.on('SIGINT', stopChildren);
process.on('SIGTERM', stopChildren);
for (const [index, child] of children.entries()) {
  child.on('error', (error) => {
    console.error(`Development process failed (${commands[index][0]}):`, error.message);
    process.exitCode = 1;
    stopChildren();
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;

    const command = commands[index][0];
    console.error(
      `Development process stopped (${command})${signal ? ` after ${signal}` : ` with exit code ${code}`}.`,
    );
    process.exitCode = code || 1;
    stopChildren();
  });
}
