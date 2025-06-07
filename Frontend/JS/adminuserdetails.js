"use strict";
var Demo;
(function (Demo) {
    let UserDetails;
    (function (UserDetails) {
        class AdminUserDetails {
            constructor() {
                this.BASE_Url = "http://localhost:58731/api/user";
                $(() => {
                    this.loadUsers();
                });
            }
            loadUsers() {
                $.ajax({
                    url: `${this.BASE_Url}/get-all`,
                    type: "GET",
                    success: (data) => {
                        const rows = data.map((user) => `
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
                        $('#userTable').on("click", "button[data-user]", (e) => {
                            const userJSOn = $(e.currentTarget).attr("data-user");
                            if (userJSOn) {
                                const user = JSON.parse(userJSOn);
                                Demo.UserDetails.AdminUserDetails.viewUser(user);
                            }
                        });
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
            static viewUser(user) {
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
        UserDetails.AdminUserDetails = AdminUserDetails;
    })(UserDetails = Demo.UserDetails || (Demo.UserDetails = {}));
})(Demo || (Demo = {}));
// Initialize the class
new Demo.UserDetails.AdminUserDetails();
window.goBack = () => admin.goBack();
window.logout = () => admin.logout();
