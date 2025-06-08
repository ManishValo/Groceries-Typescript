// adminproduct.ts

namespace Demo {
  export namespace Admin {
    export class Adminproduct {
      Base_url: string = "http://localhost:58731/api";

      constructor() {
        this.loadProducts();
        this.loadCategories();
      }

      loadProducts(): void {
        $.ajax({
          url: `${this.Base_url}/products`,
          type: "GET",
          success: (data: any[]) => {
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

      loadCategories(): void {
        $.ajax({
          url: `${this.Base_url}/category`,
          type: "GET",
          success: (categories: any[]) => {
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

      addProducts(): void {
        const ProductName = ($("#ProductName").val() as string).trim();
        let ProductImg = $("#ProductImg").val() as string;
        ProductImg = ProductImg.split("\\").pop() || ProductImg.split("/").pop() || "";
        const ProductPrice = parseFloat($("#ProductPrice").val() as string);
        const ProductQty = parseInt($("#ProductQty").val() as string);
        const ProductDesc = ($("#ProductDesc").val() as string).trim();
        const ProductCatID = parseInt($("#categorySelect").val() as string);

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

      deleteProduct(id: number): void {
        if (!confirm("Are you sure you want to delete this Product?")) return;

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

      showEditForm(Product: any): void {
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

      updateProduct(): void {
        let ProductImg = $("#editProductImg").val() as string;
        ProductImg = ProductImg.split("\\").pop() || ProductImg.split("/").pop() || $("#oldProductImgName").val() as string;

        const Product = {
          ProductID: parseInt($("#editProductId").val() as string),
          ProductName: $("#editProductName").val(),
          ProductImg: ProductImg,
          ProductPrice: parseFloat($("#editProductPrice").val() as string),
          ProductQuantity: parseInt($("#editProductQty").val() as string),
          ProductDescription: $("#editProductDesc").val(),
          ProductCatID: parseInt($("#editCategorySelect").val() as string)
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
  }
}

// Create instance and expose to global scope
const admin = new Demo.Admin.Adminproduct();
(window as any).addProduct = () => admin.addProducts();
(window as any).updateProduct = () => admin.updateProduct();
(window as any).deleteProduct = (id: number) => admin.deleteProduct(id);
(window as any).showEditForm = (p: any) => admin.showEditForm(p);