const wishlistScript = {
  init() {
    this.wishlistKey = "ow-wishlist-key";
    if (!this.isLocalStorageSupported()) return;
    if (!this.wishlistKey)
      throw new Error("Wishlist Key is required to wishlist products");

    this.wishlistToggleBtnClass = ".wishlist-toggle-btn";
    this.wishlistImgClass = ".wishlist-img";
    this.wishlistFillImgClass = ".wishlist-fill-img";

    this.bindEventListeners();
  },

  bindEventListeners() {
    const $body = $("body");
    $body.on("click", this.wishlistToggleBtnClass, (e) =>
      this.on(e.currentTarget),
    );
  },

  on(wishlistBtn) {
    const $wishlistBtn = $(wishlistBtn);
    console.log("on", $wishlistBtn);
    const productId = $wishlistBtn.attr("data-product-id");
    const variantId = $wishlistBtn.attr("data-variant-id");

    const productToWishlist = {
      productId,
      variantId,
    };
    const { status, product, error } =
      wishlistScript.handleWishlisting(productToWishlist);

    if (error) console.log(error);

    if (status === "wishlisted") {
      this.wishlist($wishlistBtn);
    } else if (status === "unwishlisted") {
      this.unwishlist($wishlistBtn);
    }
  },

  updateAll() {
    const $wishlistBtns = $(this.wishlistToggleBtnClass);

    $wishlistBtns.each((index, wishlistBtn) => {
      const $wishlistBtn = $(wishlistBtn);
      const productId = $wishlistBtn.attr("data-product-id");
      const variantId = $wishlistBtn.attr("data-variant-id");

      const productToCheck = {
        productId,
        variantId,
      };

      if (wishlistScript.isProductInWishlist(productToCheck)) {
        this.wishlist($wishlistBtn);
      } else {
        this.unwishlist($wishlistBtn);
      }
    });
  },

  wishlist($wishlistBtn) {
    $wishlistBtn.find(".wishlist-img").hide();
    $wishlistBtn.find(".wishlist-fill-img").show();
  },

  unwishlist($wishlistBtn) {
    $wishlistBtn.find(".wishlist-img").show();
    $wishlistBtn.find(".wishlist-fill-img").hide();
  },

  getDateTime() {
    const date = new Date();
    return date.toISOString();
  },

  isLocalStorageSupported() {
    try {
      const testKey = "test";
      localStorage.setItem(testKey, "testValue");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  },

  getWishlist() {
    return JSON.parse(localStorage.getItem(this.wishlistKey)) ?? [];
  },

  saveWishlist(wishlist) {
    const wishlistString = JSON.stringify(wishlist);
    localStorage.setItem(this.wishlistKey, wishlistString);
  },

  isProductInWishlist(productToWishlist) {
    const wishlist = this.getWishlist();
    return wishlist.some(
      (item) =>
        item.id === productToWishlist.id &&
        item.variantId === productToWishlist.variantId,
    );
  },

  addProductToWishlist(productToWishlist) {
    const wishlist = this.getWishlist();
    const item = {
      id: productToWishlist.id,
      handle: productToWishlist.handle,
      variantId: productToWishlist.variantId,
      dateCreated: this.getDateTime(),
      dateUpdated: this.getDateTime(),
    };
    wishlist.push(item);
    this.saveWishlist(wishlist);
  },

  updateProductInWishlist(productToWishlist) {
    const wishlist = this.getWishlist();
    for (let i = 0; i < wishlist.length; i += 1) {
      const item = wishlist[i];
      if (
        item.id === productToWishlist.id &&
        item.variantId === productToWishlist.variantId
      ) {
        item.id = productToWishlist.id;
        item.handle = productToWishlist.handle;
        item.variantId = productToWishlist.variantId;
        item.dateUpdated = this.getDateTime();
        break;
      }
    }
    this.saveWishlist(wishlist);
  },

  removeProductFromWishlist(productToWishlist) {
    const wishlist = this.getWishlist();
    const updatedWishlist = wishlist.filter(
      (item) =>
        item.id !== productToWishlist.id ||
        item.variantId !== productToWishlist.variantId,
    );
    this.saveWishlist(updatedWishlist);
  },

  toggleProductInWishlist(productToWishlist) {
    try {
      if (this.isProductInWishlist(productToWishlist)) {
        this.removeProductFromWishlist(productToWishlist);
        return { status: "unwishlisted", product: productToWishlist };
      }
      this.addProductToWishlist(productToWishlist);
      return { status: "wishlisted", product: productToWishlist };
    } catch (error) {
      return { status: "error", error };
    }
  },

  handleWishlisting(productToWishlist) {
    if (this.isLocalStorageSupported()) {
      return this.toggleProductInWishlist(productToWishlist);
    }
    // This part is up to you
    return {
      status: "error",
      error: new Error("Localstorage is not supported"),
    };
  },

  clearLocalStorage() {
    localStorage.removeItem(this.wishlistKey);
  },
};
