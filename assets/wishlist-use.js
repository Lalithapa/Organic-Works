// const wishlistUseScript = {
//   init() {
//     this.wishlistToggleBtnClass = ".wishlist-toggle-btn";
//     this.wishlistImgClass = ".wishlist-img";
//     this.wishlistFillImgClass = ".wishlist-fill-img";

//     this.bindEventListeners();
//   },

//   bindEventListeners() {
//     const $body = $("body");
//     $body.on("click", this.wishlistToggleBtnClass, (e) =>
//       this.on(e.currentTarget),
//     );
//   },

//   on(wishlistBtn) {
//     const $wishlistBtn = $(wishlistBtn);
//     const productId = $wishlistBtn.attr("data-product-id");
//     const variantId = $wishlistBtn.attr("data-variant-id");

//     const productToWishlist = {
//       productId,
//       variantId,
//     };
//     const { status, product, error } =
//       wishlistScript.handleWishlisting(productToWishlist);

//     if (error) console.log(error);

//     if (status === "wishlisted") {
//       this.wishlist($wishlistBtn);
//     } else if (status === "unwishlisted") {
//       this.unwishlist($wishlistBtn);
//     }
//   },

//   updateAll() {
//     const $wishlistBtns = $(this.wishlistToggleBtnClass);

//     $wishlistBtns.each((index, wishlistBtn) => {
//       const $wishlistBtn = $(wishlistBtn);
//       const productId = $wishlistBtn.attr("data-product-id");
//       const variantId = $wishlistBtn.attr("data-variant-id");

//       const productToCheck = {
//         productId,
//         variantId,
//       };

//       if (wishlistScript.isProductInWishlist(productToCheck)) {
//         this.wishlist($wishlistBtn);
//       } else {
//         this.unwishlist($wishlistBtn);
//       }
//     });
//   },

//   wishlist($wishlistBtn) {
//     $wishlistBtn.find(".wishlist-img").hide();
//     $wishlistBtn.find(".wishlist-fill-img").show();
//   },

//   unwishlist($wishlistBtn) {
//     $wishlistBtn.find(".wishlist-img").show();
//     $wishlistBtn.find(".wishlist-fill-img").hide();
//   },
// };
