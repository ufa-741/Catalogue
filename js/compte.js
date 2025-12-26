const SUPABASE_URL = "https://doxuhspnmpxutdoinbez.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveHVoc3BubXB4dXRkb2luYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk3MjYsImV4cCI6MjA2NzI5NTcyNn0.ZB-K5cDSZMDAoKu47IedbzTwNM-_yPyW7oCLyXwOW2Y";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("productImage");
  const previewImage = document.getElementById("previewImage");
  const previewName = document.getElementById("previewName");
  const previewPrice = document.getElementById("previewPrice");
  const previewDescription = document.getElementById("previewDescription");
  const inputNom = document.getElementById("nom");
  const inputPrix = document.getElementById("prix");
  const inputDescription = document.getElementById("pointures");
  const ajoutForm = document.getElementById("ajoutForm");

  if (!fileInput || !ajoutForm) return;

  fileInput.addEventListener("change", function () {
    const file = this.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (!previewImage) return;
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  inputNom?.addEventListener("input", () => {
    if (previewName) previewName.textContent = inputNom.value || "Nom du produit";
  });

  inputPrix?.addEventListener("input", () => {
    if (previewPrice) previewPrice.textContent = inputPrix.value ? `${inputPrix.value} €` : "Prix €";
  });

  inputDescription?.addEventListener("input", () => {
    if (previewDescription) previewDescription.textContent = inputDescription.value || "Your description text";
  });

  ajoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const file = fileInput.files?.[0];
    const nom = inputNom?.value.trim() || "";
    const prix = inputPrix?.value.trim() || "";
    const description = inputDescription?.value.trim() || "";

    if (!file || !nom || !description) return;

    const sanitizedFileName = file.name.replace(/\s+/g, "_");
    const filePath = `produits/${Date.now()}_${sanitizedFileName}`;

    const { error: imageError } = await supabaseClient.storage
      .from("images")
      .upload(filePath, file);

    if (imageError) {
      console.error("Erreur upload image :", imageError);
      alert("Erreur upload image : " + imageError.message);
      return;
    }

    const { data: urlData } = supabaseClient.storage.from("images").getPublicUrl(filePath);
    const imageUrl = urlData?.publicUrl;

    const { error: insertError } = await supabaseClient.from("produits").insert([
      {
        nom,
        prix: prix || null,
        description,
        image_url: imageUrl,
      },
    ]);

    if (insertError) {
      console.error("Erreur insert produit :", insertError);
      alert("Erreur enregistrement produit : " + insertError.message);
      return;
    }

    await chargerProduits();

    // reset form + preview
    fileInput.value = "";
    inputNom.value = "";
    inputPrix.value = "";
    inputDescription.value = "";

    if (previewImage) previewImage.style.display = "none";
    if (previewName) previewName.textContent = "Nom du produit";
    if (previewPrice) previewPrice.textContent = "Prix €";
    if (previewDescription) previewDescription.textContent = "Your description text";
  });

  async function chargerProduits() {
    const { data: produits, error } = await supabaseClient
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });

    const liste = document.getElementById("produitsListe");
    if (liste) liste.innerHTML = "";

    if (error) {
      console.error("Erreur chargement produits :", error.message);
      return;
    }

    (produits || []).forEach((produit) => {
      const item = document.createElement("div");
      item.className = "produit";

      item.innerHTML = `
        <img src="${produit.image_url || ""}" alt="${produit.nom || "Produit"}" />
        <h3>${produit.nom || "Produit"}</h3>
        <p>${produit.description || ""}</p>
        <p><strong>${produit.prix ? produit.prix + " €" : "Prix non défini"}</strong></p>
        <button data-id="${produit.id}">🗑️ Supprimer</button>
      `;

      item.querySelector("button")?.addEventListener("click", async () => {
        await supprimerProduit(produit.id);
      });

      liste?.appendChild(item);
    });
  }

  async function supprimerProduit(id) {
    const { error } = await supabaseClient.from("produits").delete().eq("id", id);
    if (error) {
      console.error(error.message);
      alert("Erreur suppression : " + error.message);
      return;
    }
    await chargerProduits();
  }

  // chargement initial
  chargerProduits();
});
