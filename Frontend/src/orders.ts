namespace Demo.UserOrders {
  interface OrderItem {
    ProductName: string;
    Description?: string;
    Quantity: number;
    Price: number;
  }

  interface Order {
    OrderID: number;
    OrderDate: string; // ISO string date
    OrderAmt: number;
    Items: OrderItem[];
  }

  interface User {
    UserID: number;
    name: string;
  }

  export class OrderPage {
    private apiBaseUrl = "http://localhost:58731/api";

    constructor() {
      window.addEventListener('DOMContentLoaded', () => {
        this.updateUserSection();
        this.loadUserOrders();
      });
    }

    private updateUserSection(): void {
      const userText = document.getElementById('user-text');
      if (!userText) return;

      const userJson = sessionStorage.getItem('loggedInUser');
      const user: User | null = userJson ? JSON.parse(userJson) : null;

      if (user && user.name) {
        userText.innerHTML = `
          Welcome, ${user.name} &nbsp;|&nbsp;
          <span id="spanLogout" class="logout" style="cursor:pointer; text-decoration:underline;">Logout</span>
        `;

        const logoutSpan = document.getElementById('spanLogout');
        if (logoutSpan) {
          logoutSpan.onclick = () => this.logout();
        }
      } else {
        userText.innerHTML = `
          <a href="signup.html" class="text-white text-decoration-none me-2">Sign up</a> /
          <a href="login.html" class="text-white text-decoration-none">Login</a>
        `;
      }
    }

    private logout(): void {
      sessionStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    }

    private loadUserOrders(): void {
      const userJson = sessionStorage.getItem("loggedInUser");
      const user: User | null = userJson ? JSON.parse(userJson) : null;

      if (!user || !user.UserID) {
        alert("Please log in to view your orders.");
        window.location.href = "login.html";
        return;
      }

      $.ajax({
        url: `${this.apiBaseUrl}/bill/user/${user.UserID}`,
        method: 'GET',
        success: (orders: Order[]) => {
          this.renderOrders(orders);
        },
        error: (xhr, status, error) => {
          console.error("Failed to load orders:", error);
          $('#orders-list').html("<p class='text-danger'>Failed to load order history.</p>");
        }
      });
    }

    private renderOrders(orders: Order[]): void {
      const container = $('#orders-list');

      if (!orders || orders.length === 0) {
        container.html("<p>You have not placed any orders yet.</p>");
        return;
      }

      const html = orders.map(order => {
        const itemsHtml = (order.Items || []).map(item => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${item.ProductName}</strong><br>
              <small>${item.Description ?? 'No description'}</small>
            </div>
            <span>Qty: ${item.Quantity} | ₹${item.Price}</span>
          </li>
        `).join('');

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
}

// Instantiate the page logic
new Demo.UserOrders.OrderPage();
