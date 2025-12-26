const SUPABASE_URL = "https://doxuhspnmpxutdoinbez.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveHVoc3BubXB4dXRkb2luYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk3MjYsImV4cCI6MjA2NzI5NTcyNn0.ZB-K5cDSZMDAoKu47IedbzTwNM-_yPyW7oCLyXwOW2Y";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".log form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]')?.value.trim();
    const password = loginForm.querySelector('input[name="pswd"]')?.value.trim();

    if (!email || !password) {
      alert("Veuillez remplir l'email et le mot de passe.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      alert("❌ Identifiants incorrects : " + error.message);
    } else {
      window.location.href = "compte.html";
    }
  });
});
