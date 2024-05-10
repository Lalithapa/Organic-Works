const quickview = {
  init() {
    if (!this.cacheDomElements()) {
      return {
        status: "failure",
        error: new Error("Required DOM elements not found."),
      };
    }

    this.bindEvents();
    return { status: "success" };
  },

  cacheDomElements() {
    // section
    this.sectionId = `#${$(".quickview-section").attr("id")}`;
    this.sectionName = "quick-view";

    // for event bubbling
    this.$mainContent = $("#MainContent");

    // main-wrapper (for d-none, d-block)
    this.$quickViewWrapper = $("#quickview-wrapper");
    this.$shin = $("#quickview-shin");
    this.$spinner = $("#quickview-spinner-wrapper");
    this.closeBtnId = "#quickview-close-btn";
    // for replacing the old content by new content
    this.contentWrapperId = "#quickview-content-wrapper";

    // show quickview (product-card-btn)
    this.triggerBtnClass = ".quickview-trigger-btn";
    // to hide add to cart in qv for combos
    this.$triggerBtn = undefined;

    this.progressBarWrapperClass = ".progress-bar-wrapper";
    this.progressBarClass = ".progress-bar";

    // if (
    //   !this.$quickViewWrapper.length ||
    //   !this.$triggerBtns.length ||
    //   !this.$closeBtn.length ||
    //   !this.$shin.length ||
    //   !this.$spinner.length
    // ) {
    //   return false;
    // }
    return true;
  },

  bindEvents() {
    const $body = $("body");

    // this.$quickViewWrapper.on("click", ".wishlist-btn", (e) =>
    //   this.handleWishlistClick(e.currentTarget),
    // );

    $body.on("click", this.triggerBtnClass, (e) => {
      e.preventDefault();
      this.$triggerBtn = $(e.currentTarget);
      this.handleQuickViewOpen(e.currentTarget);
    });

    $body.on("click", this.closeBtnId, () => this.hideQuickView());
  },

  async handleQuickViewOpen(clickedBtn) {
    this.showQuickView();
    this.showSpinner();

    const $clickedBtn = $(clickedBtn);
    const productHandle = $clickedBtn.attr("data-product-handle");
    const firstVariantId = $clickedBtn.attr("data-first-variant-id");

    if (!productHandle && !firstVariantId)
      return {
        status: "error",
        message: "product handle & variant id not found on trigger button",
        error: new Error(
          "product handle & variant id not found on trigger button"
        ),
      };

    const sectionUrl = `/products/${productHandle}?variant=${firstVariantId}&sections=${this.sectionName}`;

    try {
      const sectionResponse = await this.getQuickviewSection(sectionUrl);
      this.updateQuickview(sectionResponse[this.sectionName]);
      wishlistScript.updateAll();
    } catch (error) {
      return {
        status: "error",
        message: "Error while fetching product for quickview",
        error: new Error(
          `Error while fetching product for quickview ${error.message}`
        ),
      };
    } finally {
      this.hideSpinner();
    }

    return {
      status: "success",
    };
  },

  async getQuickviewSection(sectionUrl) {
    try {
      const response = await axios.get(sectionUrl);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateQuickview(html) {
    const $newContentWrapper = $(html).find(this.contentWrapperId);

    this.$quickViewWrapper
      .find(this.contentWrapperId)
      .replaceWith($newContentWrapper);

    const hideAddToCart = this.$triggerBtn.attr("data-hide-add-to-cart");
    if (hideAddToCart)
      this.$quickViewWrapper.find(".quickview-add-to-bag-btn-wrapper").hide();
  },

  showSpinner() {
    this.$spinner.css("display", "flex");
  },

  hideSpinner() {
    this.$spinner.hide("slow", { animation: "slide" });
  },

  showQuickView() {
    this.$shin.show();
    this.$quickViewWrapper.removeClass("hide-quickview");
    this.$quickViewWrapper.addClass("show-quickview");
  },

  hideQuickView() {
    this.$shin.hide();
    this.$quickViewWrapper.removeClass("show-quickview");
    this.$quickViewWrapper.addClass("hide-quickview");
  },
};
