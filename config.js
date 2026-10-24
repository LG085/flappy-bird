// Configuração do ranking online (Supabase).
// Preencha com os dados de: Supabase > Project Settings > API (ou "Data API" / "API Keys").
// A chave "anon public" (ou "publishable") é pública por natureza: quem protege os dados
// são as regras do banco (setup.sql). NUNCA coloque aqui a chave "service_role" / "secret".
// Com os campos vazios, o jogo funciona normalmente, só que sem ranking.
window.FLAPPY_CONFIG = {
  supabaseUrl: 'https://ytpuvlltgppweyxuearu.supabase.co',
  supabaseKey: 'sb_publishable_dE9i8ooA-ombT8nzXCXVXg_NA4pC-oM'   // chave pública (publishable)
};
