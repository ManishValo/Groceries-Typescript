namespace Demo {
    export namespace Common {
        export class AdminUtils {
            static goBack(): void {
                window.history.back();
            }

            static logout(): void {
                alert("You have been logged out.");
                window.location.href = "index.html";
            }
        }
    }
}

// Attach to global window so it works with onclick in HTML
(window as any).goBack = () => Demo.Common.AdminUtils.goBack();
(window as any).logout = () => Demo.Common.AdminUtils.logout();
