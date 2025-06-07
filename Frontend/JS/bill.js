// Ensure the DOM is fully loaded before running the script
$(document).ready(function () {
  // Retrieve the logged-in user from session storage
  const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  // If no user is found, redirect to login page
  if (!loggedInUser || !loggedInUser.UserID) {
    alert("User not logged in.");
    window.location.href = "login.html";
    return;
  }

  // Store user ID and display user name
  const userId = loggedInUser.UserID;
  const userName = loggedInUser.name || "";
  $("#user-info").text(`Welcome, ${userName}`);

  // Extract the 'billId' from the URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const billId = urlParams.get("billId");

  // If no billId is found in the URL, redirect to home page
  if (!billId) {
    alert("Invalid or missing bill ID.");
    window.location.href = "index.html";
    return;
  }

  // Initialize grand total
  let grandTotal = 0;

  // Make an AJAX GET request to fetch bill details based on billId
  $.ajax({
    url: `http://localhost:58731/api/bill/details/${billId}`,
    type: "GET",
    success: function (data) {
      // If no data is returned, show a message
      if (data.length === 0) {
        $("#bill-items").html("<tr><td colspan='4'>No bill items found.</td></tr>");
        return;
      }

      // Construct rows of bill items
      let rows = "";
      data.forEach(item => {
        rows += `
          <tr>
            <td>${item.ProductName}</td>
            <td>₹${item.UnitPrice}</td>
            <td>${item.Quantity}</td>
            <td>₹${item.TotalPrice}</td>
          </tr>
        `;
        // Add item's total price to grand total
        grandTotal += item.TotalPrice;
      });

      // Inject rows into the table and display the grand total
      $("#bill-items").html(rows);
      $("#grand-total").text(`₹${grandTotal}`);
    },
    error: function () {
      // Show an error message if the AJAX call fails
      $("#bill-container").html("<p>Error loading bill details.</p>");
    }
  });

  // Handle logout button click
  $("#logout-btn").click(function () {
    // Clear session storage and redirect to login page
    sessionStorage.clear();
    window.location.href = "login.html";
  });
});
