if(Object.prototype.toString.call(window.operamini) !== "[object OperaMini]") {
	(function() {
		var AccessibleUI = {
				breakpointAdjustments: {
					minWidths: {},
					maxWidths: {}
				},
				buildUI: function (collection, callback, undoCallback) {
					var action,
						breakpoint,
						i;

					for(i = 0; i < collection.length; i++) {
						if ((collection[i].dataset.accessibleBreakpoint) && (collection[i].dataset.accessibleBreakpointSwitchesUi === 'off' || collection[i].dataset.accessibleBreakpointSwitchesUi === 'on')) {
							breakpoint = collection[i].dataset.accessibleBreakpoint;
							action = collection[i].dataset.accessibleBreakpointSwitchesUi;

							this.registerBreakpointAdjustment(collection[i], breakpoint, action, callback, undoCallback);
						} else {
							callback(collection[i]);
						}
					}
				},
				__construct: function() {
					this.polyfills();

					for(i = 0; i < this.progressiveEnhancements.length; i++) {
						this.buildUI(this.progressiveEnhancements[i].collection, this.progressiveEnhancements[i].callback, this.progressiveEnhancements[i].undoCallback);
					}

					// Check the DOM for elements with `[data-accessible-toolbar="off"]`
					if (this.progressiveEnhancements[1].collection.length) {
						this.toolbarKeyboardListener();
					}

					this.updateUI();
				},
				__destruct: function() {
					document.querySelector('html').dataset.accessibleUi = 'true';
				},
				polyfills: function() {
					// Polyfill for `Element.matches()` -- used in `Element.closest()` polyfill
					if (!Element.prototype.matches) {
						Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
					}

					// Polyfill for `Element.closest()`
					if (!Element.prototype.closest) {
						Element.prototype.closest = function(s) {
							var el = this;

							do {
								if (el.matches(s)) return el;
								el = el.parentElement || el.parentNode;
							} while (el !== null && el.nodeType === 1);
							return null;
						};
					}
				},
				progressiveEnhancements: [
					{
						name: "Collapsibles",
						collection: document.querySelectorAll('[data-accessible-collapsible="off"]'),
						callback: function (element) {
							var elementSelector,
								label,
								labelNodes,
								labelSelector,
								labelText,
								toggledContent,
								toggledContentFocusableElements,
								svg,
								button,
								i;

							if (element.dataset.accessibleCollapsible === 'off') {
								button = document.createElement('button');
								button.setAttribute('type', 'button');
								button.setAttribute('aria-expanded', 'false');
								elementSelector = cssSelector(element);
								label = element.querySelector('#' + element.getAttribute('aria-labelledby'));
								labelNodes = label.querySelectorAll('*');
								labelSelector = cssSelector(label).split(' > ').pop();
								labelText = label.textContent.trim();
								svg = (function() {
									var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
										path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

									svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
									svg.setAttribute('viewBox', '0 0 16 16');
									svg.setAttribute('width', '10');
									svg.setAttribute('height', '10');
									svg.setAttribute('aria-hidden', 'true');

									path.setAttribute('d', 'M1.875 3L8 9.125 14.125 3 16 4.875l-8 8-8-8z');
									path.setAttribute('data-d', 'M1.875 3L8 9.125 14.125 3 16 4.875l-8 8-8-8z');
									path.setAttribute('data-d-alt', 'M1.875 13L8 6.875 14.125 13 16 11.125l-8-8-8 8z');

									svg.appendChild(path);

									return svg;
								})();

								toggledContent = document.querySelectorAll(elementSelector + ' >  *:not(#' + label.id + ')');
								toggledContentFocusableElements = document.querySelectorAll(labelSelector + ' ~ * a,' + labelSelector + ' ~ * area,' + labelSelector + ' ~ * button,' + labelSelector + ' ~ * iframe,' + labelSelector + ' ~ * input,' + labelSelector + ' ~ * select,' + labelSelector + ' ~ * textarea,' + labelSelector + ' ~ * [tabindex]');

								button.setAttribute('aria-label', labelText + ', button, collapsed');

								for(i = 0; i < labelNodes.length; i++) {
									button.appendChild(labelNodes[i]);
								}

								for(i = 0; i < label.children.length; i++) {
									label.removeChild(label.children[i]);
								}

								label.appendChild(button);

								for(i = 0; i < toggledContent.length; i++) {
									toggledContent[i].setAttribute('aria-hidden', 'true');
									toggledContent[i].hidden = true;
								}

								for(i = 0; i < toggledContentFocusableElements.length; i++) {
									toggledContentFocusableElements[i].setAttribute('tabindex', '-1');
								}

								button = label.querySelector('button[type="button"][aria-expanded][aria-label]');
								button.appendChild(document.createTextNode(' '));
								button.appendChild(svg);

								button.addEventListener('click', AccessibleUI.toggleContent);

								element.dataset.accessibleCollapsible = 'on';
								element.dataset.accessibleCollapsibleButtonAriaExpanded = 'false';
							}
						},
						undoCallback: function (element) {
							var label = element.querySelector('#' + element.getAttribute('aria-labelledby')),
								labelSelector = cssSelector(label).split(' > ').pop(),
								button = label.querySelector('button[type="button"][aria-expanded][aria-label]'),
								span = document.createElement('span'),
								toggledContent,
								toggledContentFocusableElements,
								i,
								elementSelector = cssSelector(element);

							toggledContent = document.querySelectorAll(elementSelector + ' >  *:not(#' + label.id + ')');
							toggledContentFocusableElements = document.querySelectorAll(labelSelector + ' ~ * a,' + labelSelector + ' ~ * area,' + labelSelector + ' ~ * button,' + labelSelector + ' ~ * iframe,' + labelSelector + ' ~ * input,' + labelSelector + ' ~ * select,' + labelSelector + ' ~ * textarea,' + labelSelector + ' ~ * [tabindex]');
							element.dataset.accessibleCollapsible = 'off';

							for(i = 0; i < toggledContent.length; i++) {
								toggledContent[i].removeAttribute('aria-hidden');
								toggledContent[i].hidden = false;				
							}

							for(i = 0; i < toggledContentFocusableElements.length; i++) {
								toggledContentFocusableElements[i].removeAttribute('tabindex');
							}

							if(button) {
								span.appendChild(document.createTextNode(button.textContent.trim()));
								span.classList.add('visually-hidden');

								button.removeChild(button.querySelector('svg'));
								button.parentElement.replaceChild(span, button);
							}
						}
					},
					{
						name: "Toolbars",
						collection: document.querySelectorAll('[data-accessible-toolbar="off"]'),
						callback: function (element) {
							var anchors = element.querySelectorAll('a:not(.visually-hidden-skip-link)'),
								attributes = element.attributes,
								div,
								elementContents,
								nestedDiv,
								nonHeadings,
								separator,
								toolbar,
								i;

							separator = document.createElement('span');
							separator.classList.add('visually-hidden');
							separator.setAttribute('aria-hidden', 'true');
							separator.appendChild(document.createTextNode(' | '));

							toolbar = document.createElement('div');
							toolbar.setAttribute('role', 'toolbar');
							nonHeadings = document.querySelectorAll(cssSelector(element) + ' > :not(h2):not(h3):not(h4):not(h5):not(h6)');

							for(i = 1; i < element.children.length; i++) {
								element.removeChild(element.children[i]);
							}

							if(element.dataset.accessibleToolbarInnerDivs === '1') {
								div = document.createElement('div');

								for(i = 0; i < anchors.length; i++) {
									div.appendChild(anchors[i]);
								}

								element.appendChild(div);
							} else if (element.dataset.accessibleToolbarInnerDivs === '2') {
								div = document.createElement('div');
								nestedDiv = div.cloneNode();
								
								for(i = 0; i < anchors.length; i++) {
									nestedDiv.appendChild(anchors[i]);
								}

								div.appendChild(nestedDiv);
								element.appendChild(div);
							} else {
								for(i = 0; i < anchors.length; i++) {
									element.appendChild(anchors[i]);
								}
							}

							anchors = document.querySelectorAll(cssSelector(element) + ' a');

							for(i = 1; i < anchors.length; i++) {
								anchors[i].setAttribute('tabindex', '-1');
								anchors[i].parentElement.insertBefore(separator.cloneNode(true), anchors[i]);
							}

							anchors[0].setAttribute('tabindex', '0');

							elementContents = document.querySelectorAll(cssSelector(element) + ' > *');

							for(i = 0; i < elementContents.length; i++) {
								toolbar.appendChild(elementContents[i]);
							}

							element.replaceWith(toolbar);

							for(i = 0; i < attributes.length; i++) {
								toolbar.setAttribute(attributes[i].name, attributes[i].value);
							}

							if(toolbar.dataset.accessibleToolbar === 'off') {
								toolbar.dataset.accessibleToolbar = 'on';
							}
						},
						undoCallback: null
					}
				],
				registerBreakpointAdjustment: function (element, breakpoint, action, callback, undoCallback) {
					var category,
						breakpointUnit,
						adjustment = {
							element: element,
							callback: callback,
							undoCallback: undoCallback
						};

					breakpoint = breakpoint.toString();
					breakpointUnit = breakpoint.substr(-2);

					if (breakpointUnit !== 'px' && breakpointUnit !== 'em') {
						return;
					}

					breakpoint = breakpoint.substring(0, breakpoint.length - 2);

					if (isNaN(parseFloat(breakpoint))) {
						return;
					}

					if (breakpointUnit === 'em') {
						breakpoint = parseFloat(breakpoint) * 16;
					}
					
					if (action === 'off') {
						if(!breakpoint % 1 != 0) {
							breakpoint = Math.floor(breakpoint);
						} else {
							breakpoint = breakpoint - 1;
						}

						breakpoint = breakpoint.toString();
						category = this.breakpointAdjustments.maxWidths;
					} else if (action === 'on') {
						category = this.breakpointAdjustments.minWidths;
					}

					if (!(breakpoint in category)) {
						category[breakpoint] = [];
					}

					category[breakpoint].push(adjustment);
				},
				toggleContent: function (e) {
					var ariaLabelConst,
						button = e.currentTarget,
						element = button.closest('[data-accessible-collapsible]'),
						elementSelector = cssSelector(element),
						label,
						labelSelector,
						path = button.querySelector('svg > path'),
						toggledContent,
						toggledContentFocusableElements;

						ariaLabelConst = button.getAttribute('aria-label').split(',');
						ariaLabelConst.pop();
						label = element.querySelector('#' + element.getAttribute('aria-labelledby'));
						labelSelector = cssSelector(label).split(' > ').pop();
						toggledContent = document.querySelectorAll(elementSelector + ' >  *:not(#' + label.id + ')');
						toggledContentFocusableElements = document.querySelectorAll(labelSelector + ' ~ * a,' + labelSelector + ' ~ * area,' + labelSelector + ' ~ * button,' + labelSelector + ' ~ * iframe,' + labelSelector + ' ~ * input,' + labelSelector + ' ~ * select,' + labelSelector + ' ~ * textarea,' + labelSelector + ' ~ * [tabindex]');


					if (button.getAttribute('aria-expanded') === 'false') {
						for(i = 0; i < toggledContent.length; i++) {
							toggledContent[i].removeAttribute('aria-hidden');
							toggledContent[i].hidden = false;
						}
						
						for(i = 0; i < toggledContentFocusableElements.length; i++) {
							toggledContentFocusableElements[i].removeAttribute('tabindex');
						}

						button.setAttribute('aria-expanded', 'true');
						button.setAttribute('aria-label', ariaLabelConst + ', expanded');
						path.setAttribute('d', path.dataset.dAlt);
						element.dataset.accessibleCollapsibleButtonAriaExpanded = true;
					} else if (button.getAttribute('aria-expanded') === 'true') {
						for(i = 0; i < toggledContent.length; i++) {
							toggledContent[i].setAttribute('aria-hidden', 'true');
							toggledContent[i].hidden = true;
						}

						for(i = 0; i < toggledContentFocusableElements.length; i++) {
							toggledContentFocusableElements[i].setAttribute('tabindex', '-1');
						}

						button.setAttribute('aria-expanded', 'false');
						button.setAttribute('aria-label', ariaLabelConst + ', collapsed');
						path.setAttribute('d', path.dataset.d);
						element.dataset.accessibleCollapsibleButtonAriaExpanded = 'false';
					}
				},
				toolbarKeyboardListener: function () {
					window.addEventListener('keydown', function(e) {
						if(document.activeElement.closest('div[role="toolbar"]')) {
							var currentAnchor = document.activeElement,
								firstAnchor,
								flag = false,
								lastAnchor,
								nextAnchor,
								previousAnchor,
								toolbar = document.activeElement.closest('div[role="toolbar"]');

								if (toolbar.hasAttribute('data-accessible-toolbar-inner-divs')) {
									firstAnchor = toolbar.querySelector('div > a:first-of-type');
									lastAnchor = toolbar.querySelector('div > a:last-of-type');
								} else {
									firstAnchor = toolbar.parentElement.querySelector(cssSelector(toolbar) + ' > a:first-of-type');
									lastAnchor = toolbar.parentElement.querySelector(cssSelector(toolbar) + ' > a:last-of-type');
								}

							switch(e.key) {
								case 'Home':
									currentAnchor.setAttribute('tabindex', '-1');
									firstAnchor.setAttribute('tabindex', '0');
									firstAnchor.focus();
									flag = true;
									break;
								case 'End':
									currentAnchor.setAttribute('tabindex', '-1');
									lastAnchor.setAttribute('tabindex', '0');
									lastAnchor.focus();
									flag = true;
									break;
								case 'ArrowLeft':
									if(currentAnchor === firstAnchor) {
										previousAnchor = lastAnchor;
									} else {
										previousAnchor = currentAnchor.previousElementSibling.previousElementSibling;
									}

									currentAnchor.setAttribute('tabindex', '-1');
									previousAnchor.setAttribute('tabindex', '0');
									previousAnchor.focus();
									flag = true;
									break;
								case 'ArrowRight':
									if(currentAnchor === lastAnchor) {
										nextAnchor = firstAnchor;
									} else {
										nextAnchor = currentAnchor.nextElementSibling.nextElementSibling;
									}

									currentAnchor.setAttribute('tabindex', '-1');
									nextAnchor.setAttribute('tabindex', '0');
									nextAnchor.focus();
									flag = true;
							}

							if(flag) {
								e.stopPropagation();
								e.preventDefault();
							}
						}
					});
				},
				updateUI: function () {
					var viewportWidth = window.innerWidth,
						breakpoint,
						breakpointValue,
						callback,
						undoCallback,
						element,
						minWidths = this.breakpointAdjustments.minWidths,
						maxWidths = this.breakpointAdjustments.maxWidths;

					for (breakpoint in minWidths) {
						if (minWidths.hasOwnProperty(breakpoint)) {
							breakpointValue = parseInt(breakpoint);

							if (viewportWidth >= breakpointValue) {
								for (i = 0; i < minWidths[breakpoint].length; i++) {
									callback = minWidths[breakpoint][i].callback;
									element = minWidths[breakpoint][i].element;

									if(callback) {
										callback(element);
									}
								}
							} else {
								for (i = 0; i < minWidths[breakpoint].length; i++) {
									undoCallback = minWidths[breakpoint][i].undoCallback;
									element = minWidths[breakpoint][i].element;
									
									if(undoCallback) {
										undoCallback(element);
									}
								}
							}
						}
					}

					for (breakpoint in maxWidths) {
						if (maxWidths.hasOwnProperty(breakpoint)) {
							breakpointValue = parseInt(breakpoint);

							if (viewportWidth <= breakpointValue) {
								for (i = 0; i < maxWidths[breakpoint].length; i++) {
									callback = maxWidths[breakpoint][i].callback;
									element = maxWidths[breakpoint][i].element;

									if(callback) {
										callback(element);
									}
								}
							} else {
								for (i = 0; i < maxWidths[breakpoint].length; i++) {
									undoCallback = maxWidths[breakpoint][i].undoCallback;
									element = maxWidths[breakpoint][i].element;

									if(undoCallback) {
										undoCallback(element);
									}
								}
							}
						}
					}
				}
			},
			i,
			poll = (function(){
				var timer = 0;
				return function(callback, ms){
					clearTimeout(timer);
					timer = setTimeout(callback, ms);
				};
			})();

		function cssSelector(domElement) {
			var nth,
				path,
				selector,
				sib;

			if (!(domElement instanceof Element)) return;

			path = [];
			
			while (domElement.nodeType === Node.ELEMENT_NODE) {
				selector = domElement.nodeName.toLowerCase();

				if (domElement.id) {
					selector += '#' + domElement.id;
				} else {
					sib = domElement;
					nth = 1;

					if(sib.previousElementSibling) {
						while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousElementSibling)) {
							nth++;
						}

						selector += ":nth-child(" + nth + ")";
					}
				}

				path.unshift(selector);
				domElement = domElement.parentNode;
			}

			path.shift();

			return path.join(" > ");
		}

		AccessibleUI.__construct();

		window.addEventListener('resize', function() {
			poll(function(){
				AccessibleUI.updateUI();
			}, 25);
		});

		AccessibleUI.__destruct();
	})();
}