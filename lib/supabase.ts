import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side client (service role — can write to storage, bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Public client (anon key — for client-side use)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? 'website-assets'

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL on success.
 */
export async function uploadAsset(
  file: Buffer | Blob,
  path: string,
  contentType: string
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) return { url: null, error: error.message }

  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path)

  return { url: urlData.publicUrl, error: null }
}
