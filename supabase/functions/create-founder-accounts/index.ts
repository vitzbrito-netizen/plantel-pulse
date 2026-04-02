import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find Victor's account
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const victor = users.users.find(u => u.email === "vitz.brito@gmail.com");
  
  if (!victor) {
    return new Response(JSON.stringify({ error: "Victor not found" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 404,
    });
  }

  // Assign founder role to Victor
  const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
    user_id: victor.id,
    role: "founder",
  });

  // Update Victor's password
  const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(victor.id, {
    password: "kingdomregiae132!",
  });

  return new Response(JSON.stringify({ 
    victorId: victor.id,
    roleAssigned: !roleError,
    roleError: roleError?.message,
    passwordUpdated: !pwError,
    pwError: pwError?.message,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
