import { agregarAlCarrito } from "./carrito.js";

import {
    auth,
    db,
    storage,
    onAuthStateChanged,
    doc,
    getDoc,
    collection,
    addDoc,
    storageRef,
    uploadBytes,
    getDownloadURL,
    serverTimestamp
} from "./firebaselogin.js";

import {
    query,
    orderBy,
    getDocs,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


const uploadArtBtn = document.getElementById("uploadArtBtn");
const addArtForm = document.getElementById("addArtForm");
const closeForm = document.getElementById("closeForm");
const saveArtBtn = document.getElementById("saveArt");
const imagePreview = document.getElementById("imagePreview");

const fileMainInput = document.getElementById("fileMain");
const thumbInput = document.getElementById("thumbnail");
const artNameInput = document.getElementById("artName");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");

let currentUser = null;
let currentUserRole = null;


const artModal = document.getElementById("artModal");
const artModalContent = document.getElementById("artModalContent");
const closeArtModal = document.getElementById("closeArtModal");

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) {
        currentUserRole = null;
        loadArtworks();
        return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    currentUserRole = userDoc.exists() ? userDoc.data().role : "estudiante";

    if (uploadArtBtn) {
        uploadArtBtn.onclick = () => {
            if (!currentUser) return alert("Inicia sesión.");
            if (currentUserRole !== "vendedor")
                return alert("Solo vendedores pueden subir archivos.");
            addArtForm.classList.remove("hidden");
        };
    }

    loadArtworks();
});

closeForm?.addEventListener("click", () => {
    addArtForm.classList.add("hidden");
    clearForm();
});

thumbInput?.addEventListener("change", () => {
    const file = thumbInput.files[0];
    if (!file) return;
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";
});

function clearForm() {
    artNameInput.value = "";
    priceInput.value = "";
    descriptionInput.value = "";
    fileMainInput.value = "";
    thumbInput.value = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";
}

saveArtBtn?.addEventListener("click", async () => {

    if (!currentUser) return alert("Inicia sesión.");
    if (currentUserRole !== "vendedor")
        return alert("Solo vendedores pueden subir archivos.");

    const title = artNameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const description = descriptionInput.value.trim();
    const mainFile = fileMainInput.files[0];
    const thumbFile = thumbInput.files[0];

    if (!title || !mainFile || !thumbFile || isNaN(price))
        return alert("Completa todos los campos.");

    try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const sellerName =
            userDoc.exists()
                ? (userDoc.data().displayName || userDoc.data().email)
                : "Vendedor";

        const timestamp = Date.now();

        const mainName = `${timestamp}_${mainFile.name.replace(/\s+/g, "_")}`;
        const mainRef = storageRef(storage, `artworks/${currentUser.uid}/${mainName}`);
        await uploadBytes(mainRef, mainFile);
        const fileUrl = await getDownloadURL(mainRef);

        const thumbName = `${timestamp}_thumb_${thumbFile.name.replace(/\s+/g, "_")}`;
        const thumbRef = storageRef(storage, `artworks/${currentUser.uid}/${thumbName}`);
        await uploadBytes(thumbRef, thumbFile);
        const thumbUrl = await getDownloadURL(thumbRef);

        await addDoc(collection(db, "artworks"), {
            title,
            artist: sellerName,
            price,
            description,
            ownerUid: currentUser.uid,
            fileUrl,
            thumbUrl,
            createdAt: serverTimestamp(),
            avgRating: 0
        });

        alert("Archivo subido correctamente.");
        addArtForm.classList.add("hidden");
        clearForm();

    } catch (err) {
        console.error("Error subiendo:", err);
        alert("Error: " + err.message);
    }
});

const gallery = document.getElementById("gallery");

async function loadArtworks() {
    if (!gallery) return;

    gallery.innerHTML = "<p style='color:white;'>Cargando...</p>";

    try {
        const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
            gallery.innerHTML = "<p style='color:white;'>No hay trabajos.</p>";
            return;
        }

        gallery.innerHTML = "";

        snap.forEach(docItem => {
            const data = docItem.data();

            const isOwner = currentUser && currentUser.uid === data.ownerUid;
            const isStudent = currentUser && currentUserRole === "estudiante";

            const deleteBtn = isOwner
                ? `<button class="deleteBtn" data-id="${docItem.id}">Eliminar</button>`
                : "";

            const cartBtn = isStudent
                ? `<button class="cartBtn" data-id="${docItem.id}">Agregar al carrito</button>`
                : "";

            gallery.innerHTML += `
                <div class="art-item">
                    <div class="art-card">
                        <img src="${data.thumbUrl}" class="art-thumb">
                        <h3>${data.title}</h3>
                        <p>${data.artist}</p>
                        <p>S/ ${data.price}</p>

                        <div class="art-btn-group">
                            <button class="viewBtn" data-id="${docItem.id}">Ver más</button>
                            ${cartBtn}
                            ${deleteBtn}
                        </div>
                    </div>
                </div>
            `;
        });

        activateViewButtons();
        activateDeleteButtons();
        activateCartButtons();

    } catch (err) {
        console.error("Error cargando:", err);
        gallery.innerHTML = "<p>Error cargando trabajos.</p>";
    }
}

