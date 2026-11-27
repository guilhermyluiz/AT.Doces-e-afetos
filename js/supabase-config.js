/*
    AT DOCES E AFETO
    Configuração do Supabase
    Use somente chave pública.
*/

window.SUPABASE_URL = "https://xtexnzpoqevyhpsyfzhm.supabase.co";

window.SUPABASE_ANON_KEY = "sb_publishable_A7Ro5kMQsR3KUcXubPsouA_tvrf7hXs";

if (
    window.supabase &&
    window.SUPABASE_URL.startsWith("https://") &&
    (
        window.SUPABASE_ANON_KEY.startsWith("eyJ") ||
        window.SUPABASE_ANON_KEY.startsWith("sb_publishable_")
    )
) {
    window.supabaseClient = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY
    );

    console.log("Supabase conectado com sucesso!");
} else {
    console.warn(
        "Supabase não configurado. Verifique a biblioteca e as credenciais."
    );
}