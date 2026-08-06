// =========================================
// Regular Expressions
// =========================================

const REGEX = {

    EMAIL:

    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    PHONE:

    /^[6-9]\d{9}$/,

    PASSWORD:

    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,

    OBJECT_ID:

    /^[0-9a-fA-F]{24}$/,

};

module.exports = REGEX;