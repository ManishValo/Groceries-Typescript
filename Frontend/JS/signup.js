"use strict";
var Demo;
(function (Demo) {
    let Typescript;
    (function (Typescript) {
        class SignupHandler {
            constructor() {
                $(() => {
                    $('#signup-form').on("submit", (e) => {
                        e.preventDefault();
                        const fullName = $('#full-name').val().trim();
                        const email = $('#email').val().trim();
                        const password = $('#password').val().trim();
                        const confirmPassword = $('#confirm-password').val().trim();
                        if (!this.isValid(fullName) || !this.isValid(email) || !this.isValid(password) || !this.isValid(confirmPassword)) {
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
                                }
                                else {
                                    alert("Signup failed.");
                                }
                            }
                        });
                    });
                });
            }
            isValid(attribute) {
                let isValid = false;
                try {
                    if (attribute !== null &&
                        attribute !== undefined &&
                        attribute !== "undefined" &&
                        attribute !== "null" &&
                        attribute !== "") {
                        isValid = true;
                    }
                }
                catch (ex) {
                    this.throwError(ex.message);
                }
                return isValid;
            }
            throwError(error) {
                try {
                    const errorMessage = "Error: " + (error.description || error.message);
                    alert(errorMessage);
                }
                catch (ex) {
                    alert("Error: " + (ex.description || ex.message));
                }
            }
        }
        Typescript.SignupHandler = SignupHandler;
    })(Typescript = Demo.Typescript || (Demo.Typescript = {}));
})(Demo || (Demo = {}));
// Start signup logic
new Demo.Typescript.SignupHandler();
