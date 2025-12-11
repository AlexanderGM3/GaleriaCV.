function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

export function agregarAlCarrito(item) {
    let carrito = obtenerCarrito();
    carrito.push(item);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarCarritoVisual();
}

function removerDelCarrito(id) {
    let carrito = obtenerCarrito();

    const index = carrito.findIndex(item => item.id === id);
    if (index > -1) {
        carrito.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    actualizarCarritoVisual();
}

export function actualizarCarritoVisual() {
    const dropdown = document.getElementById("cartDropdown");
    let carrito = obtenerCarrito();

    if (!dropdown) return;

    if (carrito.length === 0) {
        localStorage.removeItem("carritoTotal");
        dropdown.innerHTML = `<p class="cart-empty">Tu carrito está vacío por ahora.</p>`;
        return;
    }

    let html = "";
    let total = 0;

    carrito.forEach(item => {

        total += item.price;

        html += `
            <div class="cart-item">
                <img src="${item.thumbUrl}">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>S/ ${item.price.toFixed(2)}</p>
                </div>
                <i class="fa-solid fa-trash cart-remove" data-id="${item.id}"></i>
            </div>
        `;
    });

    html += `
        <hr style="margin: 10px 0;">
        <p style="padding: 5px 0; font-weight: bold; text-align: center;">Total: S/ ${total.toFixed(2)}</p>
        <button id="payBtn" class="cart-checkout-btn">Pagar</button>
    `;

    dropdown.innerHTML = html;

    document.querySelectorAll(".cart-remove").forEach(icon => {
        icon.onclick = () => removerDelCarrito(icon.dataset.id);
    });

    const payBtn = document.getElementById("payBtn");
    if (payBtn) {
        payBtn.onclick = () => {
            localStorage.setItem("carritoTotal", total.toFixed(2));
            window.location.href = "pagar.html";
        };
    }
}

document.addEventListener("DOMContentLoaded", actualizarCarritoVisual);