class Carousel {
  constructor(settings) {
    const {
      root,
      slides,
      prev,
      next,
      arrows = true,
      initialSlide = 0,
      slidesToScroll = 'auto',
      clickHandlers = true,
      mouseDragHandlers = true,
      removeControls = false,
      autoplay = false,
      autoplaySpeed = 2000,
      pauseAutoPlayOnUserInput = true,
      pauseAutoPlayOnHover = true,
      autoplayBackOffTime = 5000,
      infinite = false,
      stateChangeCallback,
    } = settings;

    if (typeof jQuery === 'undefined') {
      throw new Error('jQuery is not loaded');
    }

    if (!root || !slides) {
      throw new Error('Invalid arguments: root and slides are required');
    }

    if (arrows) {
      if (!next || !prev) {
        throw new Error(
          'Invalid arguments: If arrows is true, then prev and next buttons are required'
        );
      }

      if (!(root instanceof jQuery) || !(slides instanceof jQuery)) {
        throw new Error(
          'Invalid arguments: prev and next must be jQuery objects'
        );
      }
    }

    if (!(root instanceof jQuery) || !(slides instanceof jQuery)) {
      throw new Error(
        'Invalid arguments: root, slides, prev, and next must be jQuery objects'
      );
    }

    if (
      typeof initialSlide !== 'number' ||
      initialSlide < 0 ||
      initialSlide >= this.numSlides
    ) {
      throw new Error(
        'Invalid arguments: initialSlide must be a number between 0 and the number of slides - 1'
      );
    }

    this.$root = root;
    this.$slides = slides;
    this.slidesToScroll = slidesToScroll;
    this.arrows = arrows;
    this.$next = next;
    this.$prev = prev;
    this.numSlides = this.$slides.length;
    this.activeSlide = Math.min(initialSlide, this.numSlides - 1);
    this.stateChangeCallback = stateChangeCallback;

    this.updateDimensions();
    this.updateClasses();

    if (mouseDragHandlers) {
      this.addMouseDragHandlers();
    }

    if (arrows && clickHandlers) {
      this.addClickHandlers();
    }

    if (infinite) {
      // const $clonedSlides = this.$slides
      //   .clone()
      //   .addClass("carousel-infinite-clone")
      //   .attr("data-carousel-infinite-clone", true);
      // this.$root.append($clonedSlides);
      // this.numSlides += $clonedSlides.length;
    }

    if (autoplay) {
      this.autoplay = autoplay;
      this.autoplaySpeed = autoplaySpeed;
      this.autoplayInterval = null;

      if (pauseAutoPlayOnUserInput) {
        // this.pauseAutoplay = debounce(this.pauseAutoplay.bind(this), 2000);
        // this.resumeAutoplay = debounce(this.resumeAutoplay.bind(this), 2000);
        this.pauseAutoPlayOnUserInput = pauseAutoPlayOnUserInput;
        this.autoplayBackOffTime = autoplayBackOffTime;
      }
      if (pauseAutoPlayOnHover) {
        this.pauseAutoPlayOnHover = pauseAutoPlayOnHover;
        this.$root.hover(
          this.pauseAutoplay.bind(this),
          this.resumeAutoplay.bind(this)
        );
      }
      this.startAutoplay();
    }

    if (removeControls) {
      this.removeControls();
    }
  }

  addClickHandlers() {
    const handleCarouselBtnClick = (direction) => {
      const currentScrollPosition = this.$root.scrollLeft();

      const scrollAmount = currentScrollPosition + direction * this.slideWidth;
      this.moveCarousel(scrollAmount);

      // Pause autoplay on user intervention
      if (this.autoplay && this.pauseAutoPlayOnUserInput) {
        this.pauseAutoplay();
        this.resumeAutoplay();
      }
    };

    this.$prev.on('click', () => handleCarouselBtnClick(-1));
    this.$next.on('click', () => handleCarouselBtnClick(1));
  }

  updateDimensions() {
    this.rootWidth = this.$root.width();
    this.slideWidth = this.$slides.outerWidth(true);
    this.numVisibleSlides = Math.floor(this.rootWidth / this.slideWidth);

    console.log(this.rootWidth, 'this.rootWidth');
    console.log(this.slideWidth, 'this.slideWidth');
    console.log(this.numVisibleSlides, 'this.numVisibleSlides');
  }

