import { spawn } from 'node:child_process'

const schemaPath = 'server/prisma/schema.prisma'
const forwardedArgs = process.argv.slice(2)
const prismaCommand = process.platform === 'win32' ? 'npx prisma' : 'npx'

runPrisma(
  process.platform === 'win32'
    ? ['migrate', 'dev', '--schema', schemaPath, ...forwardedArgs]
    : ['prisma', 'migrate', 'dev', '--schema', schemaPath, ...forwardedArgs],
)

function runPrisma(args) {
  // Use fully-inherited stdio so Prisma's interactive prompts
  // (e.g. "Enter a name for the new migration:") display and accept
  // input correctly in an interactive terminal.
  const child = spawn(prismaCommand, args, {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    if (code === 0) {
      process.exit(0)
    }

    if (process.platform === 'win32') {
      console.error(
        '\nIf the migration applied but Prisma Client was not regenerated,',
      )
      console.error(
        'stop all dev servers and run `npm run prisma:generate` once the OneDrive/Windows lock clears.',
      )
    }

    process.exit(code ?? 1)
  })
}
