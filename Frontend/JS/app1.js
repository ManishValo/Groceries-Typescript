let allFetchedProducts = [];

window.addEventListener('DOMContentLoaded', () => {
  updateUserSection();
  updateCartIconFromServer();
  // fetchAndRenderAllProducts();
  bindSearchInput();
  bindCheckoutButton();
});

function updateUserSection() {
  const userText = document.getElementById('user-text');
  const cartIcon = document.getElementById('cart-link');
  const userJson = sessionStorage.getItem('loggedInUser');
  const user = userJson ? JSON.parse(userJson) : null;

  if (user && user.name) {
    userText.innerHTML = `
      Welcome, ${user.name}  &nbsp;|&nbsp;
      <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
    `;
    document.getElementById('spanLogout').onclick = () => {
      logout();
    };
    cartIcon.style.display = 'inline-block';
  } else {
    userText.innerHTML = `
      <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
      <a href="login.html" class="text-white text-decoration-none">Login</a>
    `;
    cartIcon.style.display = 'none';
  }
}

function logout() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function updateCartCount(count) {
  const cartCount = document.getElementById('cart-count');
  if (count > 0) {
    cartCount.style.display = 'inline-block';
    cartCount.textContent = count;
  } else {
    cartCount.style.display = 'none';
  }
}

function updateCartIconFromServer() {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  const cartIcon = document.querySelector('.fa-cart-plus');
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
    success: function (cartItems) {
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
      countBadge.innerText = count;
    },
    error: function () {
      console.error('Failed to fetch cart items');
    }
  });
}

// function fetchAndRenderAllProducts() {
//   $.ajax({
//     url: "http://localhost:58731/api/products",
//     method: "GET",
//     success: function (products) {
//       allFetchedProducts = products;
//       displayProducts(products);
//     },
//     error: function () {
//       $("#product-container").html("<p>Failed to load products.</p>");
//     }
//   });
// }

// function displayProducts(products) {
//   const container = $('#product-container');

//   if (!products || products.length === 0) {
//     container.html("<p>No products available.</p>");
//     return;
//   }

//   container.html(products.map(product => `
//     <div class="product-card">
//       <img src="/images/${product.ProductImg}" alt="${product.ProductName}" class="product-img">
//       <h3>${product.ProductName}</h3>
//       <p>${product.ProductDescription}</p>
//       <p><strong>₹${product.ProductPrice}</strong></p>
//       <button class="add-to-cart-btn" data-id="${product.ProductID}">Add to Cart</button>
//     </div>
//   `).join(""));

//   container.off('click', '.add-to-cart-btn');
//   container.on('click', '.add-to-cart-btn', function () {
//     const productId = parseInt($(this).data('id'));
//     const product = products.find(p => p.ProductID === productId);
//     addToCart(product);
//   });
// }

function fetchAndRenderCategories() {
  $.ajax({
    url: "http://localhost:60565/api/category",
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

        if (index === 0) showCategory(cat.CategoryID); // Load first category on page load
      });
    },
    error: function (xhr, status, error) {
      console.error("Error fetching categories:", error);
      document.getElementById("category-dropdown").innerHTML = "<li><a class='dropdown-item' href='#'>Failed to load categories</a></li>";
    }
  });
}

function showCategory(categoryId) {
  if (!categoryId || isNaN(categoryId)) {
    console.error("Invalid category ID:", categoryId);
    return;
  }

  $.ajax({
    url: `http://localhost:60565/api/grocery/category/${categoryId}`, // Update this if your route is different
    method: "GET",
    success: function (products) {
      allFetchedProducts = products;
      displayProducts(products);
    },
    error: function (xhr, status, error) {
      console.error("Error loading products:", error);
      $("#product-container").html("<p>Failed to load products.</p>");
    }
  });
}

function displayProducts(products) {
  const container = $('#product-container');

  if (!products || products.length === 0) {
    container.html("<p>No products found in this category.</p>");
    return;
  }

  container.html(products.map(product => `
    <div class="product-card">
      <img src="/images/${product.ProductImg}" alt="${product.ProductName}" class="product-img">
      <h3>${product.ProductName}</h3>
      <p>${product.ProductDescription}</p>
      <p><strong>₹${product.ProductPrice}</strong></p>
      <button class="add-to-cart-btn btn btn-primary" data-id="${product.ProductID}">Add to Cart</button>
    </div>
  `).join(""));

  container.off('click', '.add-to-cart-btn');
  container.on('click', '.add-to-cart-btn', function () {
    const productId = parseInt($(this).data('id'));
    const product = products.find(p => p.ProductID === productId);
    if (product) addToCart(product);
  });
}
function getLoggedInUser() {
  const userJson = sessionStorage.getItem("loggedInUser");
  return userJson ? JSON.parse(userJson) : null;
}

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

  $.ajax({
    url: 'http://localhost:58731/api/cart/add',
    method: 'POST',
    data: JSON.stringify(cartItem),
    contentType: 'application/json',
    success: function () {
      updateCartIconFromServer();
      // alert("Added to cart!");
    },
    error: function () {
      alert("Failed to add item to cart.");
    }
  });
}

function searchProducts(event) {
  const query = event.target.value.toLowerCase();

  if (!query.trim()) {
    displayProducts(allFetchedProducts);
    return;
  }

  const filtered = allFetchedProducts.filter(product =>
    product.ProductName.toLowerCase().includes(query) ||
    product.ProductDescription.toLowerCase().includes(query)
  );

  displayProducts(filtered);
}


function bindSearchInput() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', searchProducts);
  }
}

function bindCheckoutButton() {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const userJson = sessionStorage.getItem("loggedInUser");
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user) {
      alert("Please log in first.");
      window.location.href = "./login.html";
      return;
    }

    $.ajax({
      url: `http://localhost:58731/api/cart/user/${user.UserID}`,
      method: 'GET',
      success: function (cartItems) {
        if (cartItems.length === 0) {
          alert("🛒 Your cart is empty. Please add some products before checking out.");
          return;
        }

        window.location.href = "./checkout.html";
      },
      error: function () {
        alert("Failed to validate cart.");
      }
    });
  });
}

