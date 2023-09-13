"use strict";

// https://dmitripavlutin.com/javascript-enum/
export function Enum(baseEnum) {
    return new Proxy(baseEnum, {
        get(target, name) {
            if (!baseEnum.hasOwnProperty(name)) {
                throw new Error(`"${name}" value does not exist in the enum`);
            }
            return baseEnum[name];
        },
        set(target, name, value) {
            throw new Error('Cannot add a new value to the enum');
        }
    });
}

export function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
        enumObject[val] = val;
    }
    return Object.freeze(enumObject);
}

// // { Up: 'Up', Down: 'Down', Left: 'Left', Right: 'Right' }
//    createEnum(['Up', 'Down', 'Left', 'Right']);
