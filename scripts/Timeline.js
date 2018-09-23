function Timeline() {
	this.$container = $('[data-timeline]');
	this.$track = this.$container.find('[data-timeline-track]');
	this.$carousel = this.$container.find('[data-timeline-carousel]');
	this.$prevButton = this.$container.find('[data-timeline-prev]');
	this.$nextButton = this.$container.find('[data-timeline-next]');

	this.defaultIndex = Number(this.$container.data('timeline-default-index')) || 0;

	this.init();
}

Timeline.prototype = {
	init() {
		this.slideLength = this.$track.children().length;
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
	},

	update() {
		this.trackElementWidth = this.$track
			.children()
			.first()
			.outerWidth(true);

		this.setSlide(this.defaultIndex, true);
	},

	setSlide: function(index, immediately) {

		var to = -index * this.trackElementWidth;

		console.log('to', to);

		TweenMax.to(this.$track, immediately ? 0 : 0.35, { x: to });

		this.currentIndex = index;
	},

	prev: function() {
		this.setSlide(this.currentIndex - 1);
	},

	next: function() {
		this.setSlide(this.currentIndex + 1);
	},
};

$(function() {
	new Timeline();
});
