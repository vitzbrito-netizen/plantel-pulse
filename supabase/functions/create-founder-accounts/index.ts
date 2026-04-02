import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const accounts = [
    { email: "vitz.brito@gmail.com", password: "kingdomregiae132!", name: "Victor" },
    { email: "marcoslimatrading@gmail.com", password: "marcos123", name: "Marcos" },
  ];

  const results = [];

  for (const account of accounts) {
    // Create user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
    });

    if (userError) {
      results.push({ email: account.email, error: userError.message });
      continue;
    }

    // Assign founder role
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userData.user.id,
      role: "founder",
    });

    results.push({
      email: account.email,
      name: account.name,
      success: !roleError,
      roleError: roleError?.message,
    });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
