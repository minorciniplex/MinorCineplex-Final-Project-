import { createServerClient } from '@supabase/ssr'

const isProd = process.env.NODE_ENV === 'production'

const createCookieString = (key, value, options = {}) => {
    let cookie = `${key}=${value}; Path=/; HttpOnly; SameSite=Lax`
  
    if (isProd) cookie += '; Secure'
  
    if (options.maxAge) {
      cookie += `; Max-Age=${options.maxAge}`
    }
  
    return cookie
  }
  

const createRemoveCookieString = (key) => {
  // สร้าง cookie string สำหรับการลบ cookie (ตั้งให้หมดอายุทันที)
  let cookie = `${key}=deleted; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  
  // เพิ่ม Secure flag ในโหมด production
  if (isProd) cookie += '; Secure'
  
  return cookie
}

export const createSupabaseServerClient = (req, res, remember = false) => {
    const maxAge = remember ? 60 * 60 * 24 * 7 : undefined // 7 วัน หรือ session cookie
  
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (key) => req.cookies[key],
          set: (key, value, options = {}) => {
            const cookieString = createCookieString(key, value, {
              ...options,
              maxAge, // 👉 ส่ง maxAge เข้าไปอย่างชัดเจน
            });
            res.setHeader('Set-Cookie', cookieString);
          },
          remove: (key) => {
            const cookieString = createRemoveCookieString(key);
            res.setHeader('Set-Cookie', cookieString);
          },
        }
      }
    );
  };
  