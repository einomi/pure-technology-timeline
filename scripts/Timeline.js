function debounce(func, wait, immediate) {
	var timeout;
	wait = wait || 100;

	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
		};

		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
}

function Timeline() {
	this.$container = $('[data-timeline]');
	this.$draggingArea = this.$container.find('[data-timeline-dragging-area]');
	this.$track = this.$container.find('[data-timeline-track]');
	this.$trackContainer = this.$track.parent().parent();
	this.$trackItems = this.$track.children();
	this.$carousel = this.$container.find('[data-timeline-carousel]');
	this.$carouselItems = this.$carousel.children();
	this.$value1 = this.$container.find('[data-timeline-item-value1-container]');
	this.$value2 = this.$container.find('[data-timeline-item-value2-container]');
	this.$values = this.$value1.add(this.$value2);
	this.$prevButton = this.$container.find('[data-timeline-prev]');
	this.$nextButton = this.$container.find('[data-timeline-next]');
	this.$linesContainer = this.$container.find('[data-timeline-lines]');
	this.$lines = this.$linesContainer.children();
	this.$background = this.$container.find('[data-timeline-background]');

	this.defaultIndex = Number(this.$container.data('timeline-default-index')) || 0;

	this.init();
}

Timeline.prototype = {
	init() {
		this.slideLength = this.$trackItems.length;
		this.trackIntermediateX = null;
		this.initEvents();
		this.update();
	},

	update: function() {
		this.trackItemWidth = this.$trackItems.first().outerWidth(true);
		this.carouselGroupWidth = this.$carouselItems.first().outerWidth(true);

		this.setSlide(this.defaultIndex, true);
	},

	initEvents() {
		var self = this;

		this.$prevButton.on('click', function(e) {
			e.stopPropagation();
			self.prev();
		});

		this.$nextButton.on('click', function(e) {
			e.stopPropagation();
			self.next();
		});

		this.$draggingArea.on('mousedown', function(e) {
			self.draggingStartX = e.pageX || e.clientX;
			self.turnOnDragging();
		});

		this.$draggingArea.on('mouseup mouseleave', function() {
			self.turnOffDragging();
		});

		$(window).on('resize', debounce(function() {
		    self.update();
        }, 60));
	},

	turnOnDragging: function() {
		this.dragging = true;
		var self = this;
		this.$container.addClass('_dragging');
		TweenMax.to(this.$trackContainer, 0.85, { scale: 0.7 });

		this.$lines.each(function(index, element) {
			var $line = $(element);
			TweenMax.to($line, 0.65, { scaleY: 0.98 - 0.15 * index, ease: Power1.easeIn });
		});

		var mouseMoveHandler = function(e) {
			self.mouseMoveHandler.call(self, e);
		};

		this.$draggingArea.on('mousemove.timeline-dragging', mouseMoveHandler);

		TweenMax.to(this.$background, 0.85, { scale: 1 });
	},

	turnOffDragging: function() {
		if (!this.dragging) {
			return;
		}
		this.dragging = false;
		if (this.trackIntermediateX !== null) {
			this.trackX = this.trackIntermediateX;
		}
		this.trackIntermediateX = null;
		if (this.intermediateIndex !== null) {
			this.setSlide(this.intermediateIndex);
		}
		this.intermediateIndex = null;
		this.$container.removeClass('_dragging');
		TweenMax.to(this.$trackContainer, 0.35, { scale: 1 });
		this.$lines.each(function(index, element) {
			TweenMax.to($(element), 0.35, { scaleY: 1 });
		});
		this.$draggingArea.off('.timeline-dragging');
		TweenMax.to(this.$background, 0.35, { scale: 1.15, ease: Power1.easeOut });
	},

	mouseMoveHandler: function(e) {
		var delta = (e.pageX || e.clientX) - this.draggingStartX;
		var newX = this.trackX + delta;
		TweenMax.set(this.$track, {
			x: newX,
		});
		this.trackIntermediateX = newX;
		this.onDragUpdate(newX);
	},

	onDragUpdate: function(x) {
		var index;
		switch (true) {
			case x >= 0:
				index = 0;
				break;
			case x <= -(this.slideLength - 1) * this.trackItemWidth:
				index = this.slideLength - 1;
				break;
			default:
				index = Math.abs(Math.round(x / this.trackItemWidth));
		}
		this.intermediateIndex = index;
		this.setCurrentTrackItem(index);
	},

	setCurrentTrackItem: function(index) {
		var $currentItem = this.$trackItems.eq(index);
		this.$trackItems.removeClass('_active');
		$currentItem.addClass('_active');
		this.$trackCurrentItem = $currentItem;
	},

	setCurrentCarouselItem: function(index) {
		var $currentItem = this.$carouselItems.eq(index);
		this.$carouselItems.removeClass('_active');
		$currentItem.addClass('_active');
		this.$carouselCurrentItem = $currentItem;
	},

	setSlide: function(index, immediately) {
		if (index === undefined) {
			return;
		}

		var self = this;

		this.trackX = -index * this.trackItemWidth;
		this.carouselX = -index * this.carouselGroupWidth;

		TweenMax.to(this.$track, immediately ? 0 : 0.75, {
			x: this.trackX,
			ease: Power2.easeOut,
		});

		if (index === this.currentIndex) {
			return;
		}

		if (!immediately) {
			TweenMax.to(this.$values, 0.2, { y: -40, alpha: 0 });
			TweenMax.fromTo(
				this.$values,
				immediately ? 0 : 0.35,
				{ y: 40 },
				{ y: 0, alpha: 1, delay: 0.25, ease: Power1.easeOut }
			);
		}

		TweenMax.to(this.$carousel, immediately ? 0 : 0.5, {
			x: this.carouselX,
			ease: Power1.easeOut,
			delay: 0.15,
			onStart: function() {
				self.setCurrentCarouselItem(index);
			},
		});

		this.setCurrentTrackItem(index);

		var value1 = this.$trackCurrentItem.data('timeline-item-value1');
		this.$value1.text(value1);
		var value2 = this.$trackCurrentItem.data('timeline-item-value2');
		this.$value2.text(value2);

		if (index === this.slideLength - 1) {
			this.$container.addClass('_end');
		} else if (index === 0) {
			this.$container.addClass('_start');
		} else {
			this.$container.removeClass('_start _end');
		}

		this.currentIndex = index;
	},

	prev: function() {
		if (this.currentIndex <= 0) {
			return;
		}

		this.setSlide(this.currentIndex - 1);
	},

	next: function() {
		if (this.currentIndex >= this.slideLength - 1) {
			return;
		}

		this.setSlide(this.currentIndex + 1);
	},
};

$(function() {
	new Timeline();
});
