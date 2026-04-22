/**
 * Writes DATABASE_URL and DIRECT_URL into .env from credentials in .env.local.
 *
 * Priority:
 *  1. If SUPABASE_DB_TRANSACTION_URL is set in .env.local → use it directly
 *  2. Otherwise construct from SUPABASE_DB_PASSWORD + hardcoded project ref
 *
 * To get the correct connection strings:
 *   Supabase Dashboard → Project Settings → Database → Connection string
 *   Copy "Transaction pooler" URL and set it as SUPABASE_DB_TRANSACTION_URL in .env.local
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const root = process.cwd()
const PROJECT_REF = 'pgpanwxliivhybvbeqbz'

function parseEnv(content) {
  const vars = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    vars[key] = val
  }
  return vars
}

let localEnv
try {
  localEnv = parseEnv(readFileSync(resolve(root, '.env.local'), 'utf8'))
} catch {
  console.error('Could not read .env.local')
  process.exit(1)
}

let databaseUrl, directUrl

if (localEnv['DATABASE_URL']) {
  // Parse and re-encode the URL in case the password has special characters
  const raw = localEnv['DATABASE_URL']
  // Match: scheme://user:PASSWORD@host:port/db?params
  // The password may contain @ or # so we can't split naively — match everything between first : after user and last @ before host
  const schemeUserEnd = raw.indexOf('://')
  const atHostIdx = raw.lastIndexOf('@')
  const schemeUser = raw.slice(0, schemeUserEnd + 3) // "postgresql://"
  const userColonIdx = raw.indexOf(':', schemeUserEnd + 3)
  const user = raw.slice(schemeUserEnd + 3, userColonIdx)
  const rawPassword = raw.slice(userColonIdx + 1, atHostIdx)
  const hostAndRest = raw.slice(atHostIdx + 1)
  const encodedPassword = encodeURIComponent(decodeURIComponent(rawPassword))
  databaseUrl = `${schemeUser}${user}:${encodedPassword}@${hostAndRest}`
  if (!databaseUrl.includes('pgbouncer=true')) {
    databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1'
  }
  directUrl = localEnv['DIRECT_URL'] ?? databaseUrl.replace(':6543/', ':5432/').replace(/[?&]pgbouncer=true/, '').replace(/[?&]connection_limit=\d+/, '').replace(/[?&]$/, '')
  console.log('✓ Using DATABASE_URL from .env.local (password re-encoded)')
} else if (localEnv['SUPABASE_DB_TRANSACTION_URL']) {
  databaseUrl = localEnv['SUPABASE_DB_TRANSACTION_URL']
  directUrl = databaseUrl.replace(':6543/', ':5432/').replace(/[?&]pgbouncer=true/, '').replace(/[?&]connection_limit=\d+/, '')
  console.log('✓ Using SUPABASE_DB_TRANSACTION_URL from .env.local')
} else {
  const password = localEnv['SUPABASE_DB_PASSWORD']
  if (!password) {
    console.error('No DATABASE_URL, SUPABASE_DB_TRANSACTION_URL, or SUPABASE_DB_PASSWORD found in .env.local')
    process.exit(1)
  }
  const enc = encodeURIComponent(password)
  databaseUrl = `postgresql://postgres.${PROJECT_REF}:${enc}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
  directUrl = `postgresql://postgres.${PROJECT_REF}:${enc}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
  console.log('✓ Constructed URLs from SUPABASE_DB_PASSWORD')
}

let envContent
try {
  envContent = readFileSync(resolve(root, '.env'), 'utf8')
} catch {
  envContent = ''
}

if (/^DATABASE_URL=/m.test(envContent)) {
  envContent = envContent.replace(/^DATABASE_URL=.*/m, `DATABASE_URL="${databaseUrl}"`)
} else {
  envContent += `\nDATABASE_URL="${databaseUrl}"\n`
}

if (/^DIRECT_URL=/m.test(envContent)) {
  envContent = envContent.replace(/^DIRECT_URL=.*/m, `DIRECT_URL="${directUrl}"`)
} else {
  envContent += `DIRECT_URL="${directUrl}"\n`
}

writeFileSync(resolve(root, '.env'), envContent, 'utf8')
console.log('✓ DATABASE_URL and DIRECT_URL written to .env')

// Also update .env.local so Next.js runtime uses the encoded URL
let localEnvContent = readFileSync(resolve(root, '.env.local'), 'utf8')
if (/^DATABASE_URL=/m.test(localEnvContent)) {
  localEnvContent = localEnvContent.replace(/^DATABASE_URL=.*/m, `DATABASE_URL="${databaseUrl}"`)
  writeFileSync(resolve(root, '.env.local'), localEnvContent, 'utf8')
  console.log('✓ DATABASE_URL (encoded) also updated in .env.local')
}
