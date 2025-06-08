"use strict";
var Demo;
(function (Demo) {
    let UserDetails;
    (function (UserDetails) {
        class PaymentOrder {
            constructor() {
                this.BASE_Url = "http://localhost:58731/api";
                this.user = null;
                this.cartItems = [];
                this.totalAmount = 0;
                $(() => {
                    this.init();
                });
            }
            init() {
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
            loadUserFromSession() {
                const userJson = sessionStorage.getItem("loggedInUser");
                this.user = userJson ? JSON.parse(userJson) : null;
            }
            showUserInfo() {
                if (!this.user)
                    return;
                $("#user-text").html(`
          Welcome, ${this.user.name} &nbsp;|&nbsp; 
          <span id="logout-link" style="text-decoration: underline; cursor: pointer;">Logout</span>
        `);
                // Populate user details form fields if present
                $("#full-name").val(this.user.name);
                $("#email").val(this.user.email);
            }
            loadUserCart() {
                if (!this.user)
                    return;
                $.ajax({
                    url: `${this.BASE_Url}/cart/user/${this.user.UserID}`,
                    type: "GET",
                    success: (data) => {
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
            validatePayment(payment) {
                if (!payment.CardNumber ||
                    !payment.Cvv ||
                    !payment.CardExpiry ||
                    !payment.otp) {
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
            validateAddress(updatedUser) {
                if (!updatedUser.Address ||
                    !updatedUser.City ||
                    !updatedUser.Pincode ||
                    !updatedUser.MobileNo) {
                    alert("Please fill in all address and contact details.");
                    return false;
                }
                return true;
            }
            handlePayment() {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (this.cartItems.length === 0) {
                    alert("Cart is empty.");
                    return;
                }
                if (!this.user)
                    return;
                const updatedUser = {
                    UserID: this.user.UserID,
                    Address: (_a = $("#address").val()) === null || _a === void 0 ? void 0 : _a.toString().trim(),
                    City: (_b = $("#city").val()) === null || _b === void 0 ? void 0 : _b.toString().trim(),
                    Pincode: (_c = $("#pincode").val()) === null || _c === void 0 ? void 0 : _c.toString().trim(),
                    MobileNo: (_d = $("#contact").val()) === null || _d === void 0 ? void 0 : _d.toString().trim(),
                };
                if (!this.validateAddress(updatedUser))
                    return;
                const payment = {
                    CardNumber: ((_e = $('#cardnumber').val()) === null || _e === void 0 ? void 0 : _e.toString()) || "",
                    Cvv: ((_f = $('#cvv').val()) === null || _f === void 0 ? void 0 : _f.toString()) || "",
                    CardExpiry: ((_g = $('#cardexpiry').val()) === null || _g === void 0 ? void 0 : _g.toString()) || "",
                    otp: ((_h = $('#otp').val()) === null || _h === void 0 ? void 0 : _h.toString()) || ""
                };
                if (!this.validatePayment(payment))
                    return;
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
            processBillCreation() {
                if (!this.user)
                    return;
                const billDto = {
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
                    success: (response) => this.updateStockAndClearCart(response.Order),
                    error: () => alert("Payment failed. Please try again."),
                });
            }
            updateStockAndClearCart(orderId) {
                if (!this.user)
                    return;
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
            clearCart(orderId) {
                if (!this.user)
                    return;
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
            logout() {
                if (confirm("Are you sure you want to logout?")) {
                    sessionStorage.removeItem("loggedInUser");
                    window.location.href = "index.html";
                }
            }
        }
        UserDetails.PaymentOrder = PaymentOrder;
    })(UserDetails = Demo.UserDetails || (Demo.UserDetails = {}));
})(Demo || (Demo = {}));
$(() => {
    new Demo.UserDetails.PaymentOrder();
});
