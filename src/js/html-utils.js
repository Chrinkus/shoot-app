/* unpackForm(formData)
 *
 * formData is the contents of a form element's `.elements` property. This is
 * an HTMLFormCollection object with multiple references to the same data. The
 * spread operator removes numeric indexes and the filter removes non-named
 * inputs.
 *
 * Returns an object of form field data referenced by 'name'.
 */
export function unpackForm(formData) {
    const fields = [...formData].filter(d => d.name);

    return fields.reduce((obj, f) => {
        obj[f.name] = f.value;

        return obj;
    }, {});
}

/* toggleAttribute(ele, ...attributes)
 *
 * ele is a target HTML element to toggle attributes on
 * attributes is an array of desired attributes to toggle
 *
 * returns undefined
 */
export function toggleAttribute(ele, ...attributes) {
    const classes = ele.classList;

    attributes.forEach(att => {
        classes.contains(att)
            ? classes.remove(att)
            : classes.add(att);
    });
}

/* clearNode(node)
 *
 * node is emptied of all children
 *
 * returns undefined
 */
export function clearNode(node) {

    while(node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

/* createNode(nodeType, ...args)
 *
 * nodeType is a string indicating the type of HTML element to create
 * args is an array of strings to append as text nodes to the created node
 *
 * returns the created node
 */
export function createNode(nodeType, ...args) {
    const node = document.createElement(nodeType);

    args.forEach(arg => {
        node.appendChild(document.createTextNode(arg));
    });

    return node;
}
