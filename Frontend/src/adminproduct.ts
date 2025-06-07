import { ajax, data } from "jquery";

namespace Demo {
    export namespace Admin {
        export class Adminproduct {
            Base_url: string = "http://localhost:58731/api"
            constructor() {
                () => {
                    this.loadProducts();
                }
            }

            loadProducts(): void {
                $.ajax({
                    url: `${this.Base_url}/products`,
                    type: "GET",
                    success: (data: any[])=>{
                        let rows: string = "";
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
                     </tr>`
                        })
                    }
                })
            }

            
        }
    }
}