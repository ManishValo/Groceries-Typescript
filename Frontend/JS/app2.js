// Stores all the fetched products globally for search and filtering
let allFetchedProducts = [];

// Runs once DOM content is loaded, triggers necessary setup functions
window.addEventListener('DOMContentLoaded', () => {
  updateUserSection();             // Displays user info or login/signup links
  updateCartIconFromServer();     // Updates cart icon with item count
  loadProducts();
  fetchAndRenderCategories();     // Loads product categories into dropdown
  bindSearchInput();              // Binds search functionality
 // bindCheckoutButton();           // Handles checkout navigation
});


// Displays login/signup or logged-in user info with logout & orders
function updateUserSection() {
  const userText = document.getElementById('user-text');
  const cartIcon = document.getElementById('cart-link');
  const userJson = sessionStorage.getItem('loggedInUser');
  const user = userJson ? JSON.parse(userJson) : null;

  if (user && user.name) {
    // If user is logged in, show greeting, orders, and logout
    userText.innerHTML = `
      Welcome, ${user.name}  &nbsp;|&nbsp;
      <a href="orders.html" class="text-white text-decoration-none me-2">My Orders</a> |
      <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
    `;
    document.getElementById('spanLogout').onclick = () => logout();
    cartIcon.style.display = 'inline-block';
  } else {
    // If not logged in, show Sign up / Login
    userText.innerHTML = `
      <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
      <a href="login.html" class="text-white text-decoration-none">Login</a>
    `;
    cartIcon.style.display = 'none';
  }
}

// Clears session and redirects to login on logout
function logout() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// Displays the cart item count or hides it if empty
function updateCartCount(count) {
  const cartCount = document.getElementById('cart-count');
  if (count > 0) {
    cartCount.style.display = 'inline-block';
    cartCount.textContent = count;
  } else {
    cartCount.style.display = 'none';
  }
}

