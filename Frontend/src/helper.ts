export namespace helper{
    export class Helper{
        isValid(attribute: any): boolean {
                let isValid = false;
                try {
                    if (
                        attribute !== null &&
                        attribute !== undefined &&
                        attribute !== "undefined" &&
                        attribute !== "null" &&
                        attribute !== ""
                    ) {
                        isValid = true;
                    }
                } catch (ex: any) {
                    this.throwError(ex.message);
                }
                return isValid;
            }

            throwError(error: any): void {
                try {
                    const errorMessage = "Error: " + (error.description || error.message);
                    alert(errorMessage);
                } catch (ex: any) {
                    alert("Error: " + (ex.description || ex.message));
                }
            }
    }
}