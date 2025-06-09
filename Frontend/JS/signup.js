import { helper } from "./helper";
var Demo;
(function (Demo) {
    let Typescript;
    (function (Typescript) {
        let help = new helper.Helper();
        class SignupHandler {
            constructor() {
                $(() => {
                    $('#signup-form').on("submit", (e) => {
                        e.preventDefault();
                        const fullName = $('#full-name').val().trim();
                        const email = $('#email').val().trim();
                        const password = $('#password').val().trim();
                        const confirmPassword = $('#confirm-password').val().trim();
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
                                }
                                else {
                                    alert("Signup failed.");
                                }
                            }
                        });
                    });
                });
            }
        }
        Typescript.SignupHandler = SignupHandler;
    })(Typescript = Demo.Typescript || (Demo.Typescript = {}));
})(Demo || (Demo = {}));
// Start signup logic
new Demo.Typescript.SignupHandler();
