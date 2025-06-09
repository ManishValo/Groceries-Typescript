namespace Demo {
    export namespace AdminBillDetails {
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
                    type: "GET",
                    success: (data: any[]) => {
                        let rows = "";
                        data.forEach((bill: any) => {
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

    //         searchBill(): void {
    //             const orderId = Number($("#searchOrderId").val());

    //             if (!orderId) {
    //                 alert("Please enter a valid Order ID.");
    //                 return;
    //             }

    //             $.ajax({
    //                 url: `${this.BASE_URL}/${orderId}`,
    //                 type: "GET",
    //                 success: (bill: any) => {
    //                     let row = `
    //     <tr>
    //       <td>${bill.OrderID}</td>
    //       <td>${bill.UserID}</td>
    //       <td>${bill.CustomerName}</td>
    //       <td>${bill.OrderDate?.split("T")[0]}</td>
    //       <td>${bill.OrderAmt}</td>
    //       <td>
    //         <button class="btn btn-sm btn-info" onclick="billManager.viewBill(${bill.OrderID})">View</button>
    //       </td>
    //     </tr>
    //   `;
    //                     $("#billTable tbody").html(row);
    //                 },
    //                 error: (xhr) => {
    //                     alert("Order not found or error fetching data.");
    //                     $("#billTable tbody").html(""); // Clear previous results
    //                 }
    //             });
    //         }



        }

        // Global instance to allow access from onclick="..."
        (window as any).billManager = new BillManager();
    }
}
