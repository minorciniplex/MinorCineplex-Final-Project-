import {createSupabaseServerClient} from '@/utils/supabaseCookie'

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res)
  
const ownerId = req.query.ownerId


  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('owner_name', ownerId)
   

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ data })
}