// Fetches cart data from API and updates cart icon badge
function updateCartIconFromServer() {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  const cartIcon = document.querySelector('.fa-cart-plus');
  if (!cartIcon) return;

  let countBadge = document.getElementById('cart-count');

  if (!user) {
    // Hide cart icon if user not logged in
    cartIcon.style.display = 'none';
    if (countBadge) countBadge.style.display = 'none';
    return;
  }

  // Fetch cart items for logged-in user
  $.ajax({
    url: `http://localhost:58731/api/cart/user/${user.UserID}`,
    method: 'GET',
    success: function (cartItems) {
      const count = cartItems.reduce((total, item) => total + item.CartQty, 0);
      cartIcon.style.display = 'inline-block';

      if (!countBadge) {
        // Create cart count badge if not already added
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
      countBadge.innerText = count;
    },
    error: function () {
      console.error('Failed to fetch cart items');
    }
  });
}

function loadProducts() {
  $.ajax({
    url: "http://localhost:58731/api/products", 
    method: "GET",
    success: function (data) {
      allProducts = data;
      renderProducts(allProducts); // Display all products at start
    },
    error: function () {
      alert("Failed to load products.");
    },
  });
}

// Render products in the DOM
function renderProducts(products) {
  const container = $("#product-container");
  container.empty();

  if (products.length === 0) {
    container.append("<p>No products found.</p>");
    return;
  }

  products.forEach(product => {
    container.html(products.map(product => `
    <div class="product-card">
      <img src="/images/${product.ProductImg}" alt="${product.ProductName}" class="product-img">
      <h3>${product.ProductName}</h3>
      <p>${product.ProductDescription}</p>
      <p><strong>₹${product.ProductPrice}</strong></p>
      <button class="add-to-cart-btn btn btn-primary" data-id="${product.ProductID}">Add to Cart</button>
    </div>
  `).join(""));

  // Remove old handlers and bind click to new Add to Cart buttons
  container.off('click', '.add-to-cart-btn');
  container.on('click', '.add-to-cart-btn', function () {
    const productId = parseInt($(this).data('id'));
    const product = products.find(p => p.ProductID === productId);
    if (product) addToCart(product);
  });
  });
}
// Fetches category list and populates dropdown menu
function fetchAndRenderCategories() {
  $.ajax({
    url: "http://localhost:58731/api/category",
    method: "GET",
    success: function (categories) {
      const dropdown = document.getElementById("category-dropdown");
      dropdown.innerHTML = "";

      categories.forEach((cat, index) => {
        const li = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.className = "dropdown-item";
        anchor.href = "#";
        anchor.textContent = cat.CategoryName;
        anchor.onclick = () => showCategory(cat.CategoryID);
        li.appendChild(anchor);
        dropdown.appendChild(li);

        // Auto-load first category by default
        //if (index === 0) showCategory(cat.CategoryID);
      });
    },
    error: function (xhr, status, error) {
      console.error("Error fetching categories:", error);
      document.getElementById("category-dropdown").innerHTML = "<li><a class='dropdown-item' href='#'>Failed to load categories</a></li>";
    }
  });
}


// Loads and displays products for a given category
function showCategory(categoryId) {
  if (!categoryId || isNaN(categoryId)) {
    console.error("Invalid category ID:", categoryId);
    return;
  }

  $.ajax({
    url: `http://localhost:58731/api/products/category/${categoryId}`, 
    method: "GET",
    success: function (products) {
      allFetchedProducts = products; // Save for search
      displayProducts(products);
    },
    error: function (xhr, status, error) {
      console.error("Error loading products:", error);
      $("#product-container").html("<p>Failed to load products.</p>");
    }
  });
}


// Renders products on the page in card format
function displayProducts(products) {
  const container = $('#product-container');

  if (!products || products.length === 0) {
    container.html("<p>No products found in this category.</p>");
    return;
  }

  // Render each product as a card
  container.html(products.map(product => `
    <div class="product-card">
      <img src="/images/${product.ProductImg}" alt="${product.ProductName}" class="product-img">
      <h3>${product.ProductName}</h3>
      <p>${product.ProductDescription}</p>
      <p><strong>₹${product.ProductPrice}</strong></p>
      <button class="add-to-cart-btn btn btn-primary" data-id="${product.ProductID}">Add to Cart</button>
    </div>
  `).join(""));

  // Remove old handlers and bind click to new Add to Cart buttons
  container.off('click', '.add-to-cart-btn');
  container.on('click', '.add-to-cart-btn', function () {
    const productId = parseInt($(this).data('id'));
    const product = products.find(p => p.ProductID === productId);
    if (product) addToCart(product);
  });
}

// Retrieves currently logged-in user from sessionStorage
function getLoggedInUser() {
  const userJson = sessionStorage.getItem("loggedInUser");
  return userJson ? JSON.parse(userJson) : null;
}


// Adds selected product to the cart via API
function addToCart(product) {
  const user = getLoggedInUser();
  if (!user) {
    alert("Please login to add items to cart.");
    return;
  }

  const cartItem = {
    ProductID: product.ProductID,
    ProductName: product.ProductName,
    Price: product.ProductPrice,
    Image: `/images/${product.ProductImg}`,
    Description: product.ProductDescription,
    CartQty: 1,
    TotalPrice: product.ProductPrice,
    UserID: user.UserID
  };

  // Send cart item to API
  $.ajax({
    url: 'http://localhost:58731/api/cart/add',
    method: 'POST',
    data: JSON.stringify(cartItem),
    contentType: 'application/json',
    success: function () {
      updateCartIconFromServer(); // Update cart count
    },
    error: function () {
      alert("Failed to add item to cart.");
    }
  });
}

// Filters products based on search input
function searchProducts(event) {
  const query = event.target.value.toLowerCase();

  if (!query.trim()) {
    displayProducts(allFetchedProducts); // Show all if empty
    return;
  }

  const filtered = allFetchedProducts.filter(product =>
    product.ProductName.toLowerCase().includes(query) ||
    product.ProductDescription.toLowerCase().includes(query)
  );

  displayProducts(filtered); // Show filtered products
}


// Binds keyup event to search input field
function bindSearchInput() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', searchProducts);
  }
}


// Binds checkout button to validate login and cart before redirecting
// function bindCheckoutButton() {
//   const checkoutBtn = document.getElementById("checkout-btn");
//   if (!checkoutBtn) return;

//   checkoutBtn.addEventListener("click", () => {
//     const userJson = sessionStorage.getItem("loggedInUser");
//     const user = userJson ? JSON.parse(userJson) : null;

//     if (!user) {
//       alert("Please log in first.");
//       window.location.href = "./login.html";
//       return;
//     }

//     // Check if cart has items before redirecting
//     $.ajax({
//       url: `http://localhost:58731/api/cart/user/${user.UserID}`,
//       method: 'GET',
//       success: function (cartItems) {
//         console.log(cartItems)
//         if (cartItems.length === 0) {
//           alert("🛒 Your cart is empty. Please add some products before checking out.");
//           return;
//         }

//         window.location.href = "./checkout.html";
//       },
//       error: function () {
//         alert("Failed to validate cart.");
//       }
//     });
//   });
// }
