// Wait until the DOM is fully loaded
$(document).ready(function () {
  // Get logged-in user from sessionStorage
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  // Get reference to the DOM element where the user info will be displayed
  const userText = document.getElementById('user-text');

  // If the user is logged in, show welcome message and logout link
  if (user) {
    $("#user-text").html(`Welcome, ${user.name} &nbsp;|&nbsp; 
      <span id="logout-link" style="text-decoration: underline; cursor: pointer;">Logout</span>`);
  }

  // Logout click event – clears session and redirects to home
  $(document).on("click", "#logout-link", function () {
    if (confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    }
  });

  // Extract user ID from the logged-in user
  const userId = user.UserID;

  // API endpoint to fetch user's cart items
  const apiUrl = `http://localhost:58731/api/cart/user/${userId}`;

  // Function to load all cart items from server
  function loadCart() {
    $.ajax({
      url: apiUrl,
      method: "GET",
      success: function (cartItems) {
        const container = $("#cart-items-container");
        container.empty(); // Clear existing items

        // If cart is empty, show empty message and hide total
        if (!cartItems || cartItems.length === 0) {
          $(".empty-cart-message").show();
          $("#cart-total").hide();
        } else {
          $(".empty-cart-message").hide();
          $("#cart-total").show();
        }

        // Redundant safety visibility logic
        $(".empty-cart-message").addClass("hidden");
        $("#cart-total").show();

        let totalAmount = 0; // Initialize total amount

        // Loop through each item and append it to cart container
        cartItems.forEach(item => {
          totalAmount += item.TotalPrice;

          const card = `
            <div class="cart-card" style="display:flex;gap:1rem;border:1px solid #ccc;padding:1rem;margin-bottom:1rem;">
              <img src="/images/${item.ProductImg}" alt="${item.ProductName}" style="width:100px;height:100px; object-fit: contain;">
              <div>
                <h3>${item.ProductName}</h3>
                <p>Price: ₹${item.ProductPrice}</p>
                <div>
                  Quantity:
                  <button class="qty-btn decrease" data-id="${item.CartID}" data-qty="${item.CartQty}" data-price="${item.ProductPrice}">−</button>
                  <span class="cart-qty">${item.CartQty}</span>
                  <button class="qty-btn increase" data-id="${item.CartID}" data-qty="${item.CartQty}" data-price="${item.ProductPrice}">+</button>
                </div>
                <p>Total: ₹${item.TotalPrice}</p>
                <button class="remove-btn" data-id="${item.CartID}" style="background-color: #ff4d4d; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 5px;">Remove</button>
              </div>
            </div>
          `;

          container.append(card); // Append card to container
        });

        // Show total amount at the bottom
        $("#cart-total-amount").text(`Total: ₹${totalAmount}`);
      },
      error: function (xhr) {
        // On error, show empty state
        const container = $("#cart-items-container");
        container.empty();
        $(".empty-cart-message").removeClass("hidden");
        $("#cart-total").hide();
        $(".cart-count").text(0); 
      }
    });
  }

  // Handle quantity increase/decrease buttons
  $(document).on("click", ".qty-btn", function () {
    const cartId = $(this).data("id");
    let qty = parseInt($(this).data("qty"));
    const unitPrice = parseFloat($(this).data("price"));
    const isIncrease = $(this).hasClass("increase");

    // Increase or decrease quantity
    if (isIncrease) {
      qty += 1;
    } else {
      if (qty <= 1) {
        alert("Minimum quantity is 1.");
        return;
      }
      qty -= 1;
    }

    // Prepare updated cart object
    const updatedCart = {
      CartID: cartId,
      CartQty: qty,
      TotalPrice: qty * unitPrice
    };

    // Send updated quantity to server via PUT
    $.ajax({
      url: "http://localhost:58731/api/cart/update",
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(updatedCart),
      success: function () {
        loadCart();                // Reload cart UI
        updateCartIconFromServer(); // Update cart count
      },
      error: function () {
        alert("Failed to update cart quantity.");
      }
    });
  });

  // Handle item removal
  $(document).on("click", ".remove-btn", function () {
    const cartId = $(this).data("id");

    // Call API to delete the cart item
    $.ajax({
      url: `http://localhost:58731/api/cart/delete/${cartId}`,
      method: "DELETE",
      success: function () {
        loadCart();                // Refresh cart display
        updateCartIconFromServer(); // Update cart count
      },
      error: function () {
        alert("Failed to remove item.");
      }
    });
  });

  // Updates the cart count in the navbar/cart icon
  function updateCartIconFromServer() {
    $.ajax({
      url: `http://localhost:58731/api/cart/user/${userId}`,
      method: "GET",
      success: function (cartItems) {
        const totalCount = cartItems.reduce((sum, item) => sum + item.CartQty, 0);
        $(".cart-count").text(totalCount);
      },
      error: function () {
        $(".cart-count").text(0); // On error, show 0
      }
    });
  }

  // Initially load cart on page load
  loadCart();

  // Handle checkout button click
  $("#checkout-btn").on("click", function () {
    // Verify cart has items before redirecting to payment
    $.ajax({
      url: `http://localhost:58731/api/cart/user/${userId}`,
      method: "GET",
      success: function (cartItems) {
        console.log(cartItems)
        if (cartItems.length === 0) {
          alert("Your cart is empty. Please add items before proceeding.");
          return;
        }

      const outOfStockItems = cartItems.filter(item => item.ProductQuantity < item.CartQty);
      if (outOfStockItems.length > 0) {
        const names = outOfStockItems.map(i => i.ProductName).join(", ");
        alert(`The following products are out of stock: ${names}`);
        return;
      }

        // Proceed to payment page
        window.location.href = "paymentgateway.html";
      },
      error: function () {
        alert("Could not validate cart before checkout.");
      }
    });
  });
});
