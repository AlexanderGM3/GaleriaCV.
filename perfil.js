import {
    auth,
    updateProfile,
    deleteUser,
    onAuthStateChanged,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "./firebaselogin.js";

const nameInput = document.getElementById("newDisplayName");
const changeNameBtn = document.getElementById("changeNameBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("Debes iniciar sesión para ver tu perfil.");
        window.location.href = "index.html";
        return;
    }

    if (user.displayName) {
        nameInput.placeholder = user.displayName;
    }
});

changeNameBtn.addEventListener("click", async () => {
    const newName = nameInput.value.trim();
    const user = auth.currentUser;

    if (!user) return alert("No hay usuario activo.");
    if (newName.length < 3) return alert("El nombre debe tener mínimo 3 caracteres.");

    try {
        await updateProfile(user, { displayName: newName });

        alert("Nombre actualizado correctamente.");
        nameInput.value = "";
    } catch (error) {
        console.error(error);
        alert("Error al actualizar el nombre.");
    }
});


deleteAccountBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("No hay usuario activo.");

    const confirmDelete = confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (!confirmDelete) return;

    try {

        if (user.providerData[0]?.providerId === "google.com") {
            await deleteUser(user);
            await auth.signOut();
            alert("Cuenta eliminada exitosamente.");
            window.location.href = "index.html";
            return;
        }

        const password = prompt("Para eliminar tu cuenta ingresa tu contraseña:");

        if (!password) {
            alert("Se canceló la operación.");
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        await deleteUser(user);
        await auth.signOut();

        alert("Cuenta eliminada exitosamente.");
        window.location.href = "index.html";

    } catch (error) {
        console.error("Error al eliminar la cuenta:", error);

        if (error.code === "auth/wrong-password") {
            alert("Contraseña incorrecta.");
        } else if (error.code === "auth/requires-recent-login") {
            alert("Debes volver a iniciar sesión para eliminar tu cuenta.");
        } else {
            alert("Error al eliminar la cuenta.");
        }
    }
});
