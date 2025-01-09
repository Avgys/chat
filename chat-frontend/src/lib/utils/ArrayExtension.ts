export function extendArrayPrototype() {}

console.log('loaded')
Array.prototype.remove = function (value) {
    const index = this.indexOf(value);
    if (index === -1)
        return null;

    return this.splice(index, 1)[1];
};