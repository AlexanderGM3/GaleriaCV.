document.addEventListener("DOMContentLoaded", () => {
    const totalElement = document.getElementById("paymentTotal");
    const storedTotal = localStorage.getItem("carritoTotal");

    if (totalElement) {
        if (storedTotal) {
            totalElement.textContent = `S/ ${storedTotal}`;
        } else {
            totalElement.textContent = "S/ 0.00";
            console.warn("No se encontró el total del carrito en localStorage.");
        }
    }
});