namespace Demo {
    export namespace UserDetails {
        export class AdminUserDetails {
            BASE_Url: string = "http://localhost:58731/api/user";

            constructor() {
                $(() => {
                    this.loadUsers();
                });
            }

            loadUsers(): void {
                $.ajax({
                    url: `${this.BASE_Url}/get-all`,
                    type: "GET",
                    success: (data: any[]) => {
                        const rows: string = data.map((user: any) => `
                            <tr>
                                <td>${user.UserID}</td>
                                <td>${user.Name}</td>
                                <td>${user.Email}</td>
                                <td>${user.TypeID == 1 ? "Admin" : "Customer"}</td>
                                <td>
                                    <button class="btn btn-sm btn-info me-1" data-user='${JSON.stringify(user)}'>View</button>
                                </td>
                            </tr>
                        `).join('');

                        $('#userTable tbody').html(rows);

                        $('#userTable').on("click","button[data-user]",(e)=>{
                            const userJSOn:string|undefined=$(e.currentTarget).attr("data-user")
                            if(userJSOn){
                                const user=JSON.parse(userJSOn);
                                Demo.UserDetails.AdminUserDetails.viewUser(user)
                            }
                        })

                        // Attach click event for all view buttons using delegation
                        // $('#userTable').off("click", "button[data-user]").on("click", "button[data-user]", function () {
                        //     const user = JSON.parse($(this).attr('data-user')!);
                        //     AdminUserDetails.viewUser(user);
                        // });
                    },
                    error: () => {
                        alert("Failed to load users.");
                    }
                });
            }

            // Static method to show modal with user info
            static viewUser(user: any): void {
                $('#viewUserID').text(user.UserID);
                $('#viewUserName').text(user.Name);
                $('#viewUserEmail').text(user.Email);
                $('#viewMobileNo').text(user.MobileNo || 'N/A');
                $('#viewType').text(user.TypeID == 1 ? 'Admin' : 'Customer');
                $('#viewAddress').text(user.Address || 'N/A');
                $('#viewCity').text(user.City || 'N/A');
                $('#viewPincode').text(user.Pincode || 'N/A');

                $('#viewUserModal').modal('show');
            }
        }
    }
}

// Initialize the class
new Demo.UserDetails.AdminUserDetails();
