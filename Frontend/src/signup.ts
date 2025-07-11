import {helper} from "./helper"
namespace Demo {
    export namespace Typescript {
        let help=new helper.Helper()
        export class SignupHandler {
            
            constructor() {
                $(() => {
                    $('#signup-form').on("submit", (e: JQuery.Event) => {
                        e.preventDefault();

                        const fullName = ($('#full-name').val() as string).trim();
                        const email = ($('#email').val() as string).trim();
                        const password = ($('#password').val() as string).trim();
                        const confirmPassword = ($('#confirm-password').val() as string).trim();

                        if (!help.isValid(fullName) || !help.isValid(email) || !help.isValid(password) || !help.isValid(confirmPassword)) {
                            alert("All fields are required.");
                            return;
                        }

                        if (password !== confirmPassword) {
                            alert("Passwords do not match.");
                            return;
                        }

                        const userData = {
                            Name: fullName,
                            Email: email,
                            Password: password,
                            TypeId: 2,
                            Address: null,
                            City: null,
                            Pincode: null,
                            MobileNo: null
                        };

                        $.ajax({
                            url: 'http://localhost:58731/api/user/register',
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(userData),
                            success: function () {
                                alert("Signup successful! Please log in.");
                                window.location.href = "login.html";
                            },
                            error: function (xhr) {
                                if (xhr.responseText) {
                                    alert("Signup failed: " + xhr.responseText);
                                } else {
                                    alert("Signup failed.");
                                }
                            }
                        });
                    });
                });
            }

            // isValid(attribute: any): boolean {
            //     let isValid = false;
            //     try {
            //         if (
            //             attribute !== null &&
            //             attribute !== undefined &&
            //             attribute !== "undefined" &&
            //             attribute !== "null" &&
            //             attribute !== ""
            //         ) {
            //             isValid = true;
            //         }
            //     } catch (ex: any) {
            //         this.throwError(ex.message);
            //     }
            //     return isValid;
            // }

            // throwError(error: any): void {
            //     try {
            //         const errorMessage = "Error: " + (error.description || error.message);
            //         alert(errorMessage);
            //     } catch (ex: any) {
            //         alert("Error: " + (ex.description || ex.message));
            //     }
            // }
        }
    }
}

// Start signup logic
new Demo.Typescript.SignupHandler();
