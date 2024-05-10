const concernQuickView = {
  init() {
    this.closeBtnId = "#concern-quickview-close-btn";
    this.quickviewTriggerClass = ".concern-quickview-trigger-btn";
    this.quickviewWrapperClass = ".concern-quickview-wrapper";
    this.$concernShin = $("#concern-quickview-shin");

    this.progressBarWrapperClass = ".progress-bar-wrapper";
    this.

    this.bindEventListeners();
  },
  bindEventListeners() {
    const $body = $("body");

    $body.on("click", "#concern-quickview-shin", () => this.hideQuickview());

    $body.on("click", this.closeBtnId, () => this.hideQuickview());
    $body.on("click", this.quickviewTriggerClass, (e) =>
      this.showQuickview(e.currentTarget)
    );
  },

  showQuickview(clickedBtn) {
    this.$concernShin.show();
    const $btn = $(clickedBtn);

    const concernIndex = $btn.attr("data-concern-index");

    const $quickviewWrapper = $(
      `${this.quickviewWrapperClass}[data-concern-index=${concernIndex}]`
    );
    // $quickviewWrapper.show();
    $quickviewWrapper.removeClass("hide-concern-quickview");
    $quickviewWrapper.addClass("show-concern-quickview");
  },

  hideQuickview() {
    this.$concernShin.hide();

    const $quickviewWrapper = $(this.quickviewWrapperClass);

    $quickviewWrapper.removeClass("show-concern-quickview");
    $quickviewWrapper.addClass("hide-concern-quickview");
  },
};