  moveCarousel(scrollAmount) { 
    // cal slides to scroll
    const slidesToScroll =
      this.slidesToScroll === 'auto'
        ? Math.round(scrollAmount / this.slideWidth)
        : this.slidesToScroll;

    // calc scroll amount based on slides to scroll
    let snapScrollAmount = slidesToScroll * this.slideWidth;

    console.log(
      `move carousel by: ${scrollAmount}, slidesToScroll: ${slidesToScroll}, calc snapScrollAmount: ${snapScrollAmount}`
    );

    snapScrollAmount = this.clamp(
      snapScrollAmount,
      0,
      (this.numSlides - this.numVisibleSlides) * this.slideWidth
    );

    console.log(`clamp to: ${snapScrollAmount}`);

    this.$root.scrollLeft(snapScrollAmount);

    this.updateCarouselState(snapScrollAmount);
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  updateCarouselState(scrollAmount) {
    console.log(scrollAmount, 'scrollAmount in updateCarouselState');
    console.log(this.$root.scrollLeft(), 'root scroll left');
    this.calculateActiveSlide(scrollAmount);
    this.updateClasses();

    if (this.stateChangeCallback) {
      this.stateChangeCallback(this.getState());
    }
  }

  updateClasses() {
    if (this.arrows) {
      if (this.activeSlide === 0) {
        this.$prev.attr('aria-disabled', 'true');
      } else {
        this.$prev.removeAttr('aria-disabled');
      }

      if (this.activeSlide === this.numSlides - this.numVisibleSlides) {
        this.$next.attr('aria-disabled', 'true');
      } else {
        this.$next.removeAttr('aria-disabled');
      }
    }

    this.$slides.removeClass('carousel-visible carousel-active');
    this.$slides
      .slice(this.activeSlide, this.activeSlide + this.numVisibleSlides)
      .addClass('carousel-visible');
    this.$slides.eq(this.activeSlide).addClass('carousel-active');
  }

  calculateActiveSlide(snapScroll) {
    console.log(snapScroll, 'snapScroll in calculateActiveSlide');
    console.log(this.slideWidth, 'slide width in calculateActiveSlide');
    console.log(
      snapScroll / this.slideWidth,
      'snapScroll / this.slideWidth calculateActiveSlide'
    );
    this.activeSlide = Math.round(snapScroll / this.slideWidth);
  }

  addMouseDragHandlers() {
    let isMouseDown = false;
    let $dragTarget;
    let startX;
    let rootScrollLeft;
    let scrollAmount;

    const dragMove = (e) => {
      console.log('dragmove');

      if (!$dragTarget || !isMouseDown) return;
      e.preventDefault();
      e.stopPropagation();

      $dragTarget.addClass('carousel-dragging');

      const mousePos = e.pageX - this.$root.offset().left;

      scrollAmount = (mousePos - startX) * 1;
    };

    const dragStop = () => {
      console.log('dragstop');

      $dragTarget.removeClass('carousel-dragging');
      $dragTarget = undefined;
      $(document).off('mousemove', dragMove);
      $(document).off('mouseup', dragStop);

      const move = rootScrollLeft - scrollAmount;

      this.moveCarousel(move);
      // this.$root.scrollLeft(move);
      // this.updateCarouselState(move);

      if (this.autoplay && this.pauseAutoPlayOnUserInput) {
        this.pauseAutoplay();
        this.resumeAutoplay();
      }
    };

    const dragStart = (e) => {
      console.log('dragstart');
      $dragTarget = this.$root;
      isMouseDown = true;

      startX = e.pageX - this.$root.offset().left;
      rootScrollLeft = this.$root.scrollLeft();

      $(document).on('mousemove touchmove', { passive: false }, dragMove);
      $(document).on('mouseup touchend', { passive: false }, dragStop);
      return false;
    };

    const onScroll = () => {
      console.log('dragscroll');

      rootScrollLeft = this.$root.scrollLeft();

      this.updateCarouselState(rootScrollLeft);
    };

    this.$root.on('mousedown touchstart', dragStart);
    this.$root.on('scroll', onScroll);
  }

  startAutoplay() {
    // Clear any existing autoplay interval
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }

    // Start a new autoplay interval
    this.autoplayInterval = setInterval(() => {
      const currentScrollPosition = this.$root.scrollLeft();
      const scrollAmount = currentScrollPosition + this.slideWidth;
      this.updateCarouselState(scrollAmount);
    }, this.autoplaySpeed);
  }

  pauseAutoplay() {
    // Clear the autoplay interval
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resumeAutoplay() {
    // Resume autoplay after the back off time
    setTimeout(() => {
      this.startAutoplay();
    }, this.autoplayBackOffTime);
  }

  removeControls() {
    if (this.numSlides === this.numVisibleSlides) {
      this.$prev.hide();
      this.$next.hide();
    }
  }

  getState() {
    // Return the current state
    return {
      totalSlides: this.numSlides,
      activeSlide: this.activeSlide,
      visibleSlides: this.numVisibleSlides,
      visibleSlideIndices: this.getVisibleSlideIndices(),
    };
  }

  getVisibleSlideIndices() {
    // Calculate the indices of the visible slides
    const start = this.activeSlide;
    const end = start + this.numVisibleSlides;
    const indices = [];
    for (let i = start; i < end; i++) {
      indices.push(i);
    }
    return indices;
  }
}

// debounce the call due to scroll behaviour smooth,
// else the active slide is calculated with the stale value of scrollLeft()
// debounce(() => {
//    this.activeSlide = Math.ceil(this.$root.scrollLeft() / this.slideWidth);
//   this.calculateActiveSlide();
//   this.updateClasses();
// }, 300)();

// moveCarousel(direction) {
//   // this.activeSlide = Math.max(
//   //   0,
//   //   Math.min(
//   //     this.activeSlide + direction,
//   //     Math.max(0, this.numSlides - this.numVisibleSlides)
//   //   )
//   // );

//   this.$root[0].scrollBy({
//     left: direction * Math.ceil(0.7 * this.slideWidth),
//     behavior: "smooth",
//   });
//   debounce(() => {
//     // this.activeSlide = Math.ceil(this.$root.scrollLeft() / this.slideWidth);
//     this.calculateActiveSlide();
//     this.updateClasses();
//   }, 300)();
// }

// clampScrollAmount(scrollAmount) {
//   if (scrollAmount >= this.numSlides * this.slideWidth) {
//     // if scroll amount if greater then scrollbar reset to zero
//     this.$root.scrollLeft(0);
//     scrollAmount = 0;
//   } else {
//     // Prevent out of bound values for the snap scroll amount
//     // prevent prev out of bounds
//     scrollAmount = Math.max(0, scrollAmount);
//     // prevent next out of bounds
//     scrollAmount = Math.min(
//       scrollAmount,
//       (this.numSlides - this.numVisibleSlides) * this.slideWidth
//     );

//     // this.$root.scrollLeft(snapScrollAmount);
//   }
// }
