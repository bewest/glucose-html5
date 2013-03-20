---
title: "HTML5 Boilerplate"
name: "demo"
layout: article
---

# Main heading markdown

## subheading from markdown

### v0.1.0 : August 10th, 2011

### v0.1.0 HIGHLIGHTS

#### Dicuss

normalize.css retains useful browser defaults and includes several common fixes
to improve cross-browser (desktop and mobile) styling consistency.

Lots of research has gone into normalize, verifying what are the default user
agent styles provided by each browser. We can very specifically change only the
ones we need to instead of the bulldozer approach.

##### Why this is great news:

* Who likes being so damn redundant and declaring: em, i { font-style: italic;
* } By using normalization instead of a reset + building up default styles, we
* use less styles and save bytes Less noise in your dev tools: when debugging,
* you don't have to trawl through every reset selector to reach the actual
* style that is causing the issue.  More details here:
* http://necolas.github.com/normalize.css/


#### PROMPT CHROME FRAME FOR IE6
* With the latest release of Chrome frame which does not require admin access
  to be installed, we felt it was a good time to prompt IE 6 users to install
  Chrome Frame. (Using protocol-relative url and exact version for higher
  expires headers)


####BUILD SCRIPT++: Faster, @import inlining, appcache generation
*  If 15 seconds was too long to wait before, you'll be happy with the changes. Via a new "intermediate" folder, we cut down build time by 80% or more.
*  If you use <code>@import</code>s in your CSS to author in multiple files, the build script will inline all these together. This way, you have a maintainable authoring experience, and still a highly performant production version.
* Making an app that works offline is a badge of honor. Now with a flick of a config switch, the H5BP build script can autogenerate your cache manifest file with all the right info and wire it up. It'll also keep the manifest revved as you deploy new changes.

##### ADDING RESPOND.JS
* Add respond.js as a shift to a responsive approach. Updated it to improved, comment-free version which would enable IEs to also apply styles using media queries.


#### PNGFIX & HANDHELD REMOVED
* Remove handheld.css as we do not think it was useful among the diverse feature phones
* We feel tools like imagealpha and pngquant are more useful than using stopgap fixes like belatedpng.

## Releases

There are two releases: a documented release (which is exactly what you see
here), and a "stripped" release (with most of the descriptive comments stripped
out).

Watch the [current tickets](http://github.com/paulirish/html5-boilerplate/issues) to view the areas of active development.

