const SUPABASE_URL = 'https://doxuhspnmpxutdoinbez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveHVoc3BubXB4dXRkb2luYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk3MjYsImV4cCI6MjA2NzI5NTcyNn0.ZB-K5cDSZMDAoKu47IedbzTwNM-_yPyW7oCLyXwOW2Y';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let tousLesProduits = [];

async function afficherCatalogue(filtre = "") {
  const conteneur = document.getElementById("produitsCatalogue");
  conteneur.innerHTML = "";

  const filtreMinuscule = filtre.toLowerCase();

  const produitsFiltres = tousLesProduits.filter(produit =>
    produit.nom?.toLowerCase().includes(filtreMinuscule) ||
    produit.description?.toLowerCase().includes(filtreMinuscule) ||
    (produit.prix && produit.prix.toString().includes(filtreMinuscule))
  );

  if (produitsFiltres.length === 0) {
    conteneur.innerHTML = "<p style='text-align:center;'>Aucun produit trouvé.</p>";
    return;
  }

  produitsFiltres.forEach((produit) => {
    const card = document.createElement("div");
    card.className = "carte-produit";

    card.innerHTML = `
      <img src="${produit.image_url}" alt="${produit.nom}" />
      <h3>${produit.nom}</h3>
      <p><strong>Taille disponible : ${produit.description || "-"}</strong></p>
      <p>${produit.prix ? produit.prix + " €" : "Prix non défini"}</p>
    `;

    conteneur.appendChild(card);
  });
}

async function chargerProduits() {
  const { data: produits, error } = await supabase
    .from("produits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur chargement produits :", error.message);
    alert("Erreur lors du chargement des produits : " + error.message);
    return;
  }

  if (!produits || produits.length === 0) {
    console.warn("⚠️ Aucun produit trouvé dans la table.");
  }

  tousLesProduits = produits;
  afficherCatalogue();
}

document.addEventListener("DOMContentLoaded", () => {
  chargerProduits();

  const input = document.getElementById("input");
  input.addEventListener("input", () => {
    const filtre = input.value.trim();
    afficherCatalogue(filtre);
  });
});
