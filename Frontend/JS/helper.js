export var helper;
(function (helper) {
    class Helper {
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
    helper.Helper = Helper;
})(helper || (helper = {}));
