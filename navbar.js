import {
    auth,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    signInWithPopup,
    provider
} from "./firebaselogin.js";

const userMenu = document.querySelector(".user-menu");
const userIcon = document.getElementById("userIcon");
const loginDropdown = document.getElementById("loginDropdown");

const cartIcon = document.getElementById("cartIcon");
const cartDropdown = document.getElementById("cartDropdown");

function enableLoginEvents() {
    const loginForm = document.getElementById("loginForm");
    const googleLoginBtn = document.getElementById("googleLoginBtn");

    if (loginForm) {
        loginForm.removeEventListener("submit", handleEmailLogin);
        loginForm.addEventListener("submit", handleEmailLogin);
    }

    if (googleLoginBtn) {
        googleLoginBtn.removeEventListener("click", handleGoogleLogin);
        googleLoginBtn.addEventListener("click", handleGoogleLogin);
    }
}

async function handleEmailLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        location.reload();
    } catch (err) {
        alert("Error al iniciar sesión: " + err.message);
    }
}

async function handleGoogleLogin() {
    try {
        await signInWithPopup(auth, provider);
        location.reload();
    } catch (err) {
        alert("Error con Google: " + err.message);
    }
}

userIcon?.addEventListener("click", (e) => {
    e.stopPropagation();
    loginDropdown.style.display = "block";
    cartDropdown.style.display = "none";
});

cartIcon?.addEventListener("click", (e) => {
    e.stopPropagation();
    cartDropdown.style.display = "block";
    loginDropdown.style.display = "none";
});

loginDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
});
cartDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.addEventListener("click", () => {
    loginDropdown.style.display = "none";
    cartDropdown.style.display = "none";
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        userIcon.style.display = "inline-block";

        loginDropdown.innerHTML = `
      <form id="loginForm">
          <input type="email" id="loginEmail" placeholder="Correo electrónico" required />
          <input type="password" id="loginPassword" placeholder="Contraseña" required />
          <button type="submit">Iniciar sesión</button>
      </form>
      <p>O con Google</p>
      <button id="googleLoginBtn" class="google-btn">
          <i class="fa-brands fa-google"></i> Iniciar sesión con Google
      </button>
      <p>No tienes cuenta? <a href="registro.html">Regístrate</a></p>
    `;

        enableLoginEvents();
        return;
    }

    loginDropdown.style.display = "none";
    userIcon.style.display = "none";
    loginDropdown.innerHTML = "";

    let userNameBtn = document.createElement("button");
    userNameBtn.textContent = user.displayName || user.email;
    userNameBtn.classList.add("user-name-btn");
    userMenu.prepend(userNameBtn);

    const miniMenu = document.createElement("div");
    miniMenu.classList.add("login-dropdown");
    miniMenu.style.display = "none";
    miniMenu.innerHTML = `
      <p><a href="perfil.html">Configuración de perfil</a></p>
      <p><a href="#" id="logoutBtn">Cerrar sesión</a></p>
  `;
    userMenu.appendChild(miniMenu);

    userNameBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        miniMenu.style.display = miniMenu.style.display === "block" ? "none" : "block";
        cartDropdown.style.display = "none";
    });

    miniMenu.addEventListener("click", (e) => e.stopPropagation());

    document.getElementById("logoutBtn").addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        location.reload();
    });
});
