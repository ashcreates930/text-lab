import {createClient} from "@supabase/supabase-js";
let client:ReturnType<typeof createClient>|null=null;
export function getBrowserSupabase(){if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return null;return client??=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
