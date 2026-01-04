

AOS.init();
// start of swiper
const swiper = new Swiper(".mySwiper", {
    slidesPerView: 2,
    spaceBetween: 20,
    loop: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    breakpoints: {
        576: {
            slidesPerView: 2,
        },
        768: {
            slidesPerView: 3,
        },
        992: {
            slidesPerView: 6,
        },
    },
});
// swiper ends


// AOS.init();
// // start of swiper
// const swipers = new Swiper(".myProjectSwiper", {
//     slidesPerView: 2,
//     spaceBetween: 20,
//     loop: true,
//     autoplay: {
//         delay: 3000,
//         disableOnInteraction: false,
//     },
//     breakpoints: {
//         576: {
//             slidesPerView: 2,
//         },
//         768: {
//             slidesPerView: 2,
//         },
//         992: {
//             slidesPerView: 2,
//         },
//     },
// });
// // swiper ends

// Initialize EmailJS with your public key

(function () {
    emailjs.init("bzJVVJmL6iMCn4DI_"); // 🔁 Replace with your actual public key
})();

// Get all forms
const allForms = document.querySelectorAll(".contact-form");

allForms.forEach(form => {
    const alertBox = form.nextElementSibling; // assumes alert div is right before form

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        emailjs.sendForm("service_9rtg065", "template_3ows1ze", form)
            .then(() => {
                showAlert(alertBox, "✅ Received successfully! We will reach out to you within 24hrs", "success");
                form.reset();
            })
            .catch((error) => {
                console.error("❌ Error sending form:", error);
                showAlert(alertBox, "❌ Failed to send message.", "danger");
            });
    });
});

// Bootstrap alert handler
function showAlert(alertEl, message, type = "success") {
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    alertEl.classList.remove("d-none");
    alertEl.style.marginTop = "1em";

    setTimeout(() => {
        alertEl.classList.add("d-none");
    }, 5000);
}
// end form submit 

