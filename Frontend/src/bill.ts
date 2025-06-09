import { User } from "./model";

namespace Demo {
  export namespace BillDetailsPage {

    interface BillItem {
      ProductName: string;
      UnitPrice: number;
      Quantity: number;
      TotalPrice: number;
    }

    // interface LoggedInUser {
    //   UserID: number;
    //   name: string;
    // }

     export class BillPage {
      private apiBaseUrl = "http://localhost:58731/api";
      private user: User | null = null;
      private billId: string | null = null;
      private grandTotal: number = 0;

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

      private loadUserFromSession(): void {
        const userJson = sessionStorage.getItem("loggedInUser");
        this.user = userJson ? JSON.parse(userJson) as User : null;
      }

      private displayUserName(): void {
        if (this.user) {
          $("#user-info").text(`Welcome, ${this.user.name}`);
        }
      }

      private loadBillIdFromUrl(): void {
        const urlParams = new URLSearchParams(window.location.search);
        this.billId = urlParams.get("billId");
      }

      private fetchBillDetails(): void {
        if (!this.billId) return;

        $.ajax({
          url: `${this.apiBaseUrl}/bill/details/${this.billId}`,
          type: "GET",
          success: (data: BillItem[]) => this.renderBillItems(data),
          error: () => {
            $("#bill-container").html("<p>Error loading bill details.</p>");
          }
        });
      }

      private renderBillItems(items: BillItem[]): void {
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

      private bindLogout(): void {
        $("#logout-btn").click(() => {
          sessionStorage.clear();
          window.location.href = "login.html";
        });
      }
    }
  }
}

$(() => {
      new Demo.BillDetailsPage.BillPage();
    });
