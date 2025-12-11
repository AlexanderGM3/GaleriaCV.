import {
    db,
    collection,
    query,
    orderBy,
    getDocs,
    limit
} from "./firebaselogin.js";

const recentArtworksGallery = document.getElementById("recentArtworksGallery");

async function loadRecentArtworks() {
    if (!recentArtworksGallery) return;

    recentArtworksGallery.innerHTML = "<p>Cargando trabajos...</p>";

    try {

        const q = query(
            collection(db, "artworks"),
            orderBy("createdAt", "desc"),
            limit(4)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
            recentArtworksGallery.innerHTML = "<p>Aún no hay trabajos recientes subidos.</p>";
            return;
        }

        recentArtworksGallery.innerHTML = "";
        let htmlContent = "";

        snap.forEach(docItem => {
            const data = docItem.data();

            const priceDisplay = (data.price || 0).toFixed(2);

            htmlContent += `
                <div class="card">
                    <img src="${data.thumbUrl}" alt="${data.title}" class="art-thumb-index"> 
                    <p><strong>${data.title}</strong></p>
                    <p>Artista: ${data.artist}</p>
                    <p>Precio: S/ ${priceDisplay}</p>
                    <a href="trabajos.html" class="small-link">Ver en galería</a>
                </div>
            `;
        });

        recentArtworksGallery.innerHTML = htmlContent;

    } catch (err) {
        console.error("Error al cargar los trabajos recientes:", err);
        recentArtworksGallery.innerHTML = "<p>Error al cargar los trabajos recientes.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadRecentArtworks);