import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie.split(";").map((cookie) => {
            const trimmed = cookie.trim();
            const [name, ...rest] = trimmed.split("=");
            const value = rest.join("=");
            // Return as-is - Supabase will handle encoding/decoding
            return { name: name.trim(), value: value.trim() };
          });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Build cookie string - use value as-is, browser will handle encoding
            let cookieString = `${name}=${value}`;
            
            // Set path
            cookieString += `; Path=${options?.path || "/"}`;
            
            // Set max age
            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`;
            } else if (options?.expires) {
              cookieString += `; Expires=${options.expires.toUTCString()}`;
            }
            
            // Set SameSite
            const sameSite = options?.sameSite || "lax";
            cookieString += `; SameSite=${sameSite}`;
            
            // Set domain (skip for localhost)
            if (options?.domain && !options.domain.includes("localhost")) {
              cookieString += `; Domain=${options.domain}`;
            }
            
            // Set secure flag
            if (options?.secure) {
              cookieString += `; Secure`;
            }
            
            console.log("Setting cookie:", name, "Length:", value.length);
            document.cookie = cookieString;
          });
        },
      },
    }
  );
}

