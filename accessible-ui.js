if(Object.prototype.toString.call(window.operamini) !== "[object OperaMini]") {
	(function() {
		var AccessibleUI = {
				breakpointAdjustments: {
					minWidths: {},
					maxWidths: {}
				},
				buildAllInstancesOf: function(component) {
					var action,
						breakpoint,
						i;

					for(i = 0; i < component.instances.length; i++) {
						if ((component.instances[i].dataset.accessibleBreakpoint) && (component.instances[i].dataset.accessibleBreakpointSwitchesUi === 'off' || component.instances[i].dataset.accessibleBreakpointSwitchesUi === 'on')) {
							breakpoint = component.instances[i].dataset.accessibleBreakpoint;
							action = component.instances[i].dataset.accessibleBreakpointSwitchesUi;

							this.registerBreakpointAdjustment(component.instances[i], breakpoint, action, component.__construct, component.__destruct);
						} else {
							component.__construct(component.instances[i]);
						}
					}
				},
				polyfills: {
					closest: function() {
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
					}
				},
				registerBreakpointAdjustment: function (instance, breakpoint, action, __construct, __destruct) {
					var category,
						breakpointUnit,
						adjustment = {
							instance: instance,
							__construct: __construct,
							__destruct: __destruct
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
				components: {
					CollapsibleElement: {
						instances: document.querySelectorAll('[data-accessible-collapsible="off"]'),
						__construct: function (instance) {
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

							if (instance.dataset.accessibleCollapsible === 'off') {
								button = document.createElement('button');
								button.setAttribute('type', 'button');
								button.setAttribute('aria-expanded', 'false');
								elementSelector = cssSelector(instance);
								label = instance.querySelector('#' + instance.getAttribute('aria-labelledby'));
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

								instance.dataset.accessibleCollapsible = 'on';
								instance.dataset.accessibleCollapsibleButtonAriaExpanded = 'false';
							}
						},
						__destruct: function (instance) {
							var label = instance.querySelector('#' + instance.getAttribute('aria-labelledby')),
								labelSelector = cssSelector(label).split(' > ').pop(),
								button = label.querySelector('button[type="button"][aria-expanded][aria-label]'),
								span = document.createElement('span'),
								toggledContent,
								toggledContentFocusableElements,
								i,
								elementSelector = cssSelector(instance);

							toggledContent = document.querySelectorAll(elementSelector + ' >  *:not(#' + label.id + ')');
							toggledContentFocusableElements = document.querySelectorAll(labelSelector + ' ~ * a,' + labelSelector + ' ~ * area,' + labelSelector + ' ~ * button,' + labelSelector + ' ~ * iframe,' + labelSelector + ' ~ * input,' + labelSelector + ' ~ * select,' + labelSelector + ' ~ * textarea,' + labelSelector + ' ~ * [tabindex]');
							instance.dataset.accessibleCollapsible = 'off';

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
					Toolbar: {
						instances: document.querySelectorAll('[data-accessible-toolbar="off"]'),
						__construct: function (instance) {
							var anchors = instance.querySelectorAll('a:not(.visually-hidden-skip-link)'),
								attributes = instance.attributes,
								div,
								instanceContents,
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
							nonHeadings = document.querySelectorAll(cssSelector(instance) + ' > :not(h2):not(h3):not(h4):not(h5):not(h6)');

							for(i = 1; i < instance.children.length; i++) {
								instance.removeChild(instance.children[i]);
							}

							if(instance.dataset.accessibleToolbarInnerDivs === '1') {
								div = document.createElement('div');

								for(i = 0; i < anchors.length; i++) {
									div.appendChild(anchors[i]);
								}

								instance.appendChild(div);
							} else if (instance.dataset.accessibleToolbarInnerDivs === '2') {
								div = document.createElement('div');
								nestedDiv = div.cloneNode();
								
								for(i = 0; i < anchors.length; i++) {
									nestedDiv.appendChild(anchors[i]);
								}

								div.appendChild(nestedDiv);
								instance.appendChild(div);
							} else {
								for(i = 0; i < anchors.length; i++) {
									instance.appendChild(anchors[i]);
								}
							}

							anchors = document.querySelectorAll(cssSelector(instance) + ' a');

							for(i = 1; i < anchors.length; i++) {
								anchors[i].setAttribute('tabindex', '-1');
								anchors[i].parentElement.insertBefore(separator.cloneNode(true), anchors[i]);
							}

							anchors[0].setAttribute('tabindex', '0');

							instanceContents = document.querySelectorAll(cssSelector(instance) + ' > *');

							for(i = 0; i < instanceContents.length; i++) {
								toolbar.appendChild(instanceContents[i]);
							}

							instance.replaceWith(toolbar);

							for(i = 0; i < attributes.length; i++) {
								toolbar.setAttribute(attributes[i].name, attributes[i].value);
							}

							if(toolbar.dataset.accessibleToolbar === 'off') {
								toolbar.dataset.accessibleToolbar = 'on';
							}
						},
						__destruct: null
					}
				},
				updateDOM: function () {
					var viewportWidth = window.innerWidth,
						breakpoint,
						breakpointValue,
						__construct,
						__destruct,
						instance,
						minWidths = this.breakpointAdjustments.minWidths,
						maxWidths = this.breakpointAdjustments.maxWidths;

					for(breakpoint in minWidths) {
						if (minWidths.hasOwnProperty(breakpoint)) {
							breakpointValue = parseInt(breakpoint);

							if (viewportWidth >= breakpointValue) {
								for (i = 0; i < minWidths[breakpoint].length; i++) {
									__construct = minWidths[breakpoint][i].__construct;
									instance = minWidths[breakpoint][i].instance;

									if(__construct) {
										__construct(instance);
									}
								}
							} else {
								for (i = 0; i < minWidths[breakpoint].length; i++) {
									__destruct = minWidths[breakpoint][i].__destruct;
									instance = minWidths[breakpoint][i].instance;
									
									if(__destruct) {
										__destruct(instance);
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
									__construct = maxWidths[breakpoint][i].__construct;
									instance = maxWidths[breakpoint][i].instance;

									if(__construct) {
										__construct(instance);
									}
								}
							} else {
								for (i = 0; i < maxWidths[breakpoint].length; i++) {
									__destruct = maxWidths[breakpoint][i].__destruct;
									instance = maxWidths[breakpoint][i].instance;

									if(__destruct) {
										__destruct(instance);
									}
								}
							}
						}
					}
				},
				__construct: function() {
					var component,
						polyfill;

					for(polyfill in this.polyfills) {
						if(this.polyfills.hasOwnProperty(polyfill)) {
							this.polyfills[polyfill];
						}
					}

					for(component in this.components) {
						if(this.components.hasOwnProperty(component)) {
							this.buildAllInstancesOf(this.components[component]);
						}
					}

					// Check the DOM for Toolbars
					if (this.components.Toolbar.instances.length > 0) {
						this.toolbarKeyboardListener();
					}

					this.updateDOM();
				},
				__destruct: function() {
					document.querySelector('html').dataset.accessibleUi = 'true';
				},
			},
			i,
			poll = (function(){
				var timer = 0;
				return function(__construct, ms){
					clearTimeout(timer);
					timer = setTimeout(__construct, ms);
				};
			})();

		function cssSelector(domElement) {
			var nth,
				path,
				selector,
				sib;

			if (!(domElement instanceof Element)) {
				return;
			}

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
				AccessibleUI.updateDOM();
			}, 25);
		});

		AccessibleUI.__destruct();
	})();
}