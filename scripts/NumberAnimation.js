$.fn.isInViewport = function() {
	var $element = $(this);
	var elementTop = $element.offset().top;
	var elementBottom = elementTop + $element.outerHeight();
	var viewportTop = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).height();
	return elementBottom > viewportTop && elementTop < viewportBottom;
};

function AnimatingNumber($element) {
	this.$element = $element;
}

AnimatingNumber.prototype = {
	animate: function() {
		var $element = this.$element;

		if (!$element.isInViewport()) {
			return;
		}

		this.animated = true;
		if (!$element) {
			return;
		}
		var text = $element.text();
		var hasDot = text.split('.').length > 1;
		var hasComma;
		if (!hasDot) {
			hasComma = text.split(',').length > 1;
		}

		var delimiter;
		var useDelimiter = hasDot || hasComma;

		if (hasDot) {
			delimiter = '.';
		} else if (hasComma) {
			delimiter = ',';
		}
		var dotPartLength = useDelimiter ? text.split(delimiter)[1].length : 0;

		var value = parseFloat(text.split(delimiter).join('.'));

		var controller = { value: 0 };
		var counter = 0;

		var updateText = forced => {
			counter++;
			if (!forced) {
				if (counter % 2 === 0) {
					return;
				}
			}
			if (useDelimiter) {
				var valueArray = controller.value.toFixed(dotPartLength < 1 ? 1 : dotPartLength).split('.');
				value = valueArray[0] + delimiter;
				var dotPart = valueArray[1];
				while (dotPart.length < dotPartLength) {
					dotPart += '0';
				}
				value += dotPart;
			} else {
				value = Math.floor(controller.value) + '';
			}
			if ($element) {
				$element.text(value);
			}
		};

		TweenMax.set($element, { autoAlpha: 1 });

		TweenMax.fromTo(
			controller,
			1,
			{ value: 0 },
			{
				delay: 0.0,
				value: value,
				ease: useDelimiter ? Power4.easeInOut : null,
				onUpdate: () => updateText(),
				onComplete: () => {
					updateText(true);
				},
			}
		);
	},
};

function NumberAnimation() {
	var $elements = $('[data-number-animation]');
	var self = this;

	this.elements = [];
	$elements.each(function(index, element) {
		var $element = $(element);
		self.elements.push(new AnimatingNumber($element));
	});

	$(window).on('scroll', function() {
		for (var i = 0; i < self.elements.length; i++) {
			var element = self.elements[i];
			if (element.animated) {
				continue;
			}
			element.animate();
		}
	});
}

$(function() {
	new NumberAnimation();
});
