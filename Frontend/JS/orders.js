"use strict";
var Demo;
(function (Demo) {
    var UserOrders;
    (function (UserOrders) {
        class OrderPage {
            constructor() {
                this.apiBaseUrl = "http://localhost:58731/api";
                window.addEventListener('DOMContentLoaded', () => {
                    this.updateUserSection();
                    this.loadUserOrders();
                });
            }
            updateUserSection() {
                const userText = document.getElementById('user-text');
                if (!userText)
                    return;
                const userJson = sessionStorage.getItem('loggedInUser');
                const user = userJson ? JSON.parse(userJson) : null;
                if (user && user.name) {
                    userText.innerHTML = `
          Welcome, ${user.name} &nbsp;|&nbsp;
          <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
        `;
                    const logoutSpan = document.getElementById('spanLogout');
                    if (logoutSpan) {
                        logoutSpan.onclick = () => this.logout();
                    }
                }
                else {
                    userText.innerHTML = `
          <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
          <a href="login.html" class="text-white text-decoration-none">Login</a>
        `;
                }
            }
            logout() {
                sessionStorage.removeItem("loggedInUser");
                window.location.href = "login.html";
            }
            loadUserOrders() {
                const userJson = sessionStorage.getItem("loggedInUser");
                const user = userJson ? JSON.parse(userJson) : null;
                if (!user || !user.UserID) {
                    alert("Please log in to view your orders.");
                    window.location.href = "login.html";
                    return;
                }
                $.ajax({
                    url: `${this.apiBaseUrl}/bill/user/${user.UserID}`,
                    method: 'GET',
                    success: (orders) => {
                        this.renderOrders(orders);
                    },
                    error: (xhr, status, error) => {
                        console.error("Failed to load orders:", error);
                        $('#orders-list').html("<p class='text-danger'>Failed to load order history.</p>");
                    }
                });
            }
            renderOrders(orders) {
                const container = $('#orders-list');
                if (!orders || orders.length === 0) {
                    container.html("<p>You have not placed any orders yet.</p>");
                    return;
                }
                const html = orders.map(order => {
                    const itemsHtml = (order.Items || []).map(item => {
                        var _a;
                        return `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${item.ProductName}</strong><br>
              <small>${(_a = item.Description) !== null && _a !== void 0 ? _a : 'No description'}</small>
            </div>
            <span>Qty: ${item.Quantity} | ₹${item.Price}</span>
          </li>
        `;
                    }).join('');
                    return `
          <div class="card mb-4 shadow">
            <div class="card-header bg-success text-white">
              <strong>Order ID:</strong> ${order.OrderID} &nbsp;&nbsp;
              <strong>Date:</strong> ${new Date(order.OrderDate).toLocaleDateString()} &nbsp;&nbsp;
              <strong>Total:</strong> ₹${order.OrderAmt.toFixed(2)}
            </div>
            <ul class="list-group list-group-flush">${itemsHtml}</ul>
          </div>
        `;
                }).join('');
                container.html(html);
            }
        }
        UserOrders.OrderPage = OrderPage;
    })(UserOrders = Demo.UserOrders || (Demo.UserOrders = {}));
})(Demo || (Demo = {}));
// Instantiate the page logic
new Demo.UserOrders.OrderPage();
