import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
  // if (req.method !== 'POST') {
  //   return res.status(405).json({ message: 'Method Not Allowed' })
  // }

  try {
    // ตรวจสอบ cookie ที่มีในรีเควสก่อน
    console.log("Cookies in request:", req.cookies)
    
    const supabase = createSupabaseServerClient(req, res)
    
    // ทำการ sign out กับ Supabase (server-side)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("Supabase signOut error:", error)
      return res.status(500).json({ message: 'Logout failed', error: error.message })
    }
    
    const isProd = process.env.NODE_ENV === 'production'
    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT${isProd ? '; Secure' : ''}`
    
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF
    
    if (!projectRef) {
        return res.status(500).json({ message: 'Missing Supabase project reference' })
      }
      
   
    
    // รายชื่อ cookie ที่ต้องลบโดยใช้ชื่อที่ถูกต้อง
    const cookiesToClear = [
      `sb-${projectRef}-auth-token`
    ]
    
    // สร้าง array ของ cookie headers ที่จะลบทั้งหมด
    const cookieHeaders = cookiesToClear.map(name => {
      return `${name}=deleted; ${cookieOptions}`
    })
    
    // ส่ง Set-Cookie header เพื่อลบ cookie ทั้งหมด
    res.setHeader('Set-Cookie', cookieHeaders)
  
    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (err) {
    console.error("Logout error:", err)
    return res.status(500).json({ message: 'Server error during logout', error: err.message })
  }
}