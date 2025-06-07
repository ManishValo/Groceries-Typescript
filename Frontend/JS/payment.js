$(document).ready(function () {
  // Retrieve the logged-in user from sessionStorage
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  // Redirect to login page if user is not logged in
  if (!user || !user.UserID) {
    alert("User not logged in.");
    window.location.href = "login.html";
    return;
  }

  // Display user welcome message with logout option
  $("#user-text").html(`Welcome, ${user.name} &nbsp;|&nbsp; 
    <span id="logout-link" style="text-decoration: underline; cursor: pointer;">Logout</span>`);

  // Handle logout click event
  $(document).on("click", "#logout-link", function () {
    if (confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("loggedInUser"); // Clear session
      window.location.href = "index.html"; // Redirect to homepage
    }
  });

  // Populate user details in the form
  const userId = user.UserID;
  $("#full-name").val(user.name);
  $("#email").val(user.email);

  let cartItems = [];
  let totalAmount = 0;

  // Fetch user's cart items from backend
  $.ajax({
    url: `http://localhost:58731/api/cart/user/${userId}`,
    type: "GET",
    success: function (data) {
      cartItems = data;

      // If cart is empty, show message
      if (cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      // Calculate total cart amount
      totalAmount = 0;
      cartItems.forEach(item => {
        totalAmount += item.TotalPrice;
      });

      // Display total amount
      //$("#totalAmount").text(`Total: ₹${totalAmount}`);
    },
    error: function () {
      alert("Failed to load cart.");
    }
  });

  // Handle Pay button click
  $("#pay-btn").click(function () {
    // Prevent payment if cart is empty
    if (cartItems.length === 0) {
      alert("Cart is empty.");
      return;
    }

    // Capture address/contact form values
    const updatedUser = {
      UserID: userId,
      Address: $("#address").val().trim(),
      City: $("#city").val().trim(),
      Pincode: $("#pincode").val().trim(),
      MobileNo: $("#contact").val().trim()
    };

    // Validate address/contact form fields
    if (!updatedUser.Address || !updatedUser.City || !updatedUser.Pincode || !updatedUser.MobileNo) {
      alert("Please fill in all address and contact details.");
      return;
    }

    // Capture payment details
    const payment = {
      CardNumber: $('#cardnumber').val(),
      Cvv: $('#cvv').val(),
      CardExpiry: $('#cardexpiry').val(),
      otp: $('#otp').val()
    };

    // Validate payment details
    if (!payment.CardNumber || !payment.Cvv || !payment.CardExpiry || !payment.otp) {
      alert("Please fill in card details.");
      return;
    }
    if (payment.CardNumber.length != 16) {
      alert("Enter 16 digit card number");
      return;
    }
    if (payment.Cvv.length != 3) {
      alert("Enter correct CVV");
      return;
    }

    // Update user info in backend
    $.ajax({
      url: `http://localhost:58731/api/user/update-contact/${userId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(updatedUser),
      success: function () {
        // Prepare bill DTO (Data Transfer Object)
        const billDto = {
          UserID: parseInt(userId),
          BillAmt: totalAmount,
          Details: cartItems.map(item => ({
            ProductID: item.ProductID,
            Quantity: item.CartQty,
            UnitPrice: item.ProductPrice,
            TotalPrice: item.TotalPrice
          }))
        };

        // Create a new bill in the backend
        $.ajax({
          url: "http://localhost:58731/api/bill/add",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(billDto),
          success: function (response) {
            // Prepare data to update product stock
            const stockUpdateData = cartItems.map(item => ({
              ProductID: item.ProductID,
              Quantity: item.CartQty
            }));

            // Update product stock in backend
            $.ajax({
              url: "http://localhost:58731/api/products/update-stock",
              type: "POST",
              contentType: "application/json",
              data: JSON.stringify(stockUpdateData),
              success: function () {
                // Clear the user's cart after successful order
                $.ajax({
                  url: `http://localhost:58731/api/cart/clear/user/${userId}`,
                  type: "DELETE",
                  success: function () {
                    alert("Payment successful! Bill ID: " + response.Order);
                    sessionStorage.setItem("billId", response.Order); // Store bill ID in session
                    window.location.href = "/bill.html?billId=" + response.Order; // Redirect to bill summary
                  },
                  error: function () {
                    alert("Payment successful, but failed to clear cart.");
                  }
                });
              },
              error: function () {
                alert("Stock update failed");
              }
            });
          },
          error: function () {
            alert("Payment failed. Please try again.");
          }
        });
      },
      error: function () {
        alert("Failed to update user information.");
      }
    });
  });
});
