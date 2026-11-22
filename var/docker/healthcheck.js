// Docker health check of the app container (docker-compose.coolify.yml).
//
// Healthy when the website (through nginx) and the backend both answer with
// anything but a server error. The point is to catch an app that stopped
// answering, not to judge a page: a stricter check that fails by mistake
// would make Traefik stop routing to the container. Docker only marks an
// unhealthy container, it never restarts it, and a hung app once kept
// wreckingsocial.com on "Gateway Timeout" until someone redeployed by hand.
// So after 3 failed checks in a row, once the container has been up for
// 10 minutes (startup runs the database migration and starts every process),
// this kills every process in the container. PID 1 (`sh -c "nginx && pnpm
// run pm2"`) then exits and `restart: always` starts a fresh container.

const fs = require('fs');

const FAIL_FILE = '/tmp/ws-health-failures';
const MAX_FAILURES = 3;
const MIN_UPTIME_SECONDS = 600;
const TIMEOUT_MS = 10000;

const answers = async (url) => {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.status < 500;
  } catch {
    return false;
  }
};

// Seconds since PID 1 started: /proc/uptime and the start time in
// /proc/1/stat (field 22, in clock ticks) both count from boot
const containerUptime = () => {
  try {
    const uptime = parseFloat(fs.readFileSync('/proc/uptime', 'utf8'));
    const stat = fs.readFileSync('/proc/1/stat', 'utf8');
    const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
    return uptime - parseInt(fields[19], 10) / 100;
  } catch {
    return 0;
  }
};

const readFailures = () => {
  try {
    return parseInt(fs.readFileSync(FAIL_FILE, 'utf8'), 10) || 0;
  } catch {
    return 0;
  }
};

(async () => {
  const website = await answers('http://127.0.0.1:5000/privacy');
  const backend = await answers('http://127.0.0.1:3000/health-check');

  if (website && backend) {
    fs.writeFileSync(FAIL_FILE, '0');
    process.exit(0);
  }

  const failures = readFailures() + 1;
  fs.writeFileSync(FAIL_FILE, String(failures));
  console.log(
    `unhealthy (website: ${website}, backend: ${backend}), failure ${failures}`
  );

  if (failures >= MAX_FAILURES && containerUptime() > MIN_UPTIME_SECONDS) {
    fs.writeFileSync(FAIL_FILE, '0');
    // -1: every process this user can signal except PID 1 and ourselves
    process.kill(-1, 'SIGKILL');
  }

  process.exit(1);
})();
