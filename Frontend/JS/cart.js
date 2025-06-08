"use strict";
var Demo;
(function (Demo) {
    var Models;
    (function (Models) {
        class CartItem {
        }
        Models.CartItem = CartItem;
        class User {
        }
        Models.User = User;
    })(Models = Demo.Models || (Demo.Models = {}));
})(Demo || (Demo = {}));
(function (Demo) {
    var CartModule;
    (function (CartModule) {
        const $ = jQuery;
        class CartManager {
            constructor() {
                this.apiBaseUrl = "http://localhost:58731/api/cart";
                this.userId = null;
                this.$cartItemsContainer = $("#cart-items-container");
                this.$emptyCartMessage = $(".empty-cart-message");
                this.$cartTotal = $("#cart-total");
                this.$cartTotalAmount = $("#cart-total-amount");
                const userJson = sessionStorage.getItem("loggedInUser");
                this.user = userJson ? JSON.parse(userJson) : null;
                if (!this.user) {
                    alert("Please login to view your cart.");
                    window.location.href = "login.html";
                    return;
                }
                this.userId = this.user.UserID;
                this.loadCart();
                this.bindEvents();
            }
            bindEvents() {
                $(document).on("click", ".qty-btn", (e) => this.updateQuantity(e));
                $(document).on("click", ".remove-btn", (e) => this.removeItem(e));
                $("#checkout-btn").on("click", () => this.checkout());
            }
            loadCart() {
                $.ajax({
                    url: `${this.apiBaseUrl}/user/${this.userId}`,
                    method: "GET",
                    success: (cartItems) => this.renderCart(cartItems),
                    error: () => this.renderEmptyCart("Failed to load cart items"),
                });
            }
            renderCart(cartItems) {
                this.$cartItemsContainer.empty();
                if (!cartItems.length) {
                    this.renderEmptyCart();
                    return;
                }
                this.$emptyCartMessage.hide();
                this.$cartTotal.show();
                let totalAmount = 0;
                cartItems.forEach((item) => {
                    totalAmount += item.TotalPrice;
                    const cardHtml = `
          <div class="cart-card" style="display:flex;gap:1rem;border:1px solid #ccc;padding:1rem;margin-bottom:1rem;">
            <img src="/frontend/images/${item.ProductImg}" alt="${item.ProductName}" style="width:100px;height:100px; object-fit: contain;">
            <div>
              <h3>${item.ProductName}</h3>
              <p>Price: ₹${item.ProductPrice.toFixed(2)}</p>
              <div>
                Quantity:
                <button class="qty-btn decrease" data-id="${item.CartID}" data-qty="${item.CartQty}" data-price="${item.ProductPrice}">−</button>
                <span class="cart-qty">${item.CartQty}</span>
                <button class="qty-btn increase" data-id="${item.CartID}" data-qty="${item.CartQty}" data-price="${item.ProductPrice}">+</button>
              </div>
              <p>Total: ₹${item.TotalPrice.toFixed(2)}</p>
              <button class="remove-btn" data-id="${item.CartID}" style="background-color: #ff4d4d; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 5px;">Remove</button>
            </div>
          </div>`;
                    this.$cartItemsContainer.append(cardHtml);
                });
                this.$cartTotalAmount.text(`Total: ₹${totalAmount.toFixed(2)}`);
                // CartManager.updateCartIcon(cartItems.reduce((sum, i) => sum + i.CartQty, 0));
            }
            renderEmptyCart(message) {
                if (message)
                    console.error(message);
                this.$cartItemsContainer.empty();
                this.$emptyCartMessage.show();
                this.$cartTotal.hide();
                // CartManager.updateCartIcon(0);
            }
            updateQuantity(event) {
                const $btn = $(event.currentTarget);
                const cartId = Number($btn.data("id"));
                let qty = Number($btn.data("qty"));
                const unitPrice = Number($btn.data("price"));
                const isIncrease = $btn.hasClass("increase");
                qty = isIncrease ? qty + 1 : qty - 1;
                if (qty < 1)
                    return alert("Minimum quantity is 1.");
                const updatedCart = {
                    CartID: cartId,
                    CartQty: qty,
                    TotalPrice: qty * unitPrice,
                };
                $.ajax({
                    url: `${this.apiBaseUrl}/update`,
                    method: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(updatedCart),
                    success: () => this.loadCart(),
                    error: () => alert("Failed to update cart quantity."),
                });
            }
            removeItem(event) {
                const cartId = Number($(event.currentTarget).data("id"));
                $.ajax({
                    url: `${this.apiBaseUrl}/delete/${cartId}`,
                    method: "DELETE",
                    success: () => this.loadCart(),
                    error: () => alert("Failed to remove item."),
                });
            }
            checkout() {
                $.ajax({
                    url: `${this.apiBaseUrl}/user/${this.userId}`,
                    method: "GET",
                    success: (cartItems) => {
                        if (!cartItems.length) {
                            alert("Your cart is empty.");
                            return;
                        }
                        const outOfStock = cartItems.filter((item) => { var _a; return ((_a = item.ProductQuantity) !== null && _a !== void 0 ? _a : 0) < item.CartQty; });
                        if (outOfStock.length > 0) {
                            alert(`Out of stock: ${outOfStock.map(i => i.ProductName).join(", ")}`);
                            return;
                        }
                        window.location.href = "paymentgateway.html";
                    },
                    error: () => alert("Could not validate cart before checkout."),
                });
            }
        }
        CartModule.CartManager = CartManager;
        function updateUserSection() {
            // console.log("Updating user section...");
            const userText = document.getElementById("user-text");
            const userJson = sessionStorage.getItem("loggedInUser");
            const user = userJson ? JSON.parse(userJson) : null;
            if (user === null || user === void 0 ? void 0 : user.name) {
                userText.innerHTML = `
      Welcome, ${user.name} &nbsp;|&nbsp; |
      <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
    `;
                document.getElementById("spanLogout").onclick = logout;
            }
            else {
                userText.innerHTML = `
      <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
      <a href="login.html" class="text-white text-decoration-none">Login</a>
    `;
            }
        }
        CartModule.updateUserSection = updateUserSection;
        function logout() {
            sessionStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        }
        $(() => {
            new CartManager();
            updateUserSection(); // call it here!
        });
    })(CartModule = Demo.CartModule || (Demo.CartModule = {}));
})(Demo || (Demo = {}));
