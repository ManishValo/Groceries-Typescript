// Stores all the fetched products globally for use in search and filtering
let allFetchedProducts = [];

// Executes when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  updateUserSection();             // Display user login/logout state
  updateCartIconFromServer();     // Fetch and display cart count
  loadProducts();                 // Load all products on page load
  fetchAndRenderCategories();     // Fetch product categories and render dropdown
  bindSearchInput();              // Attach search functionality
});

// Handles user session display logic
function updateUserSection() {
  const userText = document.getElementById('user-text');
  const cartIcon = document.getElementById('cart-link');
  const userJson = sessionStorage.getItem('loggedInUser');
  const user = userJson ? JSON.parse(userJson) : null;

  if (user && user.name) {
    // If user is logged in
    userText.innerHTML = `
      Welcome, ${user.name} &nbsp;|&nbsp;
      <a href="orders.html" class="text-white text-decoration-none me-2">My Orders</a> |
      <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
    `;
    document.getElementById('spanLogout').onclick = () => logout();
    cartIcon.style.display = 'inline-block';
  } else {
    // If user is not logged in
    userText.innerHTML = `
      <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
      <a href="login.html" class="text-white text-decoration-none">Login</a>
    `;
    cartIcon.style.display = 'none';
  }
}

// Logs user out by clearing session and redirecting
function logout() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// Displays cart count badge near the cart icon
function updateCartCount(count) {
  const cartCount = document.getElementById('cart-count');
  if (count > 0) {
    cartCount.style.display = 'inline-block';
    cartCount.textContent = count;
  } else {
    cartCount.style.display = 'none';
  }
}

// Fetches cart data from server and updates cart icon with item count
function updateCartIconFromServer() {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;
  const cartIcon = document.querySelector('.fa-cart-plus');
  if (!cartIcon) return;

  let countBadge = document.getElementById('cart-count');

  // If user is not logged in, hide cart icon and badge
  if (!user) {
    cartIcon.style.display = 'none';
    if (countBadge) countBadge.style.display = 'none';
    return;
  }

  // Fetch user's cart items and calculate total quantity
  $.ajax({
    url: `http://localhost:58731/api/cart/user/${user.UserID}`,
    method: 'GET',
    success: function (cartItems) {
      const count = cartItems.reduce((total, item) => total + item.CartQty, 0);
      cartIcon.style.display = 'inline-block';

      // If badge doesn't exist, create it
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
      countBadge.innerText = count;
    },
    error: function () {
      console.error('Failed to fetch cart items');
    }
  });
}

// Loads all products from server on page load
function loadProducts() {
  $.ajax({
    url: "http://localhost:58731/api/products", 
    method: "GET",
    success: function (data) {
      allFetchedProducts = data;     // Store globally for search/filter
      renderProducts(data);          
    },
    error: function () {
      alert("Failed to load products.");
    },
  });
}

// Wrapper function to render products
function renderProducts(products) {
  displayProducts(products); // Delegates to unified display logic
}

// Fetches all categories and populates the dropdown menu
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
        anchor.onclick = () => showCategory(cat.CategoryID); // Load category on click
        li.appendChild(anchor);
        dropdown.appendChild(li);

        if (index === 0) showCategory(cat.CategoryID); // Load first category by default
      });
    },
    error: function (xhr, status, error) {
      console.error("Error fetching categories:", error);
      document.getElementById("category-dropdown").innerHTML = "<li><a class='dropdown-item' href='#'>Failed to load categories</a></li>";
    }
  });
}

// Loads and displays products by selected category
function showCategory(categoryId) {
  if (!categoryId || isNaN(categoryId)) {
    console.error("Invalid category ID:", categoryId);
    return;
  }

  $.ajax({
    url: `http://localhost:58731/api/products/category/${categoryId}`, 
    method: "GET",
    success: function (products) {
      allFetchedProducts = products;   // Update global list
      displayProducts(products);       // Render filtered products
    },
    error: function () {
      console.error("Error loading products.");
      $("#product-container").html("<p>Failed to load products.</p>");
    }
  });
}

// Renders product cards dynamically in the DOM with out of stock logic
function displayProducts(products) {
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
                <img src="/images/${product.ProductImg}" alt="${product.ProductName}" class="product-img">
                <div class="product-details">
                    <h5>${product.ProductName}</h5>
                    <p class="desc">${product.ProductDescription || ''}</p>
                    <p class="price">₹${product.ProductPrice.toFixed(2)}</p>
                    ${isOutOfStock 
                        ? `<p class="stock-status text-danger">Out of Stock</p>`
                        : `<button class="add-to-cart-btn btn btn-primary" data-id="${product.ProductID}">Add to Cart</button>`
                    }
                </div>
            </div>
        `);

        container.append(productCard);
    });

    // Add-to-cart button click
    container.off('click', '.add-to-cart-btn').on('click', '.add-to-cart-btn', function () {
        const id = $(this).data('id');
        const selectedProduct = products.find(p => p.ProductID === id);
        if (selectedProduct) {
            addToCart(selectedProduct);
        }
    });
}




// Retrieves currently logged-in user from session
function getLoggedInUser() {
  const userJson = sessionStorage.getItem("loggedInUser");
  return userJson ? JSON.parse(userJson) : null;
}

// Sends API request to add product to cart
function addToCart(product) {
  const user = getLoggedInUser();
  if (!user) {
    alert("Please login to add items to cart.");
    window.location.href="login.html"
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

  $.ajax({
    url: 'http://localhost:58731/api/cart/add',
    method: 'POST',
    data: JSON.stringify(cartItem),
    contentType: 'application/json',
    success: function () {
      updateCartIconFromServer(); // Refresh cart count
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
    displayProducts(allFetchedProducts); // Show all if search is empty
    return;
  }

  const filtered = allFetchedProducts.filter(product =>
    product.ProductName.toLowerCase().includes(query) ||
    product.ProductDescription.toLowerCase().includes(query)
  );

  displayProducts(filtered); // Show filtered results
}

// Binds input event to search bar
function bindSearchInput() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', searchProducts);
  }
}



// Renders product cards dynamically in the DOM
// function displayProducts(products) {
//   const container = $('#product-container');

//   if (!products || products.length === 0) {
//     container.html("<p>No products found.</p>");
//     return;
//   }

//   container.html(products.map(product => `
//     <div class="product-card">
//       <img src="/images/${product.ProductImg}" alt="${product.ProductName}" class="product-img">
//       <h3>${product.ProductName}</h3>
//       <p>${product.ProductDescription}</p>
//       <p><strong>₹${product.ProductPrice}</strong></p>
//       <button class="add-to-cart-btn btn btn-primary" data-id="${product.ProductID}">Add to Cart</button>
//     </div>
//   `).join(""));

//   // Handle add-to-cart button clicks
//   container.off('click', '.add-to-cart-btn');
//   container.on('click', '.add-to-cart-btn', function () {
//     const productId = parseInt($(this).data('id'));
//     const product = products.find(p => p.ProductID === productId);
//     if (product) addToCart(product);
//   });
// }