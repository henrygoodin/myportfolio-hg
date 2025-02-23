"use strict";

document.addEventListener("DOMContentLoaded", function () {
    console.log("careers.js loaded");

    // Check if the form is in the DOM
    const form = document.getElementById("careersForm");
    console.log("Form element:", form); // Should NOT be null

    if (!form) {
        console.error("Error: careersForm not found in the DOM.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("Form submitted");

        const formStatus = document.getElementById("form-status");
        const formData = new FormData(event.target);
        const resumeFile = formData.get("resume");

        if (resumeFile && resumeFile.name && !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(resumeFile.type)) {
            formStatus.textContent = "Please upload a PDF, DOC, or DOCX file.";
            formStatus.style.color = "red";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/careers/submit", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                formStatus.textContent = "Application submitted successfully!";
                formStatus.style.color = "green";
                form.reset();
            } else {
                throw new Error("Submission failed.");
            }
        } catch (error) {
            formStatus.textContent = "An error occurred. Please try again.";
            formStatus.style.color = "red";
        }
    });

});

