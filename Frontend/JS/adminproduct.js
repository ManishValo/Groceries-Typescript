"use strict";
var Demo;
(function (Demo) {
    let Admin;
    (function (Admin) {
        class Adminproduct {
            constructor() {
                this.Base_url = "http://localhost:58731/api";
                this.loadProducts();
                this.loadCategories();
            }
            loadProducts() {
                $.ajax({
                    url: `${this.Base_url}/products`,
                    type: "GET",
                    success: (data) => {
                        let rows = "";
                        data.forEach((p) => {
                            rows += `<tr>
                <td>${p.ProductID}</td>
                <td>${p.ProductName}</td>
                <td><img src="Images/${p.ProductImg}" class="thumb"/></td>
                <td>${p.ProductPrice}</td>
                <td>${p.ProductQuantity}</td>
                <td>${p.ProductDescription}</td>
                <td>${p.ProductCatID}</td>
                <td>
                  <button class='btn btn-warning btn-sm' onclick='showEditForm(${JSON.stringify(p)})'>Edit</button>
                  <button class='btn btn-danger btn-sm' onclick='deleteProduct(${p.ProductID})'>Delete</button>
                </td>
              </tr>`;
                        });
                        $("#ProductTable tbody").html(rows);
                    },
                    error: () => {
                        alert("Error loading Products.");
                    }
                });
            }
            loadCategories() {
                $.ajax({
                    url: `${this.Base_url}/category`,
                    type: "GET",
                    success: (categories) => {
                        let options = `<option value=''>Select Category</option>`;
                        categories.forEach((c) => {
                            options += `<option value='${c.CategoryID}'>${c.CategoryName}</option>`;
                        });
                        $("#categorySelect").html(options);
                        $("#editCategorySelect").html(options);
                    },
                    error: () => {
                        alert("Error loading Categories");
                    }
                });
            }
            addProducts() {
                const ProductName = $("#ProductName").val().trim();
                let ProductImg = $("#ProductImg").val();
                ProductImg = ProductImg.split("\\").pop() || ProductImg.split("/").pop() || "";
                const ProductPrice = parseFloat($("#ProductPrice").val());
                const ProductQty = parseInt($("#ProductQty").val());
                const ProductDesc = $("#ProductDesc").val().trim();
                const ProductCatID = parseInt($("#categorySelect").val());
                if (!ProductName || !ProductImg || isNaN(ProductPrice) || isNaN(ProductQty) || !ProductDesc || isNaN(ProductCatID)) {
                    alert("Please fill all fields correctly");
                    return;
                }
                const Product = {
                    ProductName,
                    ProductImg,
                    ProductPrice,
                    ProductQuantity: ProductQty,
                    ProductDescription: ProductDesc,
                    ProductCatID
                };
                $.ajax({
                    url: `${this.Base_url}/products/add`,
                    type: "POST",
                    data: JSON.stringify(Product),
                    contentType: "application/json",
                    success: () => {
                        alert("Product added successfully.");
                        this.loadProducts();
                        $("#ProductName, #ProductImg, #ProductPrice, #ProductQty, #ProductDesc").val("");
                        $("#categorySelect").val("");
                    },
                    error: () => {
                        alert("Error adding product.");
                    }
                });
            }
            deleteProduct(id) {
                if (!confirm("Are you sure you want to delete this Product?"))
                    return;
                $.ajax({
                    url: `${this.Base_url}/products/delete/${id}`,
                    type: "DELETE",
                    success: () => {
                        alert("Product deleted.");
                        this.loadProducts();
                    },
                    error: () => {
                        alert("Delete failed.");
                    }
                });
            }
            showEditForm(Product) {
                $("#editProductId").val(Product.ProductID);
                $("#editProductName").val(Product.ProductName);
                $("#editProductImg").val("");
                $("#oldProductImgName").val(Product.ProductImg);
                $("#editProductPrice").val(Product.ProductPrice);
                $("#editProductQty").val(Product.ProductQuantity);
                $("#editProductDesc").val(Product.ProductDescription);
                $("#editCategorySelect").val(Product.ProductCatID);
                $("#editProductModal").modal("show");
            }
            updateProduct() {
                let ProductImg = $("#editProductImg").val();
                ProductImg = ProductImg.split("\\").pop() || ProductImg.split("/").pop() || $("#oldProductImgName").val();
                const Product = {
                    ProductID: parseInt($("#editProductId").val()),
                    ProductName: $("#editProductName").val(),
                    ProductImg: ProductImg,
                    ProductPrice: parseFloat($("#editProductPrice").val()),
                    ProductQuantity: parseInt($("#editProductQty").val()),
                    ProductDescription: $("#editProductDesc").val(),
                    ProductCatID: parseInt($("#editCategorySelect").val())
                };
                $.ajax({
                    url: `${this.Base_url}/products/update`,
                    type: "PUT",
                    data: JSON.stringify(Product),
                    contentType: "application/json",
                    success: () => {
                        alert("Product updated.");
                        $("#editProductModal").modal("hide");
                        this.loadProducts();
                    },
                    error: () => {
                        alert("Update failed.");
                    }
                });
            }
        }
        Admin.Adminproduct = Adminproduct;
    })(Admin = Demo.Admin || (Demo.Admin = {}));
})(Demo || (Demo = {}));
// Create instance and expose to global scope
const admin = new Demo.Admin.Adminproduct();
window.addProduct = () => admin.addProducts();
window.updateProduct = () => admin.updateProduct();
window.deleteProduct = (id) => admin.deleteProduct(id);
window.showEditForm = (p) => admin.showEditForm(p);
