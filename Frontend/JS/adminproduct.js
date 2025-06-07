"use strict";
var Demo;
(function (Demo) {
    let Admin;
    (function (Admin) {
        class Adminproduct {
            constructor() {
                this.Base_url = "http://localhost:58731/api/category";
                () => {
                    this.loadProducts();
                };
            }
            loadProducts() {
            }
        }
        Admin.Adminproduct = Adminproduct;
    })(Admin = Demo.Admin || (Demo.Admin = {}));
})(Demo || (Demo = {}));
