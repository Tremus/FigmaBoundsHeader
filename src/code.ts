// This file holds the main code for the plugin. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 400);

class PluginError {
    message: string = '';
    constructor(msg: string) {
        this.message = msg;
    }
}

// removes spaces and non alphanumeric characters from names
const cleanString = (str: string): string => {
    let s = str.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '_');
    // prepends a _ if the name begins with a number
    if (/^[0-9]/.test(s)) {
        s = '_' + s;
    }
    return s;
};

// Checks whether or not to skip a node by its name
const isNameValid = (name: string): boolean => !name.startsWith('_');

const numberToFloatString = (num: number): string => (num % 1 == 0 ? `${num}.0f` : `${num}f`);

const HEADER_START = `#ifndef FIGMABOUNDSHEADER_H
#define FIGMABOUNDSHEADER_H
// clang-format off
#ifdef __cplusplus
extern "C" {
#endif\n`;

const HEADER_END = `#ifdef __cplusplus
}
#endif
// clang-format on
#endif // FIGMABOUNDSHEADER_H`;

function generate() {
    let text = HEADER_START;

    const parseBoundsRecursive = (prefix: string, node: SceneNode): void => {
        const bounds: Array<number> = [node.x, node.y, node.width, node.height];

        const varname = `${prefix}_${cleanString(node.name)}`;
        const x = numberToFloatString(node.x);
        const y = numberToFloatString(node.y);
        const w = numberToFloatString(node.width);
        const h = numberToFloatString(node.height);
        text += `static const float ${varname}[4] = {${x}, ${y}, ${w}, ${h}};\n`;

        if ('children' in node) {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];

                if (!isNameValid(child.name)) continue;

                parseBoundsRecursive(`${varname}_`, child);
            }
        }
    };

    const { selection } = figma.currentPage;
    if (selection.length === 0) {
        throw new PluginError('You must select at least 1 node/group!');
    }
    for (let [idx, sceneNode] of selection.entries()) {
        parseBoundsRecursive('fbh', sceneNode);
    }

    text += HEADER_END;
    figma.ui.postMessage({ type: 'saveText', payload: text });
}

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.

    try {
        // throw new PluginError('ayylmao');
        if (msg.type === 'generate') {
            generate();
        }
    } catch (err) {
        if (err instanceof PluginError) {
            figma.ui.postMessage({ type: 'error', payload: err.message });
        }
    }

    if (msg.type === 'cancel') {
        // Make sure to close the plugin when you're done. Otherwise the plugin will
        // keep running, which shows the cancel button at the bottom of the screen.
        figma.closePlugin();
    }
};
