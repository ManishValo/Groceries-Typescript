"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Demo;
(function (Demo) {
    let Admin;
    (function (Admin) {
        class Adminproduct {
            constructor() {
                this.Base_url = "http://localhost:58731/api";
                () => {
                    this.loadProducts();
                };
            }
            loadProducts() {
                $.ajax({
                    url: `${this.Base_url}/products`,
                    type: "GET",
                    success: (data) => {
                        let rows = "";
                        data.forEach((product) => {
                            rows += `<tr>
                        <td>${product.ProductID}</td>
                        <td>${product.ProductName}</td>
                        <td><img src="Images/${product.ProductImg}" class="thumb"/></td>
                        <td>${product.ProductPrice}</td>
                        <td>${product.ProductQuantity}</td>
                        <td>${product.ProductDescription}</td>
                        <td>${product.ProductCatID}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick='showEditForm(${JSON.stringify(product)})'>Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.ProductID})">Delete</button>
                        </td>
                     </tr>`;
                        });
                    }
                });
            }
        }
        Admin.Adminproduct = Adminproduct;
    })(Admin = Demo.Admin || (Demo.Admin = {}));
})(Demo || (Demo = {}));
