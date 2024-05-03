const quickCartScript = {
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
    // quick cart section id
    this.cartSectionId = `#${$(".quick-cart-section").attr("id")}`;
    this.cartSectionName = "quick-cart";

    // for event bubbling
    this.$mainContent = $("#MainContent");

    // for show/hide toggle
    this.$quickcartWrapper = $("#quickcart-wrapper");
    this.$cartShin = $("#quickcart-shin");
    this.$cartSpinner = $("#quickcart-spinner-wrapper");
    this.cartTriggerBtnClass = ".quickcart-trigger-btn";
    this.cartCountClass = ".quickcart-count";
    this.contentWrapperId = "#quickcart-content-wrapper";
    this.cartCountId = "#quickcart-item-count";
    this.cartCloseBtnId = "#quickcart-close-btn";

    // cart empty - for slick/unsclick slider
    this.recomCarouselId = `#quickcart-recom-carousel-${this.cartSectionName}`;

    // cart fill - for slick/unsclick slider
    
    // line item
    this.lineItemClass = ".quickcart-line-item-wrapper";
    this.closeLineItemClass = ".quickcart-line-item-close";
    this.lineItemDetailsClass = ".quickcart-line-item-details";
    this.lineItemRemoveWrapperClass = ".quickcart-line-item-remove-wrapper";
    this.removeLineItemClass = ".quickcart-line-item-remove";
    this.lineItemSpinner = ".quickcart-line-item-spinner-wrapper";
    // details contains quantity and pricing, using toggleclass so don't add dots in class names
    this.hideDetailsClass = "hide-line-item-details";
    // remove wrapper contains remove and wishlist buttons, using toggleclass so don't add dots in class names
    this.showRempveWrapperClass = "show-line-item-remove-wrapper";

    // line item quantity
    this.quantityPlusClass = ".quickcart-line-item-quantity-plus";
    this.quantityMinusClass = ".quickcart-line-item-quantity-minus";
    this.quantitClass = ".quickcart-line-item-quantity";
    this.quantitySpinnerClass = ".quickcart-line-item-quantity-spinner-wrapper";

    /**
     * cart mutation buttons
     * add product to quickcart,
     * btn must have data-product-handle, data-product-id, data-variant-id attributes
     */
    this.addToCartBtnClass = ".quickcart-add-btn";
    this.addToCartWithUiUpdateBtnClass = ".quickcart-add-with-ui-update-btn";

    return true;
  },

  bindEvents() {
    const $body = $("body");

    $body.on("click", this.cartTriggerBtnClass, () =>
      this.handleQuickCartOpen(),
    );

    $body.on("click", this.cartCloseBtnId, () => this.hideQuickCart());

    // cart mutation buttons
    $body.on("click", this.addToCartBtnClass, (e) =>
      this.handleAddToBag(e.currentTarget),
    );

    // cart mutation buttons
    $body.on("click", this.addToCartWithUiUpdateBtnClass, (e) =>
      this.handleAddToBagWithUiUpdate(e.currentTarget),
    );

    $body.on("click", this.quantityPlusClass, (e) =>
      this.handleChangeCart(e.currentTarget),
    );

    $body.on("click", this.quantityMinusClass, (e) =>
      this.handleChangeCart(e.currentTarget),
    );

    $body.on("click", this.closeLineItemClass, (e) =>
      this.handleCloseLineItem(e.currentTarget),
    );

    $body.on("click", this.removeLineItemClass, (e) =>
      this.handleClearLineItem(e.currentTarget),
    );
  },

  async updateQuickcart(html) {
    try {
      const $contentWrapper = $(html).find(this.contentWrapperId);

      $(this.cartSectionId)
        .find(this.contentWrapperId)
        .replaceWith($contentWrapper);

      const $recomCarousel = $(this.recomCarouselId);
      if ($recomCarousel.length) {
        $recomCarousel.slick({
          slidesToShow: 2,
          slidesToScroll: 1,
          speed: 300,
          arrows: false,
          dots: true,
          infinite: false,
          appendDots: $(".quickcart-recom-carousel-dots"),
        });
      }

      wishlistScript.updateAll();
    } catch (error) {
      return {
        status: "error",
        message: "dom-error",
        error,
      };
    }
    return { status: "success", message: "success" };
  },

  // async fetchProductPage() {
  //   try {
  //     const response = await axios.get(`${location.href}`);

  //     if (response.status !== 200) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     return { status: "success", productPage: response.data };
  //   } catch (error) {
  //     return { status: "error", error };
  //   }
  // },

  updateQuickcartCount(ui) {
    try {
      const counts = $(this.cartCountClass);
      const count = $(ui).find(this.cartCountId).text();
      counts.text(count);

      $(".cart-count-bubble").css("opacity", 1);

      return { status: "success", message: "success" };
    } catch (domError) {
      return { status: "error", message: "dom-error", error: domError };
    }
  },

  async handleQuickCartOpen() {
    this.showQuickCart();
    this.showCartSpinner();

    const sectionUrl = `/cart?sections=${this.cartSectionName}`;

    const { status, section, error } =
      await this.getQuickcartSection(sectionUrl);

    if (error) {
      const message = this.getCartErrorMessage(error);
      toastifyScript.showToast(message);
      this.hideCartSpinner();

      return { status, message: "network-error", error };
    }

    try {
      this.updateQuickcart(section[this.cartSectionName]);
    } catch (domError) {
      toastifyScript.showToast(this.getDomErrorMessage());

      return {
        status: "error",
        message: "dom-error",
        error: domError,
      };
    } finally {
      this.hideCartSpinner();
    }
  },

  async getQuickcartSection(sectionUrl) {
    try {
      const response = await axios.get(sectionUrl);

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { status: "success", section: response.data };
    } catch (error) {
      return { status: "error", error };
    }
  },

  async getCart(sections = undefined) {
    let url;
    if (sections) {
      url = `${window.Shopify.routes.root}cart.js?sections=${sections}`;
    } else {
      url = `${window.Shopify.routes.root}cart.js`;
    }
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { status: "success", cart: response.data };
    } catch (error) {
      return { status: "error", error };
    }
  },

  async handleAddToBag(clickedBtn) {
    const $clickedBtn = $(clickedBtn);
    const variantId = $clickedBtn.attr("data-variant-id");
    const variantQty = Number(
      $('input.quantity__input[name="quantity"]').val(),
    );
    const formData = {
      id: variantId,
      quantity: variantQty || 1,
    };

    $clickedBtn.text("ADDING TO BAG...");
    const { status, cart, error } = await this.addToCart(formData);

    if (error) {
      const message = this.getCartErrorMessage(error);
      toastifyScript.showToast(message);
      $clickedBtn.text("ADD TO BAG");
      $("#quickview-close-btn").click();

      return { status, message: "network-error", error };
    }

    try {
      const ui = cart.sections[this.cartSectionName];
      this.updateQuickcart(ui);
      this.updateQuickcartCount(ui);
      return { status, message: "success", cart };
    } catch (domError) {
      toastifyScript.showToast(this.getDomErrorMessage());
      return { status: "error", message: "dom-error", error: domError };
    } finally {
      $clickedBtn.text("ADD TO BAG");
      $("#quickview-close-btn").click();
      toastifyScript.showToast("Product Added to Bag");
    }
  },

  async handleAddToBagWithUiUpdate(clickedBtn) {
    const $clickedBtn = $(clickedBtn);
    const variantId = $clickedBtn.attr("data-variant-id");

    const formData = {
      id: variantId,
      quantity: 1,
    };

    this.showCartSpinner();
    const { status, cart, error } = await this.addToCart(formData);

    if (error) {
      const message = this.getCartErrorMessage(error);
      toastifyScript.showToast(message);
      this.hideCartSpinner();

      return { status, message: "network-error", error };
    }

    try {
      const ui = cart.sections[this.cartSectionName];
      this.updateQuickcart(ui);
      this.updateQuickcartCount(ui);
      return { status, message: "success", cart };
    } catch (domError) {
      toastifyScript.showToast(this.getDomErrorMessage());
      return { status: "error", message: "dom-error", error: domError };
    } finally {
      this.hideCartSpinner();
      toastifyScript.showToast("Product Added to Bag");
    }
  },

  async addToCart(items, sections = this.cartSectionName) {
    try {
      const response = await axios.post(
        `${window.Shopify.routes.root}cart/add.js?sections=${sections}`,
        items,
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { status: "success", cart: response.data };
    } catch (error) {
      return { status: "error", error };
    }
  },

  async handleChangeCart(clickedBtn) {
    const $clickedBtn = $(clickedBtn);
    const key = $clickedBtn.attr("data-key");
    const direction = $clickedBtn.attr("data-direction");
    const currQuantity = parseInt($clickedBtn.attr("data-curr-quantity"), 10);

    let newQuantity;
    if (direction === "minus" && currQuantity > 1) {
      newQuantity = currQuantity - 1;
    } else if (direction === "plus") {
      newQuantity = currQuantity + 1;
    } else {
      return {
        status: "error",
        message: "invalid-quantity",
        error: new Error("invalid-quantity in quickcart line-item"),
      };
    }

    const formData = {
      id: key,
      quantity: newQuantity,
    };

    this.showQuantitySpinner($clickedBtn);
    const { status, cart, error } = await this.changeCart(formData);

    if (error) {
      const message = this.getCartErrorMessage(error);
      toastifyScript.showToast(message);
      this.hideQuantitySpinner($clickedBtn);

      return { status, message: "network-error", error };
    }

    try {
      const ui = cart.sections[this.cartSectionName];
      this.updateQuickcart(ui);
      this.updateQuickcartCount(ui);
      return { status, message: "success", cart };
    } catch (domError) {
      toastifyScript.showToast(this.getDomErrorMessage());
      return { status: "error", message: "dom-error", error: domError };
    } finally {
      this.hideQuantitySpinner($clickedBtn);
    }
  },

  /**
    items = {
     'id': 794864053 or line-item-key: 794864053:83503fd282b94a4737d2c95bd95db0b8,
     'quantity': 3
    } 
  */
  async changeCart(items, sections = this.cartSectionName) {
    try {
      const response = await axios.post(
        `${window.Shopify.routes.root}cart/change.js?sections=${sections}`,
        items,
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { status: "success", cart: response.data };
    } catch (error) {
      return { status: "error", error };
    }
  },

  handleCloseLineItem(clickedBtn) {
    const $clickedBtn = $(clickedBtn);

    const $lineItem = $clickedBtn.closest(this.lineItemClass);
    const $details = $lineItem.find(this.lineItemDetailsClass);
    const $remove = $lineItem.find(this.lineItemRemoveWrapperClass);

    $details.toggleClass(this.hideDetailsClass);
    $remove.toggleClass(this.showRempveWrapperClass);
  },

  async handleClearLineItem(clickedBtn) {
    const $clickedBtn = $(clickedBtn);

    const key = $clickedBtn.attr("data-key");

    const formData = {
      id: key,
      quantity: 0,
    };

    this.showLineItemSpinner($clickedBtn);
    const { status, cart, error } = await this.changeCart(formData);

    if (error) {
      const message = this.getCartErrorMessage(error);
      toastifyScript.showToast(message);
      this.hideLineItemSpinner($clickedBtn);

      return { status, message: "network-error", error };
    }

    try {
      const ui = cart.sections[this.cartSectionName];
      this.updateQuickcart(ui);
      this.updateQuickcartCount(ui);
      return { status, message: "success", cart };
    } catch (domError) {
      toastifyScript.showToast(this.getDomErrorMessage());
      return { status: "error", message: "dom-error", error: domError };
    } finally {
      this.hideLineItemSpinner($clickedBtn);

      toastifyScript.showToast("Product Removed from Bag");
    }
  },

  /**
    items = {
     'id': 794864053 or line-item-key: 794864053:83503fd282b94a4737d2c95bd95db0b8,
     'quantity': 3
    } 
  */
  async clearLine(items, sections = this.cartSectionName) {
    try {
      const response = await axios.post(
        `${window.Shopify.routes.root}cart/clear.js?sections=${sections}`,
        items,
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { status: "success", cart: response.data };
    } catch (error) {
      return { status: "error", error };
    }
  },

  showLineItemSpinner($clickedBtn) {
    const $lineItemSpinner = $clickedBtn.siblings(this.lineItemSpinner);

    $lineItemSpinner.css("cssText", "display: flex !important");
  },

  hideLineItemSpinner($clickedBtn) {
    const $lineItemSpinner = $clickedBtn.siblings(this.lineItemSpinner);

    $lineItemSpinner.hide();
  },

  showQuantitySpinner($clickedBtn) {
    const $quantitySpinner = $clickedBtn.siblings(this.quantitySpinnerClass);
    const $quantity = $clickedBtn.siblings(this.quantitClass);

    $quantitySpinner.css("cssText", "display: flex !important");
    $quantity.hide();
  },

  hideQuantitySpinner($clickedBtn) {
    const $quantitySpinner = $clickedBtn.siblings(this.quantitySpinnerClass);
    const $quantity = $clickedBtn.siblings(this.quantitClass);

    $quantitySpinner.hide();
    $quantity.css("display", "flex");
  },

  showCartSpinner() {
    this.$cartSpinner.css("display", "flex");
  },

  hideCartSpinner() {
    this.$cartSpinner.hide("slow", { animation: "slide" });
  },

  showQuickCart() {
    this.$cartShin.show();
    this.$quickcartWrapper.removeClass("hide-quickcart");
    this.$quickcartWrapper.addClass("show-quickcart");
  },

  hideQuickCart() {
    this.$cartShin.hide();
    this.$quickcartWrapper.removeClass("show-quickcart");
    this.$quickcartWrapper.addClass("hide-quickcart");
  },

  getCartErrorMessage(error) {
    let message;
    if (error.response.data.status === 422) {
      message = "OOPS! Product Out of Stock";
    } else if (error.response.data.status === 404) {
      message = "OOPS! Cart Error. Can Not Find Variant";
    } else if (error.response.data.status === 429) {
      message = "OOPS! Too Many Requests";
    } else if (error.response.data.status === 500) {
      message = "OOPS! Internal Server Error";
    } else if (error.response.data.status === 503) {
      message = "OOPS! The Server is  Currently Unavailable";
    } else {
      message = "OOPS! Try Again";
    }

    return message;
  },

  getDomErrorMessage() {
    return "OOPS! Try refreshing the page.";
  },
};
