# hugo-model-shortcode

A Hugo theme component that shows a 3D model from a page bundle in a view you can rotate. It handles `.stl`, `.3mf` and `.obj`, needs no build step, and brings its own copy of [three.js](https://threejs.org/), fetched only when a model nears the viewport. Without JavaScript the reader gets a download link instead.

**[See it working](https://egelmex.github.io/hugo-model-shortcode/)**

## Install

Add it as a submodule, or copy it to the same place:

```sh
git submodule add https://github.com/egelmex/hugo-model-shortcode.git themes/hugo-model-shortcode
```

Then add it after your theme, which lets your theme override anything here:

```toml
theme = ["my-theme", "hugo-model-shortcode"]
```

Or, with [Go](https://go.dev/) installed and your site set up as a Hugo module (`hugo mod init`), import it after your theme:

```toml
[module]
  [[module.imports]]
    path = "my-theme"
  [[module.imports]]
    path = "github.com/egelmex/hugo-model-shortcode"
```

Either way, call the partial from your `<head>`. It adds nothing to pages without a model.

```go-html-template
{{ partial "model-head.html" . }}
```

## Use

```
{{< model src="./case.3mf" alt="The case, seen from above" caption="The case" >}}
```

| Parameter | |
| --- | --- |
| `src` | Required. The model, as a page resource |
| `alt` | Text for screen readers, falling back to the caption |
| `title`, `caption`, `attr`, `attrlink` | The figure's caption, as in Hugo's `figure` shortcode. `caption` and `attr` take Markdown |
| `color` | Any CSS colour, or a variable as `--name` or `var(--name)`, which then follows light and dark themes |
| `ratio` | The stage's `aspect-ratio`. Default `4/3` |
| `rotation` | The starting view as `"spin,tilt"` in degrees. Default `35,28` |
| `modes` | Comma-separated from `solid`, `flat`, `wireframe`, `xray` and `normals`. The first shows initially, and two or more get buttons. Default `solid` |
| `class` | Extra classes for the figure |

Drag rotates. Ctrl+scroll or a pinch zooms, while a plain scroll or a vertical swipe moves the page. Double-click resets the view. Wireframe draws only creases over 30°, and colours in 3MF files are ignored.

## Styling

The defaults in `assets/css/model.css` are deliberately plain. Set these on `.model` in your own CSS. Load order doesn't matter, because the defaults have no specificity.

| Variable | Default | |
| --- | --- | --- |
| `--model-color` | `#3b82c4` | The model. The `color` parameter overrides it |
| `--model-bg` | faint `currentColor` | The stage's background |
| `--model-border` | thin `currentColor` | The stage's border |
| `--model-font` | `ui-monospace, monospace` | Labels and buttons |
| `--model-muted` | inherited | The status text's colour |
| `--model-button-bg`, `--model-button-fg`, `--model-button-border` | `Canvas`, `CanvasText`, thin | Buttons and labels on the stage |
| `--model-pressed-bg`, `--model-pressed-fg` | `Highlight`, `HighlightText` | The current mode's button |
| `--model-fade` | `280ms` | How fast the hint fades |

```css
.model {
  --model-color: var(--accent);
  --model-button-bg: var(--surface);
}
```

For anything else, add rules for the `.model__*` classes, or replace the whole file with your own `assets/css/model.css`. The model's colour is re-read when an attribute on `<html>` changes or the system colour scheme does, so `data-theme`-style toggles work.

## Sample site

`exampleSite/`, [published here](https://egelmex.github.io/hugo-model-shortcode/), shows every parameter and a restyled model, using small models generated for it:

```sh
cd exampleSite
hugo server
```

It finds the theme through `themesDir = "../.."`, so this directory must stay named `hugo-model-shortcode`. Its layouts and `static/css/site.css` also show the minimum a site needs.

## Licence

MIT. three.js, in `static/vendor/three/`, is unmodified from npm (r) under its own MIT licence.
