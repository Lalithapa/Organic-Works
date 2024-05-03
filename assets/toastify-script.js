const toastifyScript = {
  init() {
    console.log("toast init");
    this.toastStyleClass = "toastify-styling";
    this.toastDuration = 3000;
    this.style = {};
  },

  showToast(message, type = "success") {
      Toastify({
        text: message,
        duration: this.toastDuration,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        className: this.toastStyleClass,
        style: this.style,
        onClick: function () {}, // Callback after click
      }).showToast();
  },
};
