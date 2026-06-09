export const logger = {
  info(message, meta) {
    console.log(formatLog('INFO', message, meta))
  },
  error(message, meta) {
    console.error(formatLog('ERROR', message, meta))
  },
}

function formatLog(level, message, meta) {
  if (!meta) {
    return `[${level}] ${message}`
  }

  return `[${level}] ${message} ${JSON.stringify(meta)}`
}