function activateViewButtons() {
    document.querySelectorAll(".viewBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            openArtModal(btn.dataset.id);
        });
    });
}

function activateDeleteButtons() {
    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const ref = doc(db, "artworks", id);

            if (!confirm("¿Eliminar este trabajo?")) return;

            await deleteDoc(ref);
            alert("Eliminado.");
            loadArtworks();
        });
    });
}

function activateCartButtons() {
    const cartButtons = document.querySelectorAll(".cartBtn");

    cartButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!currentUser) return alert("Inicia sesión.");
            if (currentUserRole !== "estudiante")
                return alert("Solo estudiantes pueden agregar al carrito.");

            const id = btn.dataset.id;

            const ref = doc(db, "artworks", id);
            const snap = await getDoc(ref);

            if (!snap.exists()) return alert("No encontrado");

            const data = snap.data();

            agregarAlCarrito({
                id,
                title: data.title,
                artist: data.artist,
                price: data.price,
                thumbUrl: data.thumbUrl
            });

            alert("Agregado al carrito");
        });
    });
}

async function openArtModal(id) {
    const ref = doc(db, "artworks", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return alert("No encontrado");

    const data = snap.data();
    const isLogged = currentUser !== null;

    artModalContent.innerHTML = `
        <h2>${data.title}</h2>
        <img src="${data.thumbUrl}" class="modal-thumb">

        <p><strong>Autor:</strong> ${data.artist}</p>
        <p><strong>Precio:</strong> S/ ${data.price}</p>
        <p><strong>Descripción:</strong> ${data.description}</p>

        ${isLogged ? `
            <button onclick="window.open('${data.fileUrl}', '_blank')">
                Descargar archivo
            </button>
        ` : ""}

        <hr>

        <h3>Reseñas</h3>
        <div id="reviewsList">Cargando reseñas...</div>

        <h3>Deja tu reseña</h3>
        <div id="starRating" class="star-select">
            ${[1, 2, 3, 4, 5].map(n => `<span data-val="${n}">★</span>`).join("")}
        </div>

        <textarea id="reviewText" placeholder="Escribe tu reseña..."></textarea>
        <button id="sendReview" data-id="${id}">Enviar reseña</button>
    `;

    artModal.classList.remove("hidden");

    loadReviews(id);
    setupStarSelector();
    setupReviewSender();
}

closeArtModal?.addEventListener("click", () => {
    artModal.classList.add("hidden");
});

async function loadReviews(id) {
    const reviewsList = document.getElementById("reviewsList");

    const ref = collection(db, "artworks", id, "comments");
    const snap = await getDocs(ref);

    if (snap.empty) {
        reviewsList.innerHTML = "<p>No hay reseñas aún.</p>";
        return;
    }

    let html = "";
    let totalStars = 0;

    snap.forEach(r => {
        const data = r.data();
        totalStars += data.rating || 0;

        html += `
            <div class="review-item">
                <p><strong>${data.user}</strong></p>
                <p>⭐ ${data.rating}</p>
                <p>${data.text}</p>
            </div>
        `;
    });

    reviewsList.innerHTML = html;

    const avg = totalStars / snap.size;
    await updateDoc(doc(db, "artworks", id), { avgRating: avg });

    loadArtworks();
}

let starRatingValue = 0;

function setupStarSelector() {
    const stars = document.querySelectorAll("#starRating span");
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const val = star.dataset.val;
            stars.forEach(s => s.style.color = s.dataset.val <= val ? "yellow" : "white");
            starRatingValue = Number(val);
        });
    });
}

function setupReviewSender() {
    const btn = document.getElementById("sendReview");

    btn.addEventListener("click", async () => {
        if (!currentUser) return alert("Inicia sesión para reseñar.");

        const text = document.getElementById("reviewText").value.trim();
        const id = btn.dataset.id;

        if (!starRatingValue)
            return alert("Selecciona estrellas.");

        await addDoc(collection(db, "artworks", id, "comments"), {
            user: currentUser.email,
            userUid: currentUser.uid,
            rating: starRatingValue,
            text,
            timestamp: serverTimestamp()
        });

        alert("Reseña enviada.");
        openArtModal(id);
    });
}

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn?.addEventListener("click", searchArtworks);
searchInput?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") searchArtworks();
});

function searchArtworks() {
    const term = searchInput.value.trim().toLowerCase();
    const items = document.querySelectorAll(".art-item");

    items.forEach(item => {
        const title = item.querySelector("h3")?.textContent.toLowerCase() || "";
        const artist = item.querySelector("p")?.textContent.toLowerCase() || "";
        item.style.display =
            title.includes(term) || artist.includes(term)
                ? "block"
                : "none";
    });
}
