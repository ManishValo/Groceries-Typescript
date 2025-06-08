"use strict";
var Demo;
(function (Demo) {
    let BillDetailsPage;
    (function (BillDetailsPage) {
        class BillPage {
            constructor() {
                this.apiBaseUrl = "http://localhost:58731/api";
                this.user = null;
                this.billId = null;
                this.grandTotal = 0;
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
                this.displayUserName();
                this.loadBillIdFromUrl();
                if (!this.billId) {
                    alert("Invalid or missing bill ID.");
                    window.location.href = "index.html";
                    return;
                }
                this.fetchBillDetails();
                this.bindLogout();
            }
            loadUserFromSession() {
                const userJson = sessionStorage.getItem("loggedInUser");
                this.user = userJson ? JSON.parse(userJson) : null;
            }
            displayUserName() {
                if (this.user) {
                    $("#user-info").text(`Welcome, ${this.user.name}`);
                }
            }
            loadBillIdFromUrl() {
                const urlParams = new URLSearchParams(window.location.search);
                this.billId = urlParams.get("billId");
            }
            fetchBillDetails() {
                if (!this.billId)
                    return;
                $.ajax({
                    url: `${this.apiBaseUrl}/bill/details/${this.billId}`,
                    type: "GET",
                    success: (data) => this.renderBillItems(data),
                    error: () => {
                        $("#bill-container").html("<p>Error loading bill details.</p>");
                    }
                });
            }
            renderBillItems(items) {
                if (!items || items.length === 0) {
                    $("#bill-items").html("<tr><td colspan='4'>No bill items found.</td></tr>");
                    return;
                }
                let rows = "";
                this.grandTotal = 0;
                items.forEach(item => {
                    rows += `
            <tr>
              <td>${item.ProductName}</td>
              <td>₹${item.UnitPrice}</td>
              <td>${item.Quantity}</td>
              <td>₹${item.TotalPrice}</td>
            </tr>
          `;
                    this.grandTotal += item.TotalPrice;
                });
                $("#bill-items").html(rows);
                $("#grand-total").text(`₹${this.grandTotal}`);
            }
            bindLogout() {
                $("#logout-btn").click(() => {
                    sessionStorage.clear();
                    window.location.href = "login.html";
                });
            }
        }
        BillDetailsPage.BillPage = BillPage;
    })(BillDetailsPage = Demo.BillDetailsPage || (Demo.BillDetailsPage = {}));
})(Demo || (Demo = {}));
// Instantiate the page logic once DOM is ready
$(() => {
    new Demo.BillDetailsPage.BillPage();
});
