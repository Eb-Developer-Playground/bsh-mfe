# Typography

The global typography config is defined in
~/src/assets/scss/\_typography.scss

A custom typography config named `equity-typography` has been defined.
The style definitions have different levels of styles for text formatting

Essentially, no classes have to be added to the html elements, since the over-arching custom class of `equity-typography` has been added to the body in the `index.html` file.

## Typography Levels

The different levels are defined with 3 properties in this order - font-size, line-height, font-weight

### Levels

    $headline: mat.define-typography-level(32px, 40px, 500),
    $title: mat.define-typography-level(24px, 24px, 500),
    $subheading-1: mat.define-typography-level(20px, 20px, 500),
    $subheading-2: mat.define-typography-level(16px, 16px, 500),
    $body-1: mat.define-typography-level(16px, 16px, 400),
    $body-2: mat.define-typography-level(14px, 14px, 400),
    $caption: mat.define-typography-level(12px, 12px, 400),
    $button: mat.define-typography-level(16px, 16px, 600),
    $input: mat-typography-level(inherit, 1.125, 400)

    $headline: represents the H1 element
    $title: represents the H2 element
    $subheading-1: represents the H3 element
    $subheading-2: represents the H4 element
    $body-1: represents the body text elements such as paragraph, spans etc
    $body-2: represents the alternative body text element
    $caption: represents the small element
    $button: represents the button element
    $input: represents the Input element
