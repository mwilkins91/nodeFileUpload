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

var nav


// import { $, $$ } from './modules/bling';
$(function() {
	continueButton();


})
