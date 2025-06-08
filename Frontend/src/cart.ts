namespace Demo.Models {
  export class CartItem {
    CartID!: number;
    ProductID!: number;
    ProductName!: string;
    ProductPrice!: number;
    ProductImg!: string;
    Description!: string;
    CartQty!: number;
    TotalPrice!: number;
    ProductQuantity?: number;
    UserID!: number;
  }

  export class User {
    UserID!: number;
    name!: string;
    email!: string;
  }
}

namespace Demo.CartModule {
  const $ = jQuery;

  export class CartManager {
    private apiBaseUrl = "http://localhost:58731/api/cart";
    private user: Demo.Models.User | null;
    private userId: number | null = null;

    private $cartItemsContainer = $("#cart-items-container");
    private $emptyCartMessage = $(".empty-cart-message");
    private $cartTotal = $("#cart-total");
    private $cartTotalAmount = $("#cart-total-amount");

    constructor() {
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

    private bindEvents(): void {
      $(document).on("click", ".qty-btn", (e) => this.updateQuantity(e));
      $(document).on("click", ".remove-btn", (e) => this.removeItem(e));
      $("#checkout-btn").on("click", () => this.checkout());
    }

    private loadCart(): void {
      $.ajax({
        url: `${this.apiBaseUrl}/user/${this.userId}`,
        method: "GET",
        success: (cartItems: Demo.Models.CartItem[]) => this.renderCart(cartItems),
        error: () => this.renderEmptyCart("Failed to load cart items"),
      });
    }

    private renderCart(cartItems: Demo.Models.CartItem[]): void {
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

    private renderEmptyCart(message?: string): void {
      if (message) console.error(message);
      this.$cartItemsContainer.empty();
      this.$emptyCartMessage.show();
      this.$cartTotal.hide();
      // CartManager.updateCartIcon(0);
    }

    private updateQuantity(event: JQuery.ClickEvent): void {
      const $btn = $(event.currentTarget);
      const cartId = Number($btn.data("id"));
      let qty = Number($btn.data("qty"));
      const unitPrice = Number($btn.data("price"));
      const isIncrease = $btn.hasClass("increase");

      qty = isIncrease ? qty + 1 : qty - 1;
      if (qty < 1) return alert("Minimum quantity is 1.");

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

    private removeItem(event: JQuery.ClickEvent): void {
      const cartId = Number($(event.currentTarget).data("id"));
      $.ajax({
        url: `${this.apiBaseUrl}/delete/${cartId}`,
        method: "DELETE",
        success: () => this.loadCart(),
        error: () => alert("Failed to remove item."),
      });
    }

    private checkout(): void {
      $.ajax({
        url: `${this.apiBaseUrl}/user/${this.userId}`,
        method: "GET",
        success: (cartItems: Demo.Models.CartItem[]) => {
          if (!cartItems.length) {
            alert("Your cart is empty.");
            return;
          }

          const outOfStock = cartItems.filter((item) => (item.ProductQuantity ?? 0) < item.CartQty);
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

  export function updateUserSection(): void {
  // console.log("Updating user section...");
  const userText = document.getElementById("user-text") as HTMLElement;
  const userJson = sessionStorage.getItem("loggedInUser");
  const user: Demo.Models.User | null = userJson ? JSON.parse(userJson) : null;

  if (user?.name) {
    userText.innerHTML = `
      Welcome, ${user.name} &nbsp;|&nbsp; |
      <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
    `;
    (document.getElementById("spanLogout") as HTMLElement).onclick = logout;
  } else {
    userText.innerHTML = `
      <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
      <a href="login.html" class="text-white text-decoration-none">Login</a>
    `;
   
  }
}

function logout(): void {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

$(() => {
  new CartManager();
  updateUserSection(); // call it here!
});
}
