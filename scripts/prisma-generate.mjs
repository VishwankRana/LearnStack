import { spawn } from 'node:child_process'

const schemaPath = 'server/prisma/schema.prisma'
const prismaCommand = process.platform === 'win32' ? 'npx prisma' : 'npx'

runPrisma(
  process.platform === 'win32'
    ? ['generate', '--schema', schemaPath]
    : ['prisma', 'generate', '--schema', schemaPath],
)

function runPrisma(args) {
  const child = spawn(prismaCommand, args, {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  let stderr = ''

  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk)
  })

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString()
    stderr += text
    process.stderr.write(chunk)
  })

  child.on('exit', (code) => {
    if (code === 0) {
      process.exit(0)
    }

    if (stderr.includes('EPERM') && stderr.includes('.prisma\\client')) {
      console.error('\nPrisma Client regeneration was blocked by a locked Windows file.')
      console.error(
        'Stop running dev servers, pause OneDrive sync if needed, then rerun `npm run prisma:generate`.',
      )
    }

    process.exit(code ?? 1)
  })
}
