function Timeline() {
	this.$container = $('[data-timeline]');
	this.$track = this.$container.find('[data-timeline-track]');
	this.$trackContainer = this.$track.parent().parent();
	this.$trackItems = this.$track.children();
	this.$carouselContainer = this.$container.find('[data-timeline-carousel]');
	this.$value1 = this.$container.find('[data-timeline-item-value1-container]');
	this.$value2 = this.$container.find('[data-timeline-item-value2-container]');
	this.$prevButton = this.$container.find('[data-timeline-prev]');
	this.$nextButton = this.$container.find('[data-timeline-next]');

	this.defaultIndex = Number(this.$container.data('timeline-default-index')) || 0;

	this.init();
}

Timeline.prototype = {
	init() {
		this.slideLength = this.$trackItems.length;
		this.intermediateTrackX = null;
		this.initEvents();
		this.update();
	},

	initEvents() {
		var self = this;

		this.$prevButton.on('click', function() {
			self.prev();
		});

		this.$nextButton.on('click', function() {
			self.next();
		});

		this.$trackContainer.on('mousedown', e => {
			this.draggingStartX = e.pageX || e.clientX;
			this.turnOnDragging();
		});

		this.$trackContainer.on('mouseup mouseleave', () => {
			this.turnOffDragging();
		});
	},

	turnOnDragging: function() {
		this.$container.addClass('_dragging');
		TweenMax.to(this.$trackContainer, 0.85, { scale: 0.8 });
		var self = this;
		this.$track.on('mousemove.timeline-dragging', function(e) {
			self.mouseMoveHandler.call(self, e);
		});
	},

	turnOffDragging: function() {
		if (this.intermediateTrackX !== null) {
			this.trackX = this.intermediateTrackX;
		}
		this.intermediateTrackX = null;
		if (this.intermediateIndex !== null) {
			this.setSlide(this.intermediateIndex);
		}
		this.intermediateIndex = null;
		this.$container.removeClass('_dragging');
		TweenMax.to(this.$trackContainer, 0.5, { scale: 1 });
		this.$track.off('.timeline-dragging');
	},

	mouseMoveHandler: function(e) {
		var delta = (e.pageX || e.clientX) - this.draggingStartX;
		var newX = this.trackX + delta;
		TweenMax.to(this.$track, 0.05, {
			x: newX,
		});
		this.intermediateTrackX = newX;
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
		this.setCurrentItem(index);
	},

	update: function() {
		this.trackItemWidth = this.$trackItems.first().outerWidth(true);

		this.setSlide(this.defaultIndex, true);
	},

	setCurrentItem: function(index) {
		var $currentItem = this.$trackItems.eq(index);
		this.$trackItems.removeClass('_active');
		$currentItem.addClass('_active');
		this.$currentItem = $currentItem;
	},

	setSlide: function(index, immediately) {
		this.trackX = -index * this.trackItemWidth;
		TweenMax.to(this.$track, immediately ? 0 : 0.35, { x: this.trackX });

		this.setCurrentItem(index);

		var value1 = this.$currentItem.data('timeline-item-value1');
		this.$value1.text(value1);
		var value2 = this.$currentItem.data('timeline-item-value2');
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
