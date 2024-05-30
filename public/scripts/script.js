// Επιλέγουμε τα στοιχεία από το DOM
const container = document.querySelector(".container"), // Επιλέγει το container
      pwShowHide = document.querySelectorAll(".showHidePw"), // Επιλέγει όλα τα στοιχεία που δείχνουν/κρύβουν τον κωδικό
      pwFields = document.querySelectorAll(".password"), // Επιλέγει όλα τα πεδία κωδικού
      signUp = document.querySelector(".signup-link"), // Επιλέγει το link για την εγγραφή
      login = document.querySelector(".login-link"); // Επιλέγει το link για τη σύνδεση

// Κώδικας για να δείξουμε/κρύψουμε τον κωδικό και να αλλάξουμε το εικονίδιο
pwShowHide.forEach(eyeIcon => {
    eyeIcon.addEventListener("click", () => {
        pwFields.forEach(pwField => {
            if (pwField.type === "password") {
                // Αν ο τύπος του πεδίου είναι "password", τον αλλάζουμε σε "text"
                pwField.type = "text";
                // Αλλάζουμε όλα τα εικονίδια από "uil-eye-slash" σε "uil-eye"
                pwShowHide.forEach(icon => {
                    icon.classList.replace("uil-eye-slash", "uil-eye");
                });
            } else {
                // Αν ο τύπος του πεδίου είναι "text", τον αλλάζουμε σε "password"
                pwField.type = "password";
                // Αλλάζουμε όλα τα εικονίδια από "uil-eye" σε "uil-eye-slash"
                pwShowHide.forEach(icon => {
                    icon.classList.replace("uil-eye", "uil-eye-slash");
                });
            }
        });
    });
});

// Κώδικας για την εμφάνιση της φόρμας εγγραφής και σύνδεσης
signUp.addEventListener("click", (event) => {
    event.preventDefault(); // Αποτρέπουμε την προεπιλεγμένη συμπεριφορά του link
    container.classList.add("active"); // Προσθέτουμε την κλάση "active" στο container
});

login.addEventListener("click", (event) => {
    event.preventDefault(); // Αποτρέπουμε την προεπιλεγμένη συμπεριφορά του link
    container.classList.remove("active"); // Αφαιρούμε την κλάση "active" από το container
});
