namespace Demo {
    export namespace Typescript {
        export class AdminCategory {
            apiUrl: string = "http://localhost:58731/api/category";

            constructor() {
                $(() => {
                    this.loadCategories();
                });

                // Add category
                $('#categoryForm').on('submit', (e: any) => {
                    e.preventDefault();
                    const name = ($('#categoryName').val() as string).trim();
                    if (name === "") return;

                    $.ajax({
                        url: this.apiUrl + "/add",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({ CategoryName: name }),
                        success: (res: string) => {
                            alert(res);
                            $('#categoryName').val("");
                            this.loadCategories();
                        },
                        error: (err: any) => {
                            alert("Failed to add category\n" + err.responseText);
                        }
                    });
                });

                // Delegated update and delete button handlers
                $(document).on("click", ".update-btn", (e) => {
                    const id = $(e.currentTarget).data("id");
                    this.updateCategory(id);
                });

                $(document).on("click", ".delete-btn", (e) => {
                    const id = $(e.currentTarget).data("id");
                    this.deleteCategory(id);
                });
            }

            loadCategories() {
                $.ajax({
                    url: this.apiUrl,
                    type: "GET",
                    success: (data: any[]) => {
                        const tbody = $('#categoryTable tbody').empty();
                        data.forEach(cat => {
                            tbody.append(`
                                <tr>
                                    <td>${cat.CategoryID}</td>
                                    <td><input type="text" class="form-control" value="${cat.CategoryName}" id="cat-${cat.CategoryID}"/></td>
                                    <td>
                                        <button class="btn btn-sm btn-primary update-btn" data-id="${cat.CategoryID}">Update</button>
                                        <button class="btn btn-sm btn-danger delete-btn" data-id="${cat.CategoryID}">Delete</button>
                                    </td>
                                </tr>
                            `);
                        });
                    },
                    error: () => {
                        alert("Error loading categories");
                    }
                });
            }

            updateCategory(id: number): void {
                const updateName = ($(`#cat-${id}`).val() as string).trim();
                if (updateName === "") {
                    alert("Category name cannot be empty");
                    return;
                }

                $.ajax({
                    url: this.apiUrl + "/update",
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({ CategoryID: id, CategoryName: updateName }),
                    success: (res: string) => {
                        alert(res);
                        this.loadCategories();
                    },
                    error: (err: any) => {
                        alert("Failed to update category\n" + err.responseText);
                    }
                });
            }

            deleteCategory(id: number): void {
                if (!confirm("Are you sure you want to delete this category?")) return;

                $.ajax({
                    url: `${this.apiUrl}/delete/${id}`,
                    type: "DELETE",
                    success: (res: string) => {
                        alert(res);
                        this.loadCategories();
                    },
                    error: (err: any) => {
                        alert("Failed to delete category\n" + err.responseText);
                    }
                });
            }

             goBack() {
                window.history.back();
            }

            logout() {
                alert("You have been logged out.");
                window.location.href = "index.html";
            }
        }
    }
}

const admin=new Demo.Typescript.AdminCategory();
(window as any).goBack = () => admin.goBack();
(window as any).logout = () => admin.logout();