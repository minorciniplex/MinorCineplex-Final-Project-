import { createSupabaseServerClient } from "@/utils/supabaseCookie";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = createSupabaseServerClient(req, res);

    try {
        const { data: coupons, error } = await supabase
            .from('coupons')
            .select(`
                coupon_id,
                title,
                image,
                end_date,
                discount_type,
                discount_value,
                min_purchase,
                coupon_owners (
                    owner_id,
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return res.status(200).json({ coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคูปองได้' });
    }
}

