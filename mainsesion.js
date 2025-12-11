import {
    auth,
    db,
    onAuthStateChanged,
    getDoc,
    doc,
    setDoc
} from "./firebaselogin.js";

const cartIcon = document.getElementById("cartIcon");
const uploadArtBtn = document.getElementById("uploadArtBtn");

const userIcon = document.getElementById("userIcon");
const loginDropdown = document.getElementById("loginDropdown");

function show(el) {
    if (!el) return;
    el.style.display = "";
}
function hide(el) {
    if (!el) return;
    el.style.display = "none";
}

if (userIcon && loginDropdown) {

    userIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        loginDropdown.style.display =
            loginDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
        loginDropdown.style.display = "none";
    });

    loginDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}

onAuthStateChanged(auth, async (user) => {

    hide(cartIcon);
    hide(uploadArtBtn);

    show(userIcon);

    if (!user) {

        return;
    }

    hide(userIcon);

    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        let role = null;
        if (docSnap.exists()) {
            role = docSnap.data().role || "estudiante";
        } else {
            role = "estudiante";
            await setDoc(docRef, {
                email: user.email,
                displayName: user.displayName || "",
                role,
                createdAt: new Date()
            });
        }

        if (role === "estudiante") {
            show(cartIcon);
            hide(uploadArtBtn);
        }

        if (role === "vendedor") {
            hide(cartIcon);
            show(uploadArtBtn);
        }

    } catch (err) {
        console.error("Error obteniendo role:", err);
    }
});