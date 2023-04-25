# FigmaBoundsHeader

A plugin for [Figma](https://www.figma.com/).

Scans the dimensions of each selected node and writes all the x/y/width/height info in a big `C` friendly `.h` file

If you use [juce](https://github.com/juce-framework/JUCE) you may be interested the original [repo](https://github.com/Tremus/CSS2JUCE)

Example:

```C
#pragma once
extern const float fbh_Navbar[4];
extern const float fbh_Navbar__Meter[4];
extern const float fbh_Navbar__Meter__Vector80[4];
#ifdef FIGMABOUNDSHEADER_IMPL
const float fbh_Navbar[4] = {0, 0, 875, 44};
const float fbh_Navbar__Meter[4] = {552, 8, 112, 30};
const float fbh_Navbar__Meter__Vector80[4] = {635, 33, 12, 5};
#endif // FIGMABOUNDSHEADER_IMPL
```

In the above example I had selected a _group_ named **Navbar**. This group had a child node named **Meter** which is also a group. Meter had a child node named **Vector80** which is a custom shape that I drew.

The double underscore (`"__"`) indicates the z-index of the node.

Spaces and special characters in the names of your nodes simply get erased.

No checking is done for duplicate names of nodes, so be careful how you name them.

If you wish to skip a node, prefix the name of the node with an underscore eg. rename `Vector80` to `_Vector80` will skip adding the info to our header.
