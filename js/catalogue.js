const SUPABASE_URL = "https://doxuhspnmpxutdoinbez.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveHVoc3BubXB4dXRkb2luYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk3MjYsImV4cCI6MjA2NzI5NTcyNn0.ZB-K5cDSZMDAoKu47IedbzTwNM-_yPyW7oCLyXwOW2Y";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let tousLesProduits = [];

function afficherCatalogue(filtre = "") {
  const conteneur = document.getElementById("produitsCatalogue");
  if (!conteneur) return;

  conteneur.innerHTML = "";
  const f = filtre.toLowerCase();

  const produitsFiltres = tousLesProduits.filter((p) => {
    const nom = (p.nom || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const prix = p.prix != null ? String(p.prix) : "";
    return nom.includes(f) || desc.includes(f) || prix.includes(f);
  });

  if (produitsFiltres.length === 0) {
    conteneur.innerHTML = "<p style='text-align:center;'>Aucun produit trouvé.</p>";
    return;
  }

  produitsFiltres.forEach((produit) => {
    const card = document.createElement("div");
    card.className = "carte-produit";

    card.innerHTML = `
      <img src="${produit.image_url || ""}" alt="${produit.nom || "Produit"}" />
      <h3>${produit.nom || "Produit"}</h3>
      <p><strong>Taille disponible : ${produit.description || "-"}</strong></p>
      <p>${produit.prix ? produit.prix + " €" : "Prix non défini"}</p>
    `;

    conteneur.appendChild(card);
  });
}

async function chargerProduits() {
  const { data: produits, error } = await supabaseClient
    .from("produits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur chargement produits :", error.message);
    alert("Erreur lors du chargement des produits : " + error.message);
    return;
  }

  tousLesProduits = produits || [];
  afficherCatalogue();
}

document.addEventListener("DOMContentLoaded", () => {
  chargerProduits();

  const input = document.getElementById("input");
  if (input) {
    input.addEventListener("input", () => {
      afficherCatalogue(input.value.trim());
    });
  }
});
