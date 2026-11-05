const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

const formatMessage = (level, color, message, meta) => {
  const timestamp = new Date().toISOString();
  const levelTag = `${color}[${level}]${colors.reset}`;
  const timeTag = `${colors.dim}${timestamp}${colors.reset}`;

  if (meta !== undefined) {
    const metaString =
      typeof meta === 'object'
        ? `\n${JSON.stringify(meta, null, 2)}`
        : ` ${meta}`;
    return `${timeTag} ${levelTag} ${message}${metaString}`;
  }

  return `${timeTag} ${levelTag} ${message}`;
};

export const logger = {
  info: (message, meta) => {
    console.log(formatMessage('INFO', colors.cyan, message, meta));
  },
  success: (message, meta) => {
    console.log(formatMessage('SUCCESS', colors.green, message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage('WARN', colors.yellow, message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage('ERROR', colors.red, message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage('DEBUG', colors.magenta, message, meta));
    }
  }
};
