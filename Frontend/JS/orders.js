// Run these functions as soon as the DOM content is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  updateUserSection();   // Display user's name or login/signup links
  loadUserOrders();      // Fetch and display user's order history
});

// Update user section in the navbar based on login status
function updateUserSection() {
  const userText = document.getElementById('user-text');
  const userJson = sessionStorage.getItem('loggedInUser'); // Retrieve user from session
  const user = userJson ? JSON.parse(userJson) : null;

  if (user && user.name) {
    // If user is logged in, display welcome message and logout option
    userText.innerHTML = `
      Welcome, ${user.name} &nbsp;|&nbsp;
      <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
    `;
    // Attach logout function to the logout span
    document.getElementById('spanLogout').onclick = logout;
  } else {
    // If user is not logged in, show signup and login links
    userText.innerHTML = `
      <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
      <a href="login.html" class="text-white text-decoration-none">Login</a>
    `;
  }
}

// Logout function – removes user from session and redirects to login page
function logout() {
  sessionStorage.removeItem("loggedInUser"); // Clear session data
  window.location.href = "login.html";       // Redirect to login
}

// Load orders placed by the logged-in user
function loadUserOrders() {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user || !user.UserID) {
    alert("Please log in to view your orders.");  // Guard clause for unauthorized access
    window.location.href = "login.html";
    return;
  }

  // Send AJAX GET request to fetch order history
  $.ajax({
    url: `http://localhost:58731/api/bill/user/${user.UserID}`, // Endpoint for user orders
    method: 'GET',
    success: function (orders) {
      //console.log(orders); 
      renderOrders(orders); // Render orders on the page
    },
    error: function (xhr, status, error) {
      console.error("Failed to load orders:", error); // Log error for debugging
      $('#orders-list').html("<p class='text-danger'>Failed to load order history.</p>");
    }
  });
}

// Render the list of orders in the DOM
function renderOrders(orders) {
  const container = $('#orders-list');

  // If no orders exist, show appropriate message
  if (!orders || orders.length === 0) {
    container.html("<p>You have not placed any orders yet.</p>");
    return;
  }

  // Loop through each order and format the HTML
  const html = orders.map(order => {
    // Extract and render individual order items
    const items = (order.Items || order.items || []).map(item => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${item.ProductName || item.productName}</strong><br>
          <small>${item.Description || item.description || 'No description'}</small>
        </div>
        <span>Qty: ${item.Quantity || item.quantity} | ₹${item.Price || item.price}</span>
      </li>
    `).join('');

    // Return a full card for each order
    return `
      <div class="card mb-4 shadow">
        <div class="card-header bg-success text-white">
          <strong>Order ID:</strong> ${order.OrderID || order.orderId} &nbsp;&nbsp;
          <strong>Date:</strong> ${new Date(order.OrderDate || order.orderDate).toLocaleDateString()} &nbsp;&nbsp;
          <strong>Total:</strong> ₹${(order.OrderAmt || order.totalAmount).toFixed(2)}
        </div>
        <ul class="list-group list-group-flush">${items}</ul>
      </div>
    `;
  }).join('');

  // Inject the constructed HTML into the container
  container.html(html);
}
