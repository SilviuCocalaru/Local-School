import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === "undefined") return null;
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`));
          return cookie ? cookie.split("=")[1] : null;
        },
        set(name: string, value: string, options: any) {
          if (typeof document === "undefined") return;
          document.cookie = `${name}=${value}; path=/; ${
            options?.maxAge ? `max-age=${options.maxAge};` : ""
          }`;
        },
        remove(name: string, options: any) {
          if (typeof document === "undefined") return;
          document.cookie = `${name}=; path=/; max-age=0`;
        },
      },
    }
  );
};