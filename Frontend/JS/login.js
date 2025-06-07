"use strict";
var Demo;
(function (Demo) {
    let Typescript;
    (function (Typescript) {
        class LoginHandler {
            constructor() {
                $(() => {
                    this.setupEventListeners();
                });
            }
            setupEventListeners() {
                $('#login-form').on("submit", (e) => this.handleLoginSubmit(e));
                $('#toggle-password').on("click", () => this.togglePasswordVisibility());
            }
            handleLoginSubmit(e) {
                e.preventDefault();
                const Email = $('#email').val().trim();
                const Password = $('#password').val().trim();
                if (!Email || !Password) {
                    $('#login-message').html('<span style="color:red">Both fields are required.</span>');
                    return;
                }
                $.ajax({
                    type: "POST",
                    url: "http://localhost:58731/api/user/login",
                    data: JSON.stringify({ Email, Password }),
                    contentType: "application/json",
                    success: (response) => {
                        if (response && response.TypeID === 1) {
                            window.location.href = "adminpanel.html";
                        }
                        else if (response && response.TypeID === 2) {
                            sessionStorage.setItem("loggedInUser", JSON.stringify(response));
                            window.location.href = "index.html";
                        }
                        else {
                            $('#login-message').html('<span style="color:red">Invalid login credentials.</span>');
                        }
                    },
                    error: (err) => {
                        if (err.status === 404) {
                            $('#login-message').html('<span style="color:red">Email or password incorrect.</span>');
                        }
                        else {
                            $('#login-message').html('<span style="color:red">Server error. Please try again later.</span>');
                            console.error(err);
                        }
                    }
                });
            }
            togglePasswordVisibility() {
                const passwordField = $('#password');
                const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
                passwordField.attr('type', type);
            }
        }
        Typescript.LoginHandler = LoginHandler;
    })(Typescript = Demo.Typescript || (Demo.Typescript = {}));
})(Demo || (Demo = {}));
// Initialize the login handler
new Demo.Typescript.LoginHandler();
