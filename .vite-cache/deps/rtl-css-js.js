import "./chunk-2TUXWMP5.js";

// node_modules/rtl-css-js/dist/esm/convert-9768a965.js
function arrayToObject(array) {
  return array.reduce(function(obj, _ref) {
    var prop1 = _ref[0], prop2 = _ref[1];
    obj[prop1] = prop2;
    obj[prop2] = prop1;
    return obj;
  }, {});
}
function isBoolean(val) {
  return typeof val === "boolean";
}
function isFunction(val) {
  return typeof val === "function";
}
function isNumber(val) {
  return typeof val === "number";
}
function isNullOrUndefined(val) {
  return val === null || typeof val === "undefined";
}
function isObject(val) {
  return val && typeof val === "object";
}
function isString(val) {
  return typeof val === "string";
}
function includes(inclusive, inclusee) {
  return inclusive.indexOf(inclusee) !== -1;
}
function flipSign(value) {
  if (parseFloat(value) === 0) {
    return value;
  }
  if (value[0] === "-") {
    return value.slice(1);
  }
  return "-" + value;
}
function flipTransformSign(match, prefix, offset, suffix) {
  return prefix + flipSign(offset) + suffix;
}
function calculateNewBackgroundPosition(value) {
  var idx = value.indexOf(".");
  if (idx === -1) {
    value = 100 - parseFloat(value) + "%";
  } else {
    var len = value.length - idx - 2;
    value = 100 - parseFloat(value);
    value = value.toFixed(len) + "%";
  }
  return value;
}
function getValuesAsList(value) {
  return value.replace(/ +/g, " ").split(" ").map(function(i) {
    return i.trim();
  }).filter(Boolean).reduce(function(_ref2, item) {
    var list = _ref2.list, state = _ref2.state;
    var openParansCount = (item.match(/\(/g) || []).length;
    var closedParansCount = (item.match(/\)/g) || []).length;
    if (state.parensDepth > 0) {
      list[list.length - 1] = list[list.length - 1] + " " + item;
    } else {
      list.push(item);
    }
    state.parensDepth += openParansCount - closedParansCount;
    return {
      list,
      state
    };
  }, {
    list: [],
    state: {
      parensDepth: 0
    }
  }).list;
}
function handleQuartetValues(value) {
  var splitValues = getValuesAsList(value);
  if (splitValues.length <= 3 || splitValues.length > 4) {
    return value;
  }
  var top = splitValues[0], right = splitValues[1], bottom = splitValues[2], left = splitValues[3];
  return [top, left, bottom, right].join(" ");
}
function canConvertValue(value) {
  return !isBoolean(value) && !isNullOrUndefined(value);
}
function splitShadow(value) {
  var shadows = [];
  var start = 0;
  var end = 0;
  var rgba = false;
  while (end < value.length) {
    if (!rgba && value[end] === ",") {
      shadows.push(value.substring(start, end).trim());
      end++;
      start = end;
    } else if (value[end] === "(") {
      rgba = true;
      end++;
    } else if (value[end] === ")") {
      rgba = false;
      end++;
    } else {
      end++;
    }
  }
  if (start != end) {
    shadows.push(value.substring(start, end + 1));
  }
  return shadows;
}
var propertyValueConverters = {
  padding: function padding(_ref) {
    var value = _ref.value;
    if (isNumber(value)) {
      return value;
    }
    return handleQuartetValues(value);
  },
  textShadow: function textShadow(_ref2) {
    var value = _ref2.value;
    var flippedShadows = splitShadow(value).map(function(shadow) {
      return shadow.replace(/(^|\s)(-*)([.|\d]+)/, function(match, whiteSpace, negative, number) {
        if (number === "0") {
          return match;
        }
        var doubleNegative = negative === "" ? "-" : "";
        return "" + whiteSpace + doubleNegative + number;
      });
    });
    return flippedShadows.join(",");
  },
  borderColor: function borderColor(_ref3) {
    var value = _ref3.value;
    return handleQuartetValues(value);
  },
  borderRadius: function borderRadius(_ref4) {
    var value = _ref4.value;
    if (isNumber(value)) {
      return value;
    }
    if (includes(value, "/")) {
      var _value$split = value.split("/"), radius1 = _value$split[0], radius2 = _value$split[1];
      var convertedRadius1 = propertyValueConverters.borderRadius({
        value: radius1.trim()
      });
      var convertedRadius2 = propertyValueConverters.borderRadius({
        value: radius2.trim()
      });
      return convertedRadius1 + " / " + convertedRadius2;
    }
    var splitValues = getValuesAsList(value);
    switch (splitValues.length) {
      case 2: {
        return splitValues.reverse().join(" ");
      }
      case 4: {
        var topLeft = splitValues[0], topRight = splitValues[1], bottomRight = splitValues[2], bottomLeft = splitValues[3];
        return [topRight, topLeft, bottomLeft, bottomRight].join(" ");
      }
      default: {
        return value;
      }
    }
  },
  background: function background(_ref5) {
    var value = _ref5.value, valuesToConvert2 = _ref5.valuesToConvert, isRtl = _ref5.isRtl, bgImgDirectionRegex2 = _ref5.bgImgDirectionRegex, bgPosDirectionRegex2 = _ref5.bgPosDirectionRegex;
    if (isNumber(value)) {
      return value;
    }
    var backgroundPositionValue = value.replace(/(url\(.*?\))|(rgba?\(.*?\))|(hsl\(.*?\))|(#[a-fA-F0-9]+)|((^| )(\D)+( |$))/g, "").trim();
    value = value.replace(backgroundPositionValue, propertyValueConverters.backgroundPosition({
      value: backgroundPositionValue,
      valuesToConvert: valuesToConvert2,
      isRtl,
      bgPosDirectionRegex: bgPosDirectionRegex2
    }));
    return propertyValueConverters.backgroundImage({
      value,
      valuesToConvert: valuesToConvert2,
      bgImgDirectionRegex: bgImgDirectionRegex2
    });
  },
  backgroundImage: function backgroundImage(_ref6) {
    var value = _ref6.value, valuesToConvert2 = _ref6.valuesToConvert, bgImgDirectionRegex2 = _ref6.bgImgDirectionRegex;
    if (!includes(value, "url(") && !includes(value, "linear-gradient(")) {
      return value;
    }
    return value.replace(bgImgDirectionRegex2, function(match, g1, group2) {
      return match.replace(group2, valuesToConvert2[group2]);
    });
  },
  backgroundPosition: function backgroundPosition(_ref7) {
    var value = _ref7.value, valuesToConvert2 = _ref7.valuesToConvert, isRtl = _ref7.isRtl, bgPosDirectionRegex2 = _ref7.bgPosDirectionRegex;
    return value.replace(isRtl ? /^((-|\d|\.)+%)/ : null, function(match, group) {
      return calculateNewBackgroundPosition(group);
    }).replace(bgPosDirectionRegex2, function(match) {
      return valuesToConvert2[match];
    });
  },
  backgroundPositionX: function backgroundPositionX(_ref8) {
    var value = _ref8.value, valuesToConvert2 = _ref8.valuesToConvert, isRtl = _ref8.isRtl, bgPosDirectionRegex2 = _ref8.bgPosDirectionRegex;
    if (isNumber(value)) {
      return value;
    }
    return propertyValueConverters.backgroundPosition({
      value,
      valuesToConvert: valuesToConvert2,
      isRtl,
      bgPosDirectionRegex: bgPosDirectionRegex2
    });
  },
  transition: function transition(_ref9) {
    var value = _ref9.value, propertiesToConvert2 = _ref9.propertiesToConvert;
    return value.split(/,\s*/g).map(function(transition2) {
      var values = transition2.split(" ");
      values[0] = propertiesToConvert2[values[0]] || values[0];
      return values.join(" ");
    }).join(", ");
  },
  transitionProperty: function transitionProperty(_ref10) {
    var value = _ref10.value, propertiesToConvert2 = _ref10.propertiesToConvert;
    return value.split(/,\s*/g).map(function(prop) {
      return propertiesToConvert2[prop] || prop;
    }).join(", ");
  },
  transform: function transform(_ref11) {
    var value = _ref11.value;
    var nonAsciiPattern = "[^\\u0020-\\u007e]";
    var escapePattern = "(?:(?:(?:\\[0-9a-f]{1,6})(?:\\r\\n|\\s)?)|\\\\[^\\r\\n\\f0-9a-f])";
    var signedQuantPattern = "((?:-?" + ("(?:[0-9]*\\.[0-9]+|[0-9]+)(?:\\s*(?:em|ex|px|cm|mm|in|pt|pc|deg|rad|grad|ms|s|hz|khz|%)|" + ("-?" + ("(?:[_a-z]|" + nonAsciiPattern + "|" + escapePattern + ")") + ("(?:[_a-z0-9-]|" + nonAsciiPattern + "|" + escapePattern + ")") + "*") + ")?") + ")|(?:inherit|auto))";
    var translateXRegExp = new RegExp("(translateX\\s*\\(\\s*)" + signedQuantPattern + "(\\s*\\))", "gi");
    var translateRegExp = new RegExp("(translate\\s*\\(\\s*)" + signedQuantPattern + "((?:\\s*,\\s*" + signedQuantPattern + "){0,1}\\s*\\))", "gi");
    var translate3dRegExp = new RegExp("(translate3d\\s*\\(\\s*)" + signedQuantPattern + "((?:\\s*,\\s*" + signedQuantPattern + "){0,2}\\s*\\))", "gi");
    var rotateRegExp = new RegExp("(rotate[ZY]?\\s*\\(\\s*)" + signedQuantPattern + "(\\s*\\))", "gi");
    return value.replace(translateXRegExp, flipTransformSign).replace(translateRegExp, flipTransformSign).replace(translate3dRegExp, flipTransformSign).replace(rotateRegExp, flipTransformSign);
  }
};
propertyValueConverters.objectPosition = propertyValueConverters.backgroundPosition;
propertyValueConverters.margin = propertyValueConverters.padding;
propertyValueConverters.borderWidth = propertyValueConverters.padding;
propertyValueConverters.boxShadow = propertyValueConverters.textShadow;
propertyValueConverters.webkitBoxShadow = propertyValueConverters.boxShadow;
propertyValueConverters.mozBoxShadow = propertyValueConverters.boxShadow;
propertyValueConverters.WebkitBoxShadow = propertyValueConverters.boxShadow;
propertyValueConverters.MozBoxShadow = propertyValueConverters.boxShadow;
propertyValueConverters.borderStyle = propertyValueConverters.borderColor;
propertyValueConverters.webkitTransform = propertyValueConverters.transform;
propertyValueConverters.mozTransform = propertyValueConverters.transform;
propertyValueConverters.WebkitTransform = propertyValueConverters.transform;
propertyValueConverters.MozTransform = propertyValueConverters.transform;
propertyValueConverters.transformOrigin = propertyValueConverters.backgroundPosition;
propertyValueConverters.webkitTransformOrigin = propertyValueConverters.transformOrigin;
propertyValueConverters.mozTransformOrigin = propertyValueConverters.transformOrigin;
propertyValueConverters.WebkitTransformOrigin = propertyValueConverters.transformOrigin;
propertyValueConverters.MozTransformOrigin = propertyValueConverters.transformOrigin;
propertyValueConverters.webkitTransition = propertyValueConverters.transition;
propertyValueConverters.mozTransition = propertyValueConverters.transition;
propertyValueConverters.WebkitTransition = propertyValueConverters.transition;
propertyValueConverters.MozTransition = propertyValueConverters.transition;
propertyValueConverters.webkitTransitionProperty = propertyValueConverters.transitionProperty;
propertyValueConverters.mozTransitionProperty = propertyValueConverters.transitionProperty;
propertyValueConverters.WebkitTransitionProperty = propertyValueConverters.transitionProperty;
propertyValueConverters.MozTransitionProperty = propertyValueConverters.transitionProperty;
propertyValueConverters["text-shadow"] = propertyValueConverters.textShadow;
propertyValueConverters["border-color"] = propertyValueConverters.borderColor;
propertyValueConverters["border-radius"] = propertyValueConverters.borderRadius;
propertyValueConverters["background-image"] = propertyValueConverters.backgroundImage;
propertyValueConverters["background-position"] = propertyValueConverters.backgroundPosition;
propertyValueConverters["background-position-x"] = propertyValueConverters.backgroundPositionX;
propertyValueConverters["object-position"] = propertyValueConverters.objectPosition;
propertyValueConverters["border-width"] = propertyValueConverters.padding;
propertyValueConverters["box-shadow"] = propertyValueConverters.textShadow;
propertyValueConverters["-webkit-box-shadow"] = propertyValueConverters.textShadow;
propertyValueConverters["-moz-box-shadow"] = propertyValueConverters.textShadow;
propertyValueConverters["border-style"] = propertyValueConverters.borderColor;
propertyValueConverters["-webkit-transform"] = propertyValueConverters.transform;
propertyValueConverters["-moz-transform"] = propertyValueConverters.transform;
propertyValueConverters["transform-origin"] = propertyValueConverters.transformOrigin;
propertyValueConverters["-webkit-transform-origin"] = propertyValueConverters.transformOrigin;
propertyValueConverters["-moz-transform-origin"] = propertyValueConverters.transformOrigin;
propertyValueConverters["-webkit-transition"] = propertyValueConverters.transition;
propertyValueConverters["-moz-transition"] = propertyValueConverters.transition;
propertyValueConverters["transition-property"] = propertyValueConverters.transitionProperty;
propertyValueConverters["-webkit-transition-property"] = propertyValueConverters.transitionProperty;
propertyValueConverters["-moz-transition-property"] = propertyValueConverters.transitionProperty;
var propertiesToConvert = arrayToObject([
  ["paddingLeft", "paddingRight"],
  ["marginLeft", "marginRight"],
  ["left", "right"],
  ["borderLeft", "borderRight"],
  ["borderLeftColor", "borderRightColor"],
  ["borderLeftStyle", "borderRightStyle"],
  ["borderLeftWidth", "borderRightWidth"],
  ["borderTopLeftRadius", "borderTopRightRadius"],
  ["borderBottomLeftRadius", "borderBottomRightRadius"],
  // kebab-case versions
  ["padding-left", "padding-right"],
  ["margin-left", "margin-right"],
  ["border-left", "border-right"],
  ["border-left-color", "border-right-color"],
  ["border-left-style", "border-right-style"],
  ["border-left-width", "border-right-width"],
  ["border-top-left-radius", "border-top-right-radius"],
  ["border-bottom-left-radius", "border-bottom-right-radius"]
]);
var propsToIgnore = ["content"];
var valuesToConvert = arrayToObject([["ltr", "rtl"], ["left", "right"], ["w-resize", "e-resize"], ["sw-resize", "se-resize"], ["nw-resize", "ne-resize"]]);
var bgImgDirectionRegex = new RegExp("(^|\\W|_)((ltr)|(rtl)|(left)|(right))(\\W|_|$)", "g");
var bgPosDirectionRegex = new RegExp("(left)|(right)");
function convert(object) {
  return Object.keys(object).reduce(function(newObj, originalKey) {
    var originalValue = object[originalKey];
    if (isString(originalValue)) {
      originalValue = originalValue.trim();
    }
    if (includes(propsToIgnore, originalKey)) {
      newObj[originalKey] = originalValue;
      return newObj;
    }
    var _convertProperty = convertProperty(originalKey, originalValue), key = _convertProperty.key, value = _convertProperty.value;
    newObj[key] = value;
    return newObj;
  }, Array.isArray(object) ? [] : {});
}
function convertProperty(originalKey, originalValue) {
  var isNoFlip = /\/\*\s?@noflip\s?\*\//.test(originalValue);
  var key = isNoFlip ? originalKey : getPropertyDoppelganger(originalKey);
  var value = isNoFlip ? originalValue : getValueDoppelganger(key, originalValue);
  return {
    key,
    value
  };
}
function getPropertyDoppelganger(property) {
  return propertiesToConvert[property] || property;
}
function getValueDoppelganger(key, originalValue) {
  if (!canConvertValue(originalValue)) {
    return originalValue;
  }
  if (isObject(originalValue)) {
    return convert(originalValue);
  }
  var isNum = isNumber(originalValue);
  var isFunc = isFunction(originalValue);
  var importantlessValue = isNum || isFunc ? originalValue : originalValue.replace(/ !important.*?$/, "");
  var isImportant = !isNum && importantlessValue.length !== originalValue.length;
  var valueConverter = propertyValueConverters[key];
  var newValue;
  if (valueConverter) {
    newValue = valueConverter({
      value: importantlessValue,
      valuesToConvert,
      propertiesToConvert,
      isRtl: true,
      bgImgDirectionRegex,
      bgPosDirectionRegex
    });
  } else {
    newValue = valuesToConvert[importantlessValue] || importantlessValue;
  }
  if (isImportant) {
    return newValue + " !important";
  }
  return newValue;
}

// node_modules/rtl-css-js/dist/esm/index.js
var esm_default = convert;
export {
  esm_default as default
};
//# sourceMappingURL=rtl-css-js.js.map
