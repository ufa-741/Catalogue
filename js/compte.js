const SUPABASE_URL = 'https://doxuhspnmpxutdoinbez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveHVoc3BubXB4dXRkb2luYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk3MjYsImV4cCI6MjA2NzI5NTcyNn0.ZB-K5cDSZMDAoKu47IedbzTwNM-_yPyW7oCLyXwOW2Y';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const fileInput = document.getElementById("productImage");
const previewImage = document.getElementById("previewImage");
const previewName = document.getElementById("previewName");
const previewPrice = document.getElementById("previewPrice");
const previewDescription = document.getElementById("previewDescription");
const inputNom = document.getElementById("nom");
const inputPrix = document.getElementById("prix");
const inputDescription = document.getElementById("pointures");
const ajoutForm = document.getElementById("ajoutForm");

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

inputNom.addEventListener("input", () => {
  previewName.textContent = inputNom.value || "Nom du produit";
});
inputPrix.addEventListener("input", () => {
  previewPrice.textContent = inputPrix.value ? `${inputPrix.value} €` : "Prix €";
});
inputDescription.addEventListener("input", () => {
  previewDescription.textContent = inputDescription.value || "Your description text";
});

ajoutForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const file = fileInput.files[0];
  const nom = inputNom.value.trim();
  const prix = inputPrix.value.trim();
  const description = inputDescription.value.trim();

  if (!file || !nom || !description) return;

  const sanitizedFileName = file.name.replace(/\s+/g, "_");
  const filePath = `produits/${Date.now()}_${sanitizedFileName}`;

  const { error: imageError } = await supabase.storage
    .from("images")
    .upload(filePath, file);

  if (imageError) {
    console.error("Erreur Supabase :", imageError);
    return;
  }

  const { data: urlData } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);
  const imageUrl = urlData?.publicUrl;

  const { error: insertError } = await supabase.from("produits").insert([{
    nom: nom,
    prix: prix || null,
    description: description,
    image_url: imageUrl,
  }]);

  if (insertError) {
    console.error(insertError);
  } else {
    chargerProduits();

    fileInput.value = "";
    fileInput.type = "";
    fileInput.type = "file";
    inputNom.value = "";
    inputPrix.value = "";
    inputDescription.value = "";
    previewImage.style.display = "none";
    previewName.textContent = "Nom du produit";
    previewPrice.textContent = "Prix €";
    previewDescription.textContent = "Your description text";
  }
});

async function chargerProduits() {
  const { data: produits, error } = await supabase
    .from("produits")
    .select("*")
    .order("created_at", { ascending: false });

  const liste = document.getElementById("produitsListe");
  liste.innerHTML = "";

  if (error) {
    console.error("Erreur chargement produits :", error);
    return;
  }

  produits.forEach((produit) => {
    const item = document.createElement("div");
    item.className = "produit";

    item.innerHTML = `
      <img src="${produit.image_url}" alt="${produit.nom}" />
      <h3>${produit.nom}</h3>
      <p>${produit.description}</p>
      <p><strong>${produit.prix ? produit.prix + " €" : "Prix non défini"}</strong></p>
      <button onclick="supprimerProduit('${produit.id}')">🗑️ Supprimer</button>
    `;

    liste.appendChild(item);
  });
}

async function supprimerProduit(id) {
  const { error } = await supabase
    .from("produits")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
  } else {
    chargerProduits();
  }
}

chargerProduits();
