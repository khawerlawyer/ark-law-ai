// pages/shared/[id].js
// Redirects to the correct country page with ?share= param
// so the chat loads directly inside ARK Law AI

export async function getServerSideProps(context) {
  const { id } = context.params;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const countryRoutes = {
    "United States": "/usa",
    "USA":           "/usa",
    "Pakistan":      "/pakistan",
    "India":         "/india",
    "Bangladesh":    "/bangladesh",
  };

  // Default redirect in case we can't fetch
  let destination = `/usa?share=${id}`;

  if (supabaseUrl && supabaseKey) {
    try {
      const r = await fetch(
        `${supabaseUrl}/rest/v1/ark_shared_chats?share_id=eq.${id}&select=country`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      const rows = await r.json();
      if (rows?.length) {
        const page = countryRoutes[rows[0].country] || "/usa";
        destination = `${page}?share=${id}`;
      }
    } catch {}
  }

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
}

// This component never renders — getServerSideProps always redirects
export default function SharedRedirect() {
  return null;
}
