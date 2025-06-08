import { CartItem, Category, Product, User } from "./model";
namespace Demo {
  export namespace ECommerce {
    export class PageUtils {
      private static allFetchedProducts: Product[] = [];

      static init(): void {
        window.addEventListener('DOMContentLoaded', () => {
          this.updateUserSection();
          this.updateCartIconFromServer();
          this.loadProducts();
          this.fetchAndRenderCategories();
          this.bindSearchInput();
        });
      }

      static updateUserSection(): void {
        const userText = document.getElementById('user-text') as HTMLElement;
        const cartIcon = document.getElementById('cart-link') as HTMLElement;
        const user = this.getLoggedInUser();

        if (user?.name) {
          userText.innerHTML = `
            Welcome, ${user.name} &nbsp;|&nbsp;
            <a href="orders.html" class="text-white text-decoration-none me-2">My Orders</a> |
            <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
          `;
          (document.getElementById('spanLogout') as HTMLElement).onclick = this.logout;
          cartIcon.style.display = 'inline-block';
        } else {
          userText.innerHTML = `
            <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
            <a href="login.html" class="text-white text-decoration-none">Login</a>
          `;
          cartIcon.style.display = 'none';
        }
      }

      static logout(): void {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
      }

      static updateCartIconFromServer(): void {
        const user = this.getLoggedInUser();
        const cartIcon = document.querySelector('.fa-cart-plus') as HTMLElement;
        if (!cartIcon) return;

        let countBadge = document.getElementById('cart-count');

        if (!user) {
          cartIcon.style.display = 'none';
          if (countBadge) countBadge.style.display = 'none';
          return;
        }

        $.ajax({
          url: `http://localhost:58731/api/cart/user/${user.UserID}`,
          method: 'GET',
          success: (cartItems: CartItem[]) => {
            const count = cartItems.reduce((total, item) => total + item.CartQty, 0);
            cartIcon.style.display = 'inline-block';

            if (!countBadge) {
              countBadge = document.createElement('span');
              countBadge.id = 'cart-count';
              countBadge.style.cssText = `
                background: red;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 12px;
                position: absolute;
                top: -8px;
                right: -8px;
              `;
              cartIcon.style.position = 'relative';
              cartIcon.appendChild(countBadge);
            }

            countBadge.style.display = 'inline-block';
            countBadge.innerText = count.toString();
          },
          error: () => console.error('Failed to fetch cart items')
        });
      }

      static loadProducts(): void {
        $.ajax({
          url: "http://localhost:58731/api/products",
          method: "GET",
          success: (data: Product[]) => {
            this.allFetchedProducts = data;
            this.displayProducts(data);
          },
          error: () => alert("Failed to load products.")
        });
      }

      static fetchAndRenderCategories(): void {
        $.ajax({
          url: "http://localhost:58731/api/category",
          method: "GET",
          success: (categories: Category[]) => {
            const dropdown = document.getElementById("category-dropdown") as HTMLElement;
            dropdown.innerHTML = "";

            categories.forEach((cat) => {
              const li = document.createElement("li");
              const anchor = document.createElement("a");
              anchor.className = "dropdown-item";
              anchor.href = "#";
              anchor.textContent = cat.CategoryName;
              anchor.onclick = () => this.showCategory(cat.CategoryID);
              li.appendChild(anchor);
              dropdown.appendChild(li);
            });
          },
          error: () => {
            console.error("Error fetching categories");
            const dropdown = document.getElementById("category-dropdown") as HTMLElement;
            dropdown.innerHTML = "<li><a class='dropdown-item' href='#'>Failed to load categories</a></li>";
          }
        });
      }

      static showCategory(categoryId: number): void {
        if (!categoryId || isNaN(categoryId)) {
          console.error("Invalid category ID:", categoryId);
          return;
        }

        $.ajax({
          url: `http://localhost:58731/api/products/category/${categoryId}`,
          method: "GET",
          success: (products: Product[]) => {
            this.allFetchedProducts = products;
            this.displayProducts(products);
          },
          error: () => {
            console.error("Error loading products.");
            $("#product-container").html("<p>Failed to load products.</p>");
          }
        });
      }

      static displayProducts(products: Product[]): void {
        const container = $('#product-container');
        container.empty();

        if (!products || products.length === 0) {
          container.append("<p>No products available at the moment.</p>");
          return;
        }

        products.forEach(product => {
          const isOutOfStock = product.ProductQuantity <= 0;

          const productCard = $(`
            <div class="product-card">
              <img src="/Frontend/Images/${product.ProductImg}" alt="${product.ProductName}" class="product-img">
              <div class="product-details">
                <h5>${product.ProductName}</h5>
                <p class="desc">${product.ProductDescription || ''}</p>
                <p class="price">₹${product.ProductPrice.toFixed(2)}</p>
                ${isOutOfStock
                  ? `<p class="stock-status text-danger">Out of Stock</p>`
                  : `<button class="add-to-cart-btn btn btn-primary" data-id="${product.ProductID}">Add to Cart</button>`}
              </div>
            </div>
          `);

          container.append(productCard);
        });

        container.off('click', '.add-to-cart-btn').on('click', '.add-to-cart-btn', (e) => {
          const id = Number($(e.currentTarget).data('id'));
          const selectedProduct = products.find(p => p.ProductID === id);
          if (selectedProduct) this.addToCart(selectedProduct);
        });
      }

      static bindSearchInput(): void {
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.addEventListener('input', (event: Event) => this.searchProducts(event));
        }
      }

      static searchProducts(event: Event): void {
        const input = event.target as HTMLInputElement;
        const query = input.value.toLowerCase();

        if (!query.trim()) {
          this.displayProducts(this.allFetchedProducts);
          return;
        }

        const filtered = this.allFetchedProducts.filter(product =>
          product.ProductName.toLowerCase().includes(query) ||
          product.ProductDescription.toLowerCase().includes(query)
        );

        this.displayProducts(filtered);
      }

      static addToCart(product: Product): void {
        const user = this.getLoggedInUser();
        if (!user) {
          alert("Please login to add items to cart.");
          window.location.href = "login.html";
          return;
        }

        const cartItem: CartItem = {
          ProductID: product.ProductID,
          ProductName: product.ProductName,
          ProductPrice: product.ProductPrice,
          ProductImg: product.ProductImg,
          Description: product.ProductDescription,
          CartQty: 1,
          TotalPrice: product.ProductPrice,
          UserID: user.UserID
        };

        $.ajax({
          url: 'http://localhost:58731/api/cart/add',
          method: 'POST',
          data: JSON.stringify(cartItem),
          contentType: 'application/json',
          success: () => this.updateCartIconFromServer(),
          error: () => alert("Failed to add item to cart.")
        });
      }

      static getLoggedInUser(): User | null {
        const userJson = sessionStorage.getItem("loggedInUser");
        return userJson ? JSON.parse(userJson) : null;
      }
    }
  }
}

// Initialize on load
Demo.ECommerce.PageUtils.init();
