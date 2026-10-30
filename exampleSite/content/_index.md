---
title: hugo-model-shortcode
---

A Hugo shortcode for showing 3D models from a page bundle. Drag to rotate, ctrl+scroll or pinch to zoom, and double-click to reset the view. Each model below sits beside this page's `_index.md`.

## Just a model

An `.obj`, with alt text for screen readers and a caption.

{{< model src="./gear.obj" alt="A spur gear with twelve teeth and a round hole through the middle" caption="A gear, with the default colour and view" >}}

```
{{</* model src="./gear.obj" alt="A spur gear..." caption="A gear..." */>}}
```

## View modes

Two or more `modes` get buttons, and the first one shows initially. Wireframe draws only the creases.

{{< model src="./nut.stl" modes="solid,flat,wireframe,xray,normals" alt="A hexagonal nut" caption="An `.stl`, in every mode" >}}

```
{{</* model src="./nut.stl" modes="solid,flat,wireframe,xray,normals" alt="A hexagonal nut" */>}}
```

## Colour, view and shape

`color` takes any CSS colour or a variable. This one uses a variable that changes with the dark mode button, and the model follows it. `rotation` is `"spin,tilt"` in degrees, and `ratio` is the stage's `aspect-ratio`.

{{< model src="./flange.3mf" color="--demo-accent" rotation="0,75" ratio="16/9" alt="A round flange with four lobes for bolts" title="A flange" caption="A `.3mf`, from nearly above" attr="Made for this page" attrlink="https://gohugo.io/" >}}

```
{{</* model src="./flange.3mf" color="--demo-accent" rotation="0,75" ratio="16/9" alt="A round flange..." */>}}
```

## Your own styling

Set the `--model-*` variables in your CSS. Usually that's on `.model`, for every model on the site, but `class` lets one figure differ, as here. See `static/css/site.css`.

{{< model src="./gear.obj" class="demo-themed" modes="solid,wireframe" rotation="-20,40" alt="The same gear, on a cream background with a green double border" caption="The same gear, restyled" >}}

```
.demo-themed {
  --model-color: #2e7d5b;
  --model-bg: #f4efe2;
  --model-border: 3px double #2e7d5b;
  --model-font: Georgia, serif;
}
```
