import {
    auth,
    provider,
    db,
    createUserWithEmailAndPassword,
    signInWithPopup,
    setDoc,
    doc
} from "./firebaselogin.js";

const registerForm = document.getElementById("registerForm");
const googleRegisterBtn = document.getElementById("googleRegisterBtn");
const rolSelect = document.getElementById("rolUsuario");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nickname = document.getElementById("nickname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = rolSelect ? rolSelect.value : "estudiante";

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }
        if (!role) {
            alert("Selecciona un rol");
            return;
        }

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;
            await setDoc(doc(db, "users", uid), {
                displayName: nickname || null,
                email,
                role,
                createdAt: new Date()
            });
            alert("Registro exitoso");
            registerForm.reset();
            if (rolSelect) rolSelect.selectedIndex = 0;

            window.location.href = "index.html";

        } catch (err) {
            console.error(err);
            alert("Error al registrar: " + err.message);
        }
    });
}

if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", async () => {
        const role = rolSelect ? rolSelect.value : "estudiante";
        if (!role) {
            alert("Selecciona un rol antes de registrarte con Google");
            return;
        }
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const uid = user.uid;
            await setDoc(doc(db, "users", uid), {
                displayName: user.displayName || null,
                email: user.email,
                role,
                createdAt: new Date()
            });
            alert("Registrado con Google");
            if (rolSelect) rolSelect.selectedIndex = 0;
            window.location.href = "index.html";

        } catch (err) {
            console.error(err);
            alert("Error Google: " + err.message);
        }
    });
}
