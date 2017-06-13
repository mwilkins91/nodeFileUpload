import '../sass/style.scss';
var $ = require('jQuery');

var $contentSection = $('section.contentSection');

var continueButton = function() {
	var $button = $('button.continue');
	$button.on('click', function() {
		var sectionCalled = $(this).attr('aria-controls');
		$contentSection.attr('aria-hidden', 'true')
		$(`section#${sectionCalled}`).attr('aria-hidden', 'false');
	})
}

function tabs() {
	var $tabs = $('a[role="tab"]');
	$tabs.on('click', function() {
		var sectionId = $(this).attr('aria-controls');
		$contentSection.attr('aria-hidden', 'true');
		$tabs.attr('aria-selected', 'false');
		$(this).attr('aria-selected', 'true');
		$(`section#${sectionId}`).attr('aria-hidden', 'false');

	})
}


// import { $, $$ } from './modules/bling';
$(function() {
	continueButton();
	tabs();

})
