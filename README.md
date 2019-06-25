# Accessible UI
A library of accessible UI patterns. Uses `data-*` attributes to build UI elements through progressive enhancement

## Collapsible Elements

1. Give your element an `id`, and make sure it contains a child heading element (`<h*>`) with an `id` as well.
2. Add an `aria-labelledby` attribute to the element. The value of `aria-labelledby` should match the `id` of the child heading.
3. Add `data-accessible-collapsible="off"` to the element.

### To turn the collapsible functionality on (or off) at a particular breakpoint

1. Add a `data-accessible-breakpoint` attribute to the element. Give it an `em` (or `px`) value that corresponds to the viewport width at which the UI should change.
2. Add a `data-accessible-breakpoint-switches-ui` attribute to the element, and specifify whether the breakpoint switches the UI `on` or `off`.

## Toolbars

Coming soon!
