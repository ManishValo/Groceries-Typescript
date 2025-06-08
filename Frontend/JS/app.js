var Demo;
(function (Demo) {
    let ECommerce;
    (function (ECommerce) {
        class PageUtils {
            static init() {
                window.addEventListener('DOMContentLoaded', () => {
                    this.updateUserSection();
                    this.updateCartIconFromServer();
                    this.loadProducts();
                    this.fetchAndRenderCategories();
                    this.bindSearchInput();
                });
            }
            static updateUserSection() {
                const userText = document.getElementById('user-text');
                const cartIcon = document.getElementById('cart-link');
                const user = this.getLoggedInUser();
                if (user === null || user === void 0 ? void 0 : user.name) {
                    userText.innerHTML = `
            Welcome, ${user.name} &nbsp;|&nbsp;
            <a href="orders.html" class="text-white text-decoration-none me-2">My Orders</a> |
            <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
          `;
                    document.getElementById('spanLogout').onclick = this.logout;
                    cartIcon.style.display = 'inline-block';
                }
                else {
                    userText.innerHTML = `
            <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
            <a href="login.html" class="text-white text-decoration-none">Login</a>
          `;
                    cartIcon.style.display = 'none';
                }
            }
            static logout() {
                sessionStorage.removeItem("loggedInUser");
                window.location.href = "login.html";
            }
            static updateCartIconFromServer() {
                const user = this.getLoggedInUser();
                const cartIcon = document.querySelector('.fa-cart-plus');
                if (!cartIcon)
                    return;
                let countBadge = document.getElementById('cart-count');
                if (!user) {
                    cartIcon.style.display = 'none';
                    if (countBadge)
                        countBadge.style.display = 'none';
                    return;
                }
                $.ajax({
                    url: `http://localhost:58731/api/cart/user/${user.UserID}`,
                    method: 'GET',
                    success: (cartItems) => {
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
            static loadProducts() {
                $.ajax({
                    url: "http://localhost:58731/api/products",
                    method: "GET",
                    success: (data) => {
                        this.allFetchedProducts = data;
                        this.displayProducts(data);
                    },
                    error: () => alert("Failed to load products.")
                });
            }
            static fetchAndRenderCategories() {
                $.ajax({
                    url: "http://localhost:58731/api/category",
                    method: "GET",
                    success: (categories) => {
                        const dropdown = document.getElementById("category-dropdown");
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
                        const dropdown = document.getElementById("category-dropdown");
                        dropdown.innerHTML = "<li><a class='dropdown-item' href='#'>Failed to load categories</a></li>";
                    }
                });
            }
            static showCategory(categoryId) {
                if (!categoryId || isNaN(categoryId)) {
                    console.error("Invalid category ID:", categoryId);
                    return;
                }
                $.ajax({
                    url: `http://localhost:58731/api/products/category/${categoryId}`,
                    method: "GET",
                    success: (products) => {
                        this.allFetchedProducts = products;
                        this.displayProducts(products);
                    },
                    error: () => {
                        console.error("Error loading products.");
                        $("#product-container").html("<p>Failed to load products.</p>");
                    }
                });
            }
            static displayProducts(products) {
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
                    if (selectedProduct)
                        this.addToCart(selectedProduct);
                });
            }
            static bindSearchInput() {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (event) => this.searchProducts(event));
                }
            }
            static searchProducts(event) {
                const input = event.target;
                const query = input.value.toLowerCase();
                if (!query.trim()) {
                    this.displayProducts(this.allFetchedProducts);
                    return;
                }
                const filtered = this.allFetchedProducts.filter(product => product.ProductName.toLowerCase().includes(query) ||
                    product.ProductDescription.toLowerCase().includes(query));
                this.displayProducts(filtered);
            }
            static addToCart(product) {
                const user = this.getLoggedInUser();
                if (!user) {
                    alert("Please login to add items to cart.");
                    window.location.href = "login.html";
                    return;
                }
                const cartItem = {
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
            static getLoggedInUser() {
                const userJson = sessionStorage.getItem("loggedInUser");
                return userJson ? JSON.parse(userJson) : null;
            }
        }
        PageUtils.allFetchedProducts = [];
        ECommerce.PageUtils = PageUtils;
    })(ECommerce = Demo.ECommerce || (Demo.ECommerce = {}));
})(Demo || (Demo = {}));
// Initialize on load
Demo.ECommerce.PageUtils.init();
export {};
