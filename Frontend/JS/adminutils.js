"use strict";
var Demo;
(function (Demo) {
    let Common;
    (function (Common) {
        class AdminUtils {
            static goBack() {
                window.history.back();
            }
            static logout() {
                alert("You have been logged out.");
                window.location.href = "index.html";
            }
        }
        Common.AdminUtils = AdminUtils;
    })(Common = Demo.Common || (Demo.Common = {}));
})(Demo || (Demo = {}));
// Attach to global window so it works with onclick in HTML
window.goBack = () => Demo.Common.AdminUtils.goBack();
window.logout = () => Demo.Common.AdminUtils.logout();
