---
title: Cloudinary Media Optimizer once again
description: Throw an image at it and walk away with a responsive image.
date: 2022-01-07
tags:
- Cloudinary
- Sunnny
- Images
layout: layouts/post.njk
---
Once again I am testing the [Cloudinary Media Optimizer](https://cloudinary.com/products/media_optimizer). I love it, but you can do a lot more with a Cloudinary URL.
I think it works best from Google's Cloud Storage and by itself, via a proxy to the media you already have for your site.
I also noticed you might get an error message if your media excedes 2 MB, well not so much an error message but a flat it won't work.

Below:
The standard fetch the image and process it for auto format and quality plus resolution match to the user's viewport size.


Like an animal I had to use the old fashioned Cloudinary URL for this test image.

    https://res.cloudinary.com/paulportfolio/image/upload/f_auto,q_auto,w_800,c_scale/v1641590401/mountain.jpg


![A mountain](https://res.cloudinary.com/paulportfolio/image/upload/f_auto,q_auto,w_800,c_scale/v1641590401/mountain.jpg)

![A moose](https://res.cloudinary.com/paulportfolio/image/upload/f_auto,q_auto,w_800,c_scale/v1639321561/moose.jpg)
