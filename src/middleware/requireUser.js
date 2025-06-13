import { createSupabaseServerClient } from "@/utils/supabaseCookie";

const requireUser = async (req, res, next) => {
  const supabase = createSupabaseServerClient(req, res);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return res.status(401).json({ error: "Unauthorized: Please login first." });
  }

  // แนบไว้ใน req เพื่อให้ handler ใช้ได้
  req.supabase = supabase;
  req.user = user;

  next();
};

export default requireUser;
