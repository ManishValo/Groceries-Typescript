namespace Demo {
    export namespace Typescript {
        export class BillManager {
            BASE_URL: string = "http://localhost:58731/api/bill";

            constructor() {
                $(() => {
                    this.loadBills();
                });
            }

            loadBills(): void {
                $.ajax({
                    url: this.BASE_URL,
                    type    : "GET",
                    success: (data: any[]) => {
                        let rows = "";
                        data.forEach((bill: any) => {
                            rows += `
                                <tr>
                                    <td>${bill.OrderID}</td>
                                    <td>${bill.UserID}</td>
                                    <td>${bill.CustomerName}</td>
                                    <td>${bill.OrderAmt}</td>
                                    <td>
                                        <button class="btn btn-sm btn-info" onclick="Demo.Typescript.billManager.viewBill(${bill.OrderID})">View</button>
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

            viewBill(OrderID: number): void {
                let totalAmount = 0;

                $.ajax({
                    url: `${this.BASE_URL}/details/${OrderID}`,
                    method: "GET",
                    success: (details: any[]) => {
                        let rows = "";
                        details.forEach((item: any) => {
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

            goBack(): void {
                window.history.back();
            }

            logout(): void {
                alert("Logged out.");
                window.location.href = "index.html";
            }
        }

        // Global instance to allow access from onclick="..."
        export const billManager = new BillManager();
    }
}
