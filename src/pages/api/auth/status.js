import { createSupabaseServerClient } from '@/utils/supabaseCookie'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const supabase = createSupabaseServerClient(req, res)
    
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // แสดง log เพื่อช่วยในการ debug
    console.log("Auth status check - User:", user ? "Found" : "Not found")
    if (error) console.error("Auth status check - Error:", error)

    if (error || !user) {
      return res.status(200).json({ loggedIn: false })
    }

    return res.status(200).json({ loggedIn: true, userId: user})
  } catch (err) {
    console.error("Server error in auth status check:", err)
    return res.status(500).json({ loggedIn: false, error: "Server error" })
  }
}