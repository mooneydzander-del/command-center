import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? 'website-assets'

// Clients are created lazily so missing env vars don't crash at build time.
// API routes that call uploadAsset() or supabaseAdmin will get a clear runtime error.

let _admin: SupabaseClient | null = null
let _anon: SupabaseClient | null = null

function getAdmin(): SupabaseClient {
  if (_admin) return _admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  _admin = createClient(url, key)
  return _admin
}

function getAnon(): SupabaseClient {
  if (_anon) return _anon
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  _anon = createClient(url, key)
  return _anon
}

export function getSupabaseAdmin(): SupabaseClient { return getAdmin() }
export function getSupabaseAnon(): SupabaseClient { return getAnon() }

export async function uploadAsset(
  file: Buffer | Blob,
  path: string,
  contentType: string
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  const admin = getAdmin()
  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType, upsert: true })

  if (error) return { url: null, error: error.message }

  const { data: urlData } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)
  return { url: urlData.publicUrl, error: null }
}
