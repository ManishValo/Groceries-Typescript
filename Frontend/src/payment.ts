namespace Demo {
  export namespace UserDetails {

    interface CartItem {
      ProductID: number;
      ProductName: string;
      ProductPrice: number;
      ProductImg: string;
      Description: string;
      CartQty: number;
      TotalPrice: number;
      ProductQuantity?: number;
      UserID: number;
    }

    interface User {
      UserID: number;
      name: string;
      email: string;
      Address?: string;
      City?: string;
      Pincode?: string;
      MobileNo?: string;
    }

    interface Payment {
      CardNumber: string;
      Cvv: string;
      CardExpiry: string;
      otp: string;
    }

    interface BillDetail {
      ProductID: number;
      Quantity: number;
      UnitPrice: number;
      TotalPrice: number;
    }

    interface BillDTO {
      UserID: number;
      BillAmt: number;
      Details: BillDetail[];
    }

    export class PaymentOrder {
      private BASE_Url = "http://localhost:58731/api";
      private user: User | null = null;
      private cartItems: CartItem[] = [];
      private totalAmount: number = 0;

      constructor() {
        $(() => {
          this.init();
        });
      }

      private init(): void {
        this.loadUserFromSession();
        if (!this.user || !this.user.UserID) {
          alert("User not logged in.");
          window.location.href = "login.html";
          return;
        }

        this.showUserInfo();
        this.loadUserCart();

        // Bind logout
        $(document).on("click", "#logout-link", () => this.logout());

        // Bind pay button
        $("#pay-btn").click(() => this.handlePayment());
      }

      private loadUserFromSession(): void {
        const userJson = sessionStorage.getItem("loggedInUser");
        this.user = userJson ? JSON.parse(userJson) : null;
      }

      private showUserInfo(): void {
        if (!this.user) return;

        $("#user-text").html(`
          Welcome, ${this.user.name} &nbsp;|&nbsp; 
          <span id="logout-link" style="text-decoration: underline; cursor: pointer;">Logout</span>
        `);

        // Populate user details form fields if present
        $("#full-name").val(this.user.name);
        $("#email").val(this.user.email);
      }

      private loadUserCart(): void {
        if (!this.user) return;

        $.ajax({
          url: `${this.BASE_Url}/cart/user/${this.user.UserID}`,
          type: "GET",
          success: (data: CartItem[]) => {
            this.cartItems = data;
            if (this.cartItems.length === 0) {
              alert("Your cart is empty.");
              return;
            }

            this.totalAmount = this.cartItems.reduce((sum, item) => sum + item.TotalPrice, 0);
            // Optionally display total amount
            // $("#totalAmount").text(`Total: ₹${this.totalAmount}`);
          },
          error: () => alert("Failed to load cart."),
        });
      }

      private validatePayment(payment: Payment): boolean {
        if (
          !payment.CardNumber ||
          !payment.Cvv ||
          !payment.CardExpiry ||
          !payment.otp
        ) {
          alert("Please fill in card details.");
          return false;
        }
        if (payment.CardNumber.length !== 16) {
          alert("Enter 16 digit card number");
          return false;
        }
        if (payment.Cvv.length !== 3) {
          alert("Enter correct CVV");
          return false;
        }
        return true;
      }

      private validateAddress(updatedUser: Partial<User>): boolean {
        if (
          !updatedUser.Address ||
          !updatedUser.City ||
          !updatedUser.Pincode ||
          !updatedUser.MobileNo
        ) {
          alert("Please fill in all address and contact details.");
          return false;
        }
        return true;
      }

      private handlePayment(): void {
        if (this.cartItems.length === 0) {
          alert("Cart is empty.");
          return;
        }
        if (!this.user) return;

        const updatedUser: Partial<User> = {
          UserID: this.user.UserID,
          Address: $("#address").val()?.toString().trim(),
          City: $("#city").val()?.toString().trim(),
          Pincode: $("#pincode").val()?.toString().trim(),
          MobileNo: $("#contact").val()?.toString().trim(),
        };

        if (!this.validateAddress(updatedUser)) return;

        const payment: Payment = {
          CardNumber: $('#cardnumber').val()?.toString() || "",
          Cvv: $('#cvv').val()?.toString() || "",
          CardExpiry: $('#cardexpiry').val()?.toString() || "",
          otp: $('#otp').val()?.toString() || ""
        };

        if (!this.validatePayment(payment)) return;

        // Update user contact info first
        $.ajax({
          url: `${this.BASE_Url}/user/update-contact/${this.user.UserID}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(updatedUser),
          success: () => this.processBillCreation(),
          error: () => alert("Failed to update user information."),
        });
      }

      private processBillCreation(): void {
        if (!this.user) return;

        const billDto: BillDTO = {
          UserID: this.user.UserID,
          BillAmt: this.totalAmount,
          Details: this.cartItems.map(item => ({
            ProductID: item.ProductID,
            Quantity: item.CartQty,
            UnitPrice: item.ProductPrice,
            TotalPrice: item.TotalPrice,
          })),
        };

        $.ajax({
          url: `${this.BASE_Url}/bill/add`,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(billDto),
          success: (response: { Order: number }) => this.updateStockAndClearCart(response.Order),
          error: () => alert("Payment failed. Please try again."),
        });
      }

      private updateStockAndClearCart(orderId: number): void {
        if (!this.user) return;

        const stockUpdateData = this.cartItems.map(item => ({
          ProductID: item.ProductID,
          Quantity: item.CartQty,
        }));

        $.ajax({
          url: `${this.BASE_Url}/products/update-stock`,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(stockUpdateData),
          success: () => this.clearCart(orderId),
          error: () => alert("Stock update failed"),
        });
      }

      private clearCart(orderId: number): void {
        if (!this.user) return;

        $.ajax({
          url: `${this.BASE_Url}/cart/clear/user/${this.user.UserID}`,
          type: "DELETE",
          success: () => {
            alert("Payment successful! Bill ID: " + orderId);
            sessionStorage.setItem("billId", orderId.toString());
            window.location.href = `/Frontend/bill.html?billId=${orderId}`;
            
          },
          error: () => alert("Payment successful, but failed to clear cart."),
        });
      }

      private logout(): void {
        if (confirm("Are you sure you want to logout?")) {
          sessionStorage.removeItem("loggedInUser");
          window.location.href = "index.html";
        }
      }
    }
  }
}

$(() => {
  new Demo.UserDetails.PaymentOrder();
});
