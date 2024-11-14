<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the form data
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // Email configuration
    $to = "henrygoodin9@gmail.com"; // Your email address
    $from = "no-reply@yourdomain.com"; // Sender's email address
    $headers = "From: " . $from . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Email body content
    $body = "<h2>New Contact Message</h2>";
    $body .= "<p><strong>Name:</strong> " . $name . "</p>";
    $body .= "<p><strong>Email:</strong> " . $email . "</p>";
    $body .= "<p><strong>Subject:</strong> " . $subject . "</p>";
    $body .= "<p><strong>Message:</strong></p>";
    $body .= "<p>" . nl2br($message) . "</p>";

    // Send the email
    if (mail($to, $subject, $body, $headers)) {
        echo "success";  // Return success message
    } else {
        echo "error";    // Return error message if email fails to send
    }
} else {
    echo "Invalid Request";  // If the request is not a POST request
}
?>
