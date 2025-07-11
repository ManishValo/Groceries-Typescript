"use strict";
var Demo;
(function (Demo) {
    let AdminBillDetails;
    (function (AdminBillDetails) {
        class BillManager {
            constructor() {
                this.BASE_URL = "http://localhost:58731/api/bill";
                $(() => {
                    this.loadBills();
                });
            }
            loadBills() {
                $.ajax({
                    url: this.BASE_URL,
                    type: "GET",
                    success: (data) => {
                        let rows = "";
                        data.forEach((bill) => {
                            rows += `
                                <tr>
                                    <td>${bill.OrderID}</td>
                                    <td>${bill.CustomerName}</td>
                                    <td>${bill.OrderDate.split("T")[0]}</td>
                                    <td>${bill.OrderAmt}</td>
                                    <td>
                                        <button class="btn btn-sm btn-info" onclick="billManager.viewBill(${bill.OrderID})">View</button>
                                    </td>
                                </tr>
                            `;
                        });
                        $("#billTable tbody").html(rows);
                    },
                    error: () => {
                        alert("Error loading bill data.");
                    }
                });
            }
            viewBill(OrderID) {
                let totalAmount = 0;
                $.ajax({
                    url: `${this.BASE_URL}/details/${OrderID}`,
                    method: "GET",
                    success: (details) => {
                        let rows = "";
                        details.forEach((item) => {
                            totalAmount += item.TotalPrice;
                            rows += `
                                <tr>
                                    <td>${item.ProductName}</td>
                                    <td>${item.Quantity}</td>
                                    <td>${item.UnitPrice}</td>
                                    <td>${item.TotalPrice}</td>
                                </tr>
                            `;
                        });
                        rows += `
                            <tr class="table-secondary fw-bold">
                                <td colspan="3" class="text-end">Total Amount:</td>
                                <td>₹${totalAmount}</td>
                            </tr>
                        `;
                        $("#billDetailBody").html(rows);
                        $("#viewBillModal").modal("show");
                    },
                    error: () => {
                        alert("Unable to fetch bill details.");
                    }
                });
            }
        }
        AdminBillDetails.BillManager = BillManager;
        // Global instance to allow access from onclick="..."
        window.billManager = new BillManager();
    })(AdminBillDetails = Demo.AdminBillDetails || (Demo.AdminBillDetails = {}));
})(Demo || (Demo = {}));
