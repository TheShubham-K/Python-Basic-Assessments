(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.vl = {})));
}(this, (function (exports) { 'use strict';

  function accessor(fn, fields, name) {
    fn.fields = fields || [];
    fn.fname = name;
    return fn;
  }

  function error(message) {
    throw Error(message);
  }

  function splitAccessPath(p) {
    var path = [],
        q = null,
        b = 0,
        n = p.length,
        s = '',
        i, j, c;

    p = p + '';

    function push() {
      path.push(s + p.substring(i, j));
      s = '';
      i = j + 1;
    }

    for (i=j=0; j<n; ++j) {
      c = p[j];
      if (c === '\\') {
        s += p.substring(i, j);
        i = ++j;
      } else if (c === q) {
        push();
        q = null;
        b = -1;
      } else if (q) {
        continue;
      } else if (i === b && c === '"') {
        i = j + 1;
        q = c;
      } else if (i === b && c === "'") {
        i = j + 1;
        q = c;
      } else if (c === '.' && !b) {
        if (j > i) {
          push();
        } else {
          i = j + 1;
        }
      } else if (c === '[') {
        if (j > i) push();
        b = i = j + 1;
      } else if (c === ']') {
        if (!b) error('Access path missing open bracket: ' + p);
        if (b > 0) push();
        b = 0;
        i = j + 1;
      }
    }

    if (b) error('Access path missing closing bracket: ' + p);
    if (q) error('Access path missing closing quote: ' + p);

    if (j > i) {
      j++;
      push();
    }

    return path;
  }

  var isArray = Array.isArray;

  function isObject(_) {
    return _ === Object(_);
  }

  function isString(_) {
    return typeof _ === 'string';
  }

  function $(x) {
    return isArray(x) ? '[' + x.map($) + ']'
      : isObject(x) || isString(x) ?
        // Output valid JSON and JS source strings.
        // See http://timelessrepo.com/json-isnt-a-javascript-subset
        JSON.stringify(x).replace('\u2028','\\u2028').replace('\u2029', '\\u2029')
      : x;
  }

  function field(field, name) {
    var path = splitAccessPath(field),
        code = 'return _[' + path.map($).join('][') + '];';

    return accessor(
      Function('_', code),
      [(field = path.length===1 ? path[0] : field)],
      name || field
    );
  }

  var empty = [];

  var id = field('id');

  var identity = accessor(function(_) { return _; }, empty, 'identity');

  var zero = accessor(function() { return 0; }, empty, 'zero');

  var one = accessor(function() { return 1; }, empty, 'one');

  var truthy = accessor(function() { return true; }, empty, 'true');

  var falsy = accessor(function() { return false; }, empty, 'false');

  function log(method, level, input) {
    var args = [level].concat([].slice.call(input));
    console[method].apply(console, args); // eslint-disable-line no-console
  }

  var None  = 0;
  var Error$1 = 1;
  var Warn  = 2;
  var Info  = 3;
  var Debug = 4;

  function logger(_) {
    var level = _ || None;
    return {
      level: function(_) {
        if (arguments.length) {
          level = +_;
          return this;
        } else {
          return level;
        }
      },
      error: function() {
        if (level >= Error$1) log('error', 'ERROR', arguments);
        return this;
      },
      warn: function() {
        if (level >= Warn) log('warn', 'WARN', arguments);
        return this;
      },
      info: function() {
        if (level >= Info) log('log', 'INFO', arguments);
        return this;
      },
      debug: function() {
        if (level >= Debug) log('log', 'DEBUG', arguments);
        return this;
      }
    }
  }

  function isBoolean(_) {
    return typeof _ === 'boolean';
  }

  function isNumber(_) {
    return typeof _ === 'number';
  }

  function toSet(_) {
    for (var s={}, i=0, n=_.length; i<n; ++i) s[_[i]] = true;
    return s;
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  };

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
              t[p[i]] = s[p[i]];
      return t;
  }

  var at, // The index of the current character
      ch, // The current character
      escapee = {
          '"':  '"',
          '\\': '\\',
          '/':  '/',
          b:    '\b',
          f:    '\f',
          n:    '\n',
          r:    '\r',
          t:    '\t'
      },
      text,

      error$1 = function (m) {
          // Call error when something is wrong.
          throw {
              name:    'SyntaxError',
              message: m,
              at:      at,
              text:    text
          };
      },
      
      next = function (c) {
          // If a c parameter is provided, verify that it matches the current character.
          if (c && c !== ch) {
              error$1("Expected '" + c + "' instead of '" + ch + "'");
          }
          
          // Get the next character. When there are no more characters,
          // return the empty string.
          
          ch = text.charAt(at);
          at += 1;
          return ch;
      },
      
      number = function () {
          // Parse a number value.
          var number,
              string = '';
          
          if (ch === '-') {
              string = '-';
              next('-');
          }
          while (ch >= '0' && ch <= '9') {
              string += ch;
              next();
          }
          if (ch === '.') {
              string += '.';
              while (next() && ch >= '0' && ch <= '9') {
                  string += ch;
              }
          }
          if (ch === 'e' || ch === 'E') {
              string += ch;
              next();
              if (ch === '-' || ch === '+') {
                  string += ch;
                  next();
              }
              while (ch >= '0' && ch <= '9') {
                  string += ch;
                  next();
              }
          }
          number = +string;
          if (!isFinite(number)) {
              error$1("Bad number");
          } else {
              return number;
          }
      },
      
      string = function () {
          // Parse a string value.
          var hex,
              i,
              string = '',
              uffff;
          
          // When parsing for string values, we must look for " and \ characters.
          if (ch === '"') {
              while (next()) {
                  if (ch === '"') {
                      next();
                      return string;
                  } else if (ch === '\\') {
                      next();
                      if (ch === 'u') {
                          uffff = 0;
                          for (i = 0; i < 4; i += 1) {
                              hex = parseInt(next(), 16);
                              if (!isFinite(hex)) {
                                  break;
                              }
                              uffff = uffff * 16 + hex;
                          }
                          string += String.fromCharCode(uffff);
                      } else if (typeof escapee[ch] === 'string') {
                          string += escapee[ch];
                      } else {
                          break;
                      }
                  } else {
                      string += ch;
                  }
              }
          }
          error$1("Bad string");
      },

      white = function () {

  // Skip whitespace.

          while (ch && ch <= ' ') {
              next();
          }
      },

      word = function () {

  // true, false, or null.

          switch (ch) {
          case 't':
              next('t');
              next('r');
              next('u');
              next('e');
              return true;
          case 'f':
              next('f');
              next('a');
              next('l');
              next('s');
              next('e');
              return false;
          case 'n':
              next('n');
              next('u');
              next('l');
              next('l');
              return null;
          }
          error$1("Unexpected '" + ch + "'");
      },

      value,  // Place holder for the value function.

      array$1 = function () {

  // Parse an array value.

          var array = [];

          if (ch === '[') {
              next('[');
              white();
              if (ch === ']') {
                  next(']');
                  return array;   // empty array
              }
              while (ch) {
                  array.push(value());
                  white();
                  if (ch === ']') {
                      next(']');
                      return array;
                  }
                  next(',');
                  white();
              }
          }
          error$1("Bad array");
      },

      object = function () {

  // Parse an object value.

          var key,
              object = {};

          if (ch === '{') {
              next('{');
              white();
              if (ch === '}') {
                  next('}');
                  return object;   // empty object
              }
              while (ch) {
                  key = string();
                  white();
                  next(':');
                  if (Object.hasOwnProperty.call(object, key)) {
                      error$1('Duplicate key "' + key + '"');
                  }
                  object[key] = value();
                  white();
                  if (ch === '}') {
                      next('}');
                      return object;
                  }
                  next(',');
                  white();
              }
          }
          error$1("Bad object");
      };

  value = function () {

  // Parse a JSON value. It could be an object, an array, a string, a number,
  // or a word.

      white();
      switch (ch) {
      case '{':
          return object();
      case '[':
          return array$1();
      case '"':
          return string();
      case '-':
          return number();
      default:
          return ch >= '0' && ch <= '9' ? number() : word();
      }
  };

  // Return the json_parse function. It will have access to all of the above
  // functions and variables.

  var parse = function (source, reviver) {
      var result;
      
      text = source;
      at = 0;
      ch = ' ';
      result = value();
      white();
      if (ch) {
          error$1("Syntax error");
      }

      // If there is a reviver function, we recursively walk the new structure,
      // passing each name/value pair to the reviver function for possible
      // transformation, starting with a temporary root object that holds the result
      // in an empty key. If there is not a reviver function, we simply return the
      // result.

      return typeof reviver === 'function' ? (function walk(holder, key) {
          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }({'': result}, '')) : result;
  };

  var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;

  function quote(string) {
      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.
      
      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {
      // Produce a string from holder[key].
      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];
      
      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && typeof value === 'object' &&
              typeof value.toJSON === 'function') {
          value = value.toJSON(key);
      }
      
      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.
      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }
      
      // What happens next depends on the value's type.
      switch (typeof value) {
          case 'string':
              return quote(value);
          
          case 'number':
              // JSON numbers must be finite. Encode non-finite numbers as null.
              return isFinite(value) ? String(value) : 'null';
          
          case 'boolean':
          case 'null':
              // If the value is a boolean or null, convert it to a string. Note:
              // typeof null does not produce 'null'. The case is included here in
              // the remote chance that this gets fixed someday.
              return String(value);
              
          case 'object':
              if (!value) return 'null';
              gap += indent;
              partial = [];
              
              // Array.isArray
              if (Object.prototype.toString.apply(value) === '[object Array]') {
                  length = value.length;
                  for (i = 0; i < length; i += 1) {
                      partial[i] = str(i, value) || 'null';
                  }
                  
                  // Join all of the elements together, separated with commas, and
                  // wrap them in brackets.
                  v = partial.length === 0 ? '[]' : gap ?
                      '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                      '[' + partial.join(',') + ']';
                  gap = mind;
                  return v;
              }
              
              // If the replacer is an array, use it to select the members to be
              // stringified.
              if (rep && typeof rep === 'object') {
                  length = rep.length;
                  for (i = 0; i < length; i += 1) {
                      k = rep[i];
                      if (typeof k === 'string') {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              }
              else {
                  // Otherwise, iterate through all of the keys in the object.
                  for (k in value) {
                      if (Object.prototype.hasOwnProperty.call(value, k)) {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              }
              
          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

  var stringify = function (value, replacer, space) {
      var i;
      gap = '';
      indent = '';
      
      // If the space parameter is a number, make an indent string containing that
      // many spaces.
      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }
      }
      // If the space parameter is a string, it will be used as the indent string.
      else if (typeof space === 'string') {
          indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.
      rep = replacer;
      if (replacer && typeof replacer !== 'function'
      && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }
      
      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      return str('', {'': value});
  };

  var parse$1 = parse;
  var stringify$1 = stringify;

  var jsonify = {
  	parse: parse$1,
  	stringify: stringify$1
  };

  var json = typeof JSON !== 'undefined' ? JSON : jsonify;

  var jsonStableStringify = function (obj, opts) {
      if (!opts) opts = {};
      if (typeof opts === 'function') opts = { cmp: opts };
      var space = opts.space || '';
      if (typeof space === 'number') space = Array(space+1).join(' ');
      var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
      var replacer = opts.replacer || function(key, value) { return value; };

      var cmp = opts.cmp && (function (f) {
          return function (node) {
              return function (a, b) {
                  var aobj = { key: a, value: node[a] };
                  var bobj = { key: b, value: node[b] };
                  return f(aobj, bobj);
              };
          };
      })(opts.cmp);

      var seen = [];
      return (function stringify (parent, key, node, level) {
          var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
          var colonSeparator = space ? ': ' : ':';

          if (node && node.toJSON && typeof node.toJSON === 'function') {
              node = node.toJSON();
          }

          node = replacer.call(parent, key, node);

          if (node === undefined) {
              return;
          }
          if (typeof node !== 'object' || node === null) {
              return json.stringify(node);
          }
          if (isArray$1(node)) {
              var out = [];
              for (var i = 0; i < node.length; i++) {
                  var item = stringify(node, i, node[i], level+1) || json.stringify(null);
                  out.push(indent + space + item);
              }
              return '[' + out.join(',') + indent + ']';
          }
          else {
              if (seen.indexOf(node) !== -1) {
                  if (cycles) return json.stringify('__cycle__');
                  throw new TypeError('Converting circular structure to JSON');
              }
              else seen.push(node);

              var keys = objectKeys(node).sort(cmp && cmp(node));
              var out = [];
              for (var i = 0; i < keys.length; i++) {
                  var key = keys[i];
                  var value = stringify(node, key, node[key], level+1);

                  if(!value) continue;

                  var keyValue = json.stringify(key)
                      + colonSeparator
                      + value;
                  out.push(indent + space + keyValue);
              }
              seen.splice(seen.indexOf(node), 1);
              return '{' + out.join(',') + indent + '}';
          }
      })({ '': obj }, '', obj, 0);
  };

  var isArray$1 = Array.isArray || function (x) {
      return {}.toString.call(x) === '[object Array]';
  };

  var objectKeys = Object.keys || function (obj) {
      var has = Object.prototype.hasOwnProperty || function () { return true };
      var keys = [];
      for (var key in obj) {
          if (has.call(obj, key)) keys.push(key);
      }
      return keys;
  };

  var stableStringify_ = /*#__PURE__*/Object.freeze({
    default: jsonStableStringify,
    __moduleExports: jsonStableStringify
  });

  function isLogicalOr(op) {
      return !!op.or;
  }
  function isLogicalAnd(op) {
      return !!op.and;
  }
  function isLogicalNot(op) {
      return !!op.not;
  }
  function forEachLeaf(op, fn) {
      if (isLogicalNot(op)) {
          forEachLeaf(op.not, fn);
      }
      else if (isLogicalAnd(op)) {
          for (var _i = 0, _a = op.and; _i < _a.length; _i++) {
              var subop = _a[_i];
              forEachLeaf(subop, fn);
          }
      }
      else if (isLogicalOr(op)) {
          for (var _b = 0, _c = op.or; _b < _c.length; _b++) {
              var subop = _c[_b];
              forEachLeaf(subop, fn);
          }
      }
      else {
          fn(op);
      }
  }
  function normalizeLogicalOperand(op, normalizer) {
      if (isLogicalNot(op)) {
          return { not: normalizeLogicalOperand(op.not, normalizer) };
      }
      else if (isLogicalAnd(op)) {
          return { and: op.and.map(function (o) { return normalizeLogicalOperand(o, normalizer); }) };
      }
      else if (isLogicalOr(op)) {
          return { or: op.or.map(function (o) { return normalizeLogicalOperand(o, normalizer); }) };
      }
      else {
          return normalizer(op);
      }
  }

  var stableStringify = jsonStableStringify || stableStringify_;
  /**
   * Creates an object composed of the picked object properties.
   *
   * Example:  (from lodash)
   *
   * var object = {'a': 1, 'b': '2', 'c': 3};
   * pick(object, ['a', 'c']);
   * // → {'a': 1, 'c': 3}
   *
   */
  function pick(obj, props) {
      var copy = {};
      for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
          var prop = props_1[_i];
          if (obj.hasOwnProperty(prop)) {
              copy[prop] = obj[prop];
          }
      }
      return copy;
  }
  /**
   * The opposite of _.pick; this method creates an object composed of the own
   * and inherited enumerable string keyed properties of object that are not omitted.
   */
  function omit(obj, props) {
      var copy = __assign({}, obj);
      for (var _i = 0, props_2 = props; _i < props_2.length; _i++) {
          var prop = props_2[_i];
          delete copy[prop];
      }
      return copy;
  }
  /**
   * Converts any object into a string representation that can be consumed by humans.
   */
  var stringify$2 = stableStringify;
  /**
   * Converts any object into a string of limited size, or a number.
   */
  function hash(a) {
      if (isNumber(a)) {
          return a;
      }
      var str = isString(a) ? a : stableStringify(a);
      // short strings can be used as hash directly, longer strings are hashed to reduce memory usage
      if (str.length < 100) {
          return str;
      }
      // from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
      var h = 0;
      for (var i = 0; i < str.length; i++) {
          var char = str.charCodeAt(i);
          h = ((h << 5) - h) + char;
          h = h & h; // Convert to 32bit integer
      }
      return h;
  }
  function contains(array$$1, item) {
      return array$$1.indexOf(item) > -1;
  }
  /** Returns the array without the elements in item */
  function without(array$$1, excludedItems) {
      return array$$1.filter(function (item) { return !contains(excludedItems, item); });
  }
  function union(array$$1, other) {
      return array$$1.concat(without(other, array$$1));
  }
  /**
   * Returns true if any item returns true.
   */
  function some(arr, f) {
      var i = 0;
      for (var k = 0; k < arr.length; k++) {
          if (f(arr[k], k, i++)) {
              return true;
          }
      }
      return false;
  }
  /**
   * Returns true if all items return true.
   */
  function every(arr, f) {
      var i = 0;
      for (var k = 0; k < arr.length; k++) {
          if (!f(arr[k], k, i++)) {
              return false;
          }
      }
      return true;
  }
  function flatten(arrays) {
      return [].concat.apply([], arrays);
  }
  /**
   * recursively merges src into dest
   */
  function mergeDeep(dest) {
      var src = [];
      for (var _i = 1; _i < arguments.length; _i++) {
          src[_i - 1] = arguments[_i];
      }
      for (var _a = 0, src_1 = src; _a < src_1.length; _a++) {
          var s = src_1[_a];
          dest = deepMerge_(dest, s);
      }
      return dest;
  }
  // recursively merges src into dest
  function deepMerge_(dest, src) {
      if (typeof src !== 'object' || src === null) {
          return dest;
      }
      for (var p in src) {
          if (!src.hasOwnProperty(p)) {
              continue;
          }
          if (src[p] === undefined) {
              continue;
          }
          if (typeof src[p] !== 'object' || isArray(src[p]) || src[p] === null) {
              dest[p] = src[p];
          }
          else if (typeof dest[p] !== 'object' || dest[p] === null) {
              dest[p] = mergeDeep(isArray(src[p].constructor) ? [] : {}, src[p]);
          }
          else {
              mergeDeep(dest[p], src[p]);
          }
      }
      return dest;
  }
  function unique(values, f) {
      var results = [];
      var u = {};
      var v;
      for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
          var val = values_1[_i];
          v = f(val);
          if (v in u) {
              continue;
          }
          u[v] = 1;
          results.push(val);
      }
      return results;
  }
  /**
   * Returns true if the two dictionaries disagree. Applies only to defined values.
   */
  function differ(dict, other) {
      for (var key$$1 in dict) {
          if (dict.hasOwnProperty(key$$1)) {
              if (other[key$$1] && dict[key$$1] && other[key$$1] !== dict[key$$1]) {
                  return true;
              }
          }
      }
      return false;
  }
  function hasIntersection(a, b) {
      for (var key$$1 in a) {
          if (key$$1 in b) {
              return true;
          }
      }
      return false;
  }
  function isNumeric(num) {
      return !isNaN(num);
  }
  function differArray(array$$1, other) {
      if (array$$1.length !== other.length) {
          return true;
      }
      array$$1.sort();
      other.sort();
      for (var i = 0; i < array$$1.length; i++) {
          if (other[i] !== array$$1[i]) {
              return true;
          }
      }
      return false;
  }
  // This is a stricter version of Object.keys but with better types. See https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208
  var keys = Object.keys;
  function vals(x) {
      var _vals = [];
      for (var k in x) {
          if (x.hasOwnProperty(k)) {
              _vals.push(x[k]);
          }
      }
      return _vals;
  }
  function flagKeys(f) {
      return keys(f);
  }
  function duplicate(obj) {
      return JSON.parse(JSON.stringify(obj));
  }
  function isBoolean$1(b) {
      return b === true || b === false;
  }
  /**
   * Convert a string into a valid variable name
   */
  function varName(s) {
      // Replace non-alphanumeric characters (anything besides a-zA-Z0-9_) with _
      var alphanumericS = s.replace(/\W/g, '_');
      // Add _ if the string has leading numbers.
      return (s.match(/^\d+/) ? '_' : '') + alphanumericS;
  }
  function logicalExpr(op, cb) {
      if (isLogicalNot(op)) {
          return '!(' + logicalExpr(op.not, cb) + ')';
      }
      else if (isLogicalAnd(op)) {
          return '(' + op.and.map(function (and) { return logicalExpr(and, cb); }).join(') && (') + ')';
      }
      else if (isLogicalOr(op)) {
          return '(' + op.or.map(function (or) { return logicalExpr(or, cb); }).join(') || (') + ')';
      }
      else {
          return cb(op);
      }
  }
  /**
   * Delete nested property of an object, and delete the ancestors of the property if they become empty.
   */
  function deleteNestedProperty(obj, orderedProps) {
      if (orderedProps.length === 0) {
          return true;
      }
      var prop = orderedProps.shift();
      if (deleteNestedProperty(obj[prop], orderedProps)) {
          delete obj[prop];
      }
      return Object.keys(obj).length === 0;
  }
  function titlecase(s) {
      return s.charAt(0).toUpperCase() + s.substr(1);
  }
  /**
   * Converts a path to an access path with datum.
   * @param path The field name.
   * @param datum The string to use for `datum`.
   */
  function accessPathWithDatum(path, datum) {
      if (datum === void 0) { datum = 'datum'; }
      var pieces = splitAccessPath(path);
      var prefixes = [];
      for (var i = 1; i <= pieces.length; i++) {
          var prefix = "[" + pieces.slice(0, i).map($).join('][') + "]";
          prefixes.push("" + datum + prefix);
      }
      return prefixes.join(' && ');
  }
  /**
   * Return access with datum to the falttened field.
   * @param path The field name.
   * @param datum The string to use for `datum`.
   */
  function flatAccessWithDatum(path, datum) {
      if (datum === void 0) { datum = 'datum'; }
      return datum + "[" + $(splitAccessPath(path).join('.')) + "]";
  }
  /**
   * Replaces path accesses with access to non-nested field.
   * For example, `foo["bar"].baz` becomes `foo\\.bar\\.baz`.
   */
  function replacePathInField(path) {
      return "" + splitAccessPath(path).map(function (p) { return p.replace('.', '\\.'); }).join('\\.');
  }
  /**
   * Remove path accesses with access from field.
   * For example, `foo["bar"].baz` becomes `foo.bar.baz`.
   */
  function removePathFromField(path) {
      return "" + splitAccessPath(path).join('.');
  }
  /**
   * Count the depth of the path. Returns 1 for fields that are not nested.
   */
  function accessPathDepth(path) {
      if (!path) {
          return 0;
      }
      return splitAccessPath(path).length;
  }

  var util = /*#__PURE__*/Object.freeze({
    pick: pick,
    omit: omit,
    stringify: stringify$2,
    hash: hash,
    contains: contains,
    without: without,
    union: union,
    some: some,
    every: every,
    flatten: flatten,
    mergeDeep: mergeDeep,
    unique: unique,
    differ: differ,
    hasIntersection: hasIntersection,
    isNumeric: isNumeric,
    differArray: differArray,
    keys: keys,
    vals: vals,
    flagKeys: flagKeys,
    duplicate: duplicate,
    isBoolean: isBoolean$1,
    varName: varName,
    logicalExpr: logicalExpr,
    deleteNestedProperty: deleteNestedProperty,
    titlecase: titlecase,
    accessPathWithDatum: accessPathWithDatum,
    flatAccessWithDatum: flatAccessWithDatum,
    replacePathInField: replacePathInField,
    removePathFromField: removePathFromField,
    accessPathDepth: accessPathDepth
  });

  var AGGREGATE_OP_INDEX = {
      argmax: 1,
      argmin: 1,
      average: 1,
      count: 1,
      distinct: 1,
      max: 1,
      mean: 1,
      median: 1,
      min: 1,
      missing: 1,
      q1: 1,
      q3: 1,
      ci0: 1,
      ci1: 1,
      stderr: 1,
      stdev: 1,
      stdevp: 1,
      sum: 1,
      valid: 1,
      values: 1,
      variance: 1,
      variancep: 1,
  };
  var AGGREGATE_OPS = flagKeys(AGGREGATE_OP_INDEX);
  function isAggregateOp(a) {
      return !!AGGREGATE_OP_INDEX[a];
  }
  var COUNTING_OPS = ['count', 'valid', 'missing', 'distinct'];
  function isCountingAggregateOp(aggregate) {
      return aggregate && contains(COUNTING_OPS, aggregate);
  }
  /** Additive-based aggregation operations.  These can be applied to stack. */
  var SUM_OPS = [
      'count',
      'sum',
      'distinct',
      'valid',
      'missing'
  ];
  /**
   * Aggregation operators that always produce values within the range [domainMin, domainMax].
   */
  var SHARED_DOMAIN_OPS = [
      'mean',
      'average',
      'median',
      'q1',
      'q3',
      'min',
      'max',
  ];
  var SHARED_DOMAIN_OP_INDEX = toSet(SHARED_DOMAIN_OPS);

  var aggregate = /*#__PURE__*/Object.freeze({
    AGGREGATE_OPS: AGGREGATE_OPS,
    isAggregateOp: isAggregateOp,
    COUNTING_OPS: COUNTING_OPS,
    isCountingAggregateOp: isCountingAggregateOp,
    SUM_OPS: SUM_OPS,
    SHARED_DOMAIN_OPS: SHARED_DOMAIN_OPS,
    SHARED_DOMAIN_OP_INDEX: SHARED_DOMAIN_OP_INDEX
  });

  var AXIS_PARTS = ['domain', 'grid', 'labels', 'ticks', 'title'];
  /**
   * A dictionary listing whether a certain axis property is applicable for only main axes or only grid axes.
   * (Properties not listed are applicable for both)
   */
  var AXIS_PROPERTY_TYPE = {
      grid: 'grid',
      gridScale: 'grid',
      domain: 'main',
      labels: 'main',
      labelFlush: 'main',
      labelOverlap: 'main',
      minExtent: 'main',
      maxExtent: 'main',
      offset: 'main',
      ticks: 'main',
      title: 'main',
      values: 'both',
      scale: 'both',
      zindex: 'both' // this is actually set afterward, so it doesn't matter
  };
  var COMMON_AXIS_PROPERTIES_INDEX = {
      orient: 1,
      domain: 1,
      format: 1,
      grid: 1,
      labelBound: 1,
      labelFlush: 1,
      labelPadding: 1,
      labels: 1,
      labelOverlap: 1,
      maxExtent: 1,
      minExtent: 1,
      offset: 1,
      position: 1,
      tickCount: 1,
      ticks: 1,
      tickSize: 1,
      title: 1,
      titlePadding: 1,
      values: 1,
      zindex: 1,
  };
  var AXIS_PROPERTIES_INDEX = __assign({}, COMMON_AXIS_PROPERTIES_INDEX, { encoding: 1, labelAngle: 1, titleMaxLength: 1 });
  var VG_AXIS_PROPERTIES_INDEX = __assign({ scale: 1 }, COMMON_AXIS_PROPERTIES_INDEX, { gridScale: 1, encode: 1 });
  function isAxisProperty(prop) {
      return !!AXIS_PROPERTIES_INDEX[prop];
  }
  var VG_AXIS_PROPERTIES = flagKeys(VG_AXIS_PROPERTIES_INDEX);
  // Export for dependent projects
  var AXIS_PROPERTIES = flagKeys(AXIS_PROPERTIES_INDEX);

  var axis = /*#__PURE__*/Object.freeze({
    AXIS_PARTS: AXIS_PARTS,
    AXIS_PROPERTY_TYPE: AXIS_PROPERTY_TYPE,
    isAxisProperty: isAxisProperty,
    VG_AXIS_PROPERTIES: VG_AXIS_PROPERTIES,
    AXIS_PROPERTIES: AXIS_PROPERTIES
  });

  /*
   * Constants and utilities for encoding channels (Visual variables)
   * such as 'x', 'y', 'color'.
   */
  var Channel;
  (function (Channel) {
      // Facet
      Channel.ROW = 'row';
      Channel.COLUMN = 'column';
      // Position
      Channel.X = 'x';
      Channel.Y = 'y';
      Channel.X2 = 'x2';
      Channel.Y2 = 'y2';
      // Geo Position
      Channel.LATITUDE = 'latitude';
      Channel.LONGITUDE = 'longitude';
      Channel.LATITUDE2 = 'latitude2';
      Channel.LONGITUDE2 = 'longitude2';
      // Mark property with scale
      Channel.COLOR = 'color';
      Channel.FILL = 'fill';
      Channel.STROKE = 'stroke';
      Channel.SHAPE = 'shape';
      Channel.SIZE = 'size';
      Channel.OPACITY = 'opacity';
      // Non-scale channel
      Channel.TEXT = 'text';
      Channel.ORDER = 'order';
      Channel.DETAIL = 'detail';
      Channel.KEY = 'key';
      Channel.TOOLTIP = 'tooltip';
      Channel.HREF = 'href';
  })(Channel || (Channel = {}));
  var X = Channel.X;
  var Y = Channel.Y;
  var X2 = Channel.X2;
  var Y2 = Channel.Y2;
  var LATITUDE = Channel.LATITUDE;
  var LATITUDE2 = Channel.LATITUDE2;
  var LONGITUDE = Channel.LONGITUDE;
  var LONGITUDE2 = Channel.LONGITUDE2;
  var ROW = Channel.ROW;
  var COLUMN = Channel.COLUMN;
  var SHAPE = Channel.SHAPE;
  var SIZE = Channel.SIZE;
  var COLOR = Channel.COLOR;
  var FILL = Channel.FILL;
  var STROKE = Channel.STROKE;
  var TEXT = Channel.TEXT;
  var DETAIL = Channel.DETAIL;
  var KEY = Channel.KEY;
  var ORDER = Channel.ORDER;
  var OPACITY = Channel.OPACITY;
  var TOOLTIP = Channel.TOOLTIP;
  var HREF = Channel.HREF;
  var GEOPOSITION_CHANNEL_INDEX = {
      longitude: 1,
      longitude2: 1,
      latitude: 1,
      latitude2: 1,
  };
  var GEOPOSITION_CHANNELS = flagKeys(GEOPOSITION_CHANNEL_INDEX);
  var UNIT_CHANNEL_INDEX = __assign({ 
      // position
      x: 1, y: 1, x2: 1, y2: 1 }, GEOPOSITION_CHANNEL_INDEX, { 
      // color
      color: 1, fill: 1, stroke: 1, 
      // other non-position with scale
      opacity: 1, size: 1, shape: 1, 
      // channels without scales
      order: 1, text: 1, detail: 1, key: 1, tooltip: 1, href: 1 });
  function isColorChannel(channel) {
      return channel === 'color' || channel === 'fill' || channel === 'stroke';
  }
  var FACET_CHANNEL_INDEX = {
      row: 1,
      column: 1
  };
  var CHANNEL_INDEX = __assign({}, UNIT_CHANNEL_INDEX, FACET_CHANNEL_INDEX);
  var CHANNELS = flagKeys(CHANNEL_INDEX);
  var _o = CHANNEL_INDEX.order, _d = CHANNEL_INDEX.detail, SINGLE_DEF_CHANNEL_INDEX = __rest(CHANNEL_INDEX, ["order", "detail"]);
  /**
   * Channels that cannot have an array of channelDef.
   * model.fieldDef, getFieldDef only work for these channels.
   *
   * (The only two channels that can have an array of channelDefs are "detail" and "order".
   * Since there can be multiple fieldDefs for detail and order, getFieldDef/model.fieldDef
   * are not applicable for them.  Similarly, selection projection won't work with "detail" and "order".)
   */
  var SINGLE_DEF_CHANNELS = flagKeys(SINGLE_DEF_CHANNEL_INDEX);
  function isChannel(str) {
      return !!CHANNEL_INDEX[str];
  }
  // CHANNELS without COLUMN, ROW
  var UNIT_CHANNELS = flagKeys(UNIT_CHANNEL_INDEX);
  // NONPOSITION_CHANNELS = UNIT_CHANNELS without X, Y, X2, Y2;
  var _x = UNIT_CHANNEL_INDEX.x, _y = UNIT_CHANNEL_INDEX.y, 
  // x2 and y2 share the same scale as x and y
  _x2 = UNIT_CHANNEL_INDEX.x2, _y2 = UNIT_CHANNEL_INDEX.y2, _latitude = UNIT_CHANNEL_INDEX.latitude, _longitude = UNIT_CHANNEL_INDEX.longitude, _latitude2 = UNIT_CHANNEL_INDEX.latitude2, _longitude2 = UNIT_CHANNEL_INDEX.longitude2, 
  // The rest of unit channels then have scale
  NONPOSITION_CHANNEL_INDEX = __rest(UNIT_CHANNEL_INDEX, ["x", "y", "x2", "y2", "latitude", "longitude", "latitude2", "longitude2"]);
  var NONPOSITION_CHANNELS = flagKeys(NONPOSITION_CHANNEL_INDEX);
  // POSITION_SCALE_CHANNELS = X and Y;
  var POSITION_SCALE_CHANNEL_INDEX = { x: 1, y: 1 };
  var POSITION_SCALE_CHANNELS = flagKeys(POSITION_SCALE_CHANNEL_INDEX);
  // NON_POSITION_SCALE_CHANNEL = SCALE_CHANNELS without X, Y
  var  
  NONPOSITION_SCALE_CHANNEL_INDEX = __rest(NONPOSITION_CHANNEL_INDEX, ["text", "tooltip", "href", "detail", "key", "order"]);
  var NONPOSITION_SCALE_CHANNELS = flagKeys(NONPOSITION_SCALE_CHANNEL_INDEX);
  // Declare SCALE_CHANNEL_INDEX
  var SCALE_CHANNEL_INDEX = __assign({}, POSITION_SCALE_CHANNEL_INDEX, NONPOSITION_SCALE_CHANNEL_INDEX);
  /** List of channels with scales */
  var SCALE_CHANNELS = flagKeys(SCALE_CHANNEL_INDEX);
  function isScaleChannel(channel) {
      return !!SCALE_CHANNEL_INDEX[channel];
  }
  /**
   * Return whether a channel supports a particular mark type.
   * @param channel  channel name
   * @param mark the mark type
   * @return whether the mark supports the channel
   */
  function supportMark(channel, mark) {
      return mark in getSupportedMark(channel);
  }
  /**
   * Return a dictionary showing whether a channel supports mark type.
   * @param channel
   * @return A dictionary mapping mark types to boolean values.
   */
  function getSupportedMark(channel) {
      switch (channel) {
          case COLOR:
          case FILL:
          case STROKE:
          case DETAIL:
          case KEY:
          case TOOLTIP:
          case HREF:
          case ORDER: // TODO: revise (order might not support rect, which is not stackable?)
          case OPACITY:
          case ROW:
          case COLUMN:
              return {
                  point: true, tick: true, rule: true, circle: true, square: true,
                  bar: true, rect: true, line: true, trail: true, area: true, text: true, geoshape: true
              };
          case X:
          case Y:
          case LATITUDE:
          case LONGITUDE:
              return {
                  point: true, tick: true, rule: true, circle: true, square: true,
                  bar: true, rect: true, line: true, trail: true, area: true, text: true
              };
          case X2:
          case Y2:
          case LATITUDE2:
          case LONGITUDE2:
              return {
                  rule: true, bar: true, rect: true, area: true
              };
          case SIZE:
              return {
                  point: true, tick: true, rule: true, circle: true, square: true,
                  bar: true, text: true, line: true, trail: true
              };
          case SHAPE:
              return { point: true, geoshape: true };
          case TEXT:
              return { text: true };
      }
  }
  function rangeType(channel) {
      switch (channel) {
          case X:
          case Y:
          case SIZE:
          case OPACITY:
          // X2 and Y2 use X and Y scales, so they similarly have continuous range.
          case X2:
          case Y2:
              return 'continuous';
          case ROW:
          case COLUMN:
          case SHAPE:
          // TEXT, TOOLTIP, and HREF have no scale but have discrete output
          case TEXT:
          case TOOLTIP:
          case HREF:
              return 'discrete';
          // Color can be either continuous or discrete, depending on scale type.
          case COLOR:
          case FILL:
          case STROKE:
              return 'flexible';
          // No scale, no range type.
          case LATITUDE:
          case LONGITUDE:
          case LATITUDE2:
          case LONGITUDE2:
          case DETAIL:
          case KEY:
          case ORDER:
              return undefined;
      }
      /* istanbul ignore next: should never reach here. */
      throw new Error('rangeType not implemented for ' + channel);
  }

  var channel = /*#__PURE__*/Object.freeze({
    get Channel () { return Channel; },
    X: X,
    Y: Y,
    X2: X2,
    Y2: Y2,
    LATITUDE: LATITUDE,
    LATITUDE2: LATITUDE2,
    LONGITUDE: LONGITUDE,
    LONGITUDE2: LONGITUDE2,
    ROW: ROW,
    COLUMN: COLUMN,
    SHAPE: SHAPE,
    SIZE: SIZE,
    COLOR: COLOR,
    FILL: FILL,
    STROKE: STROKE,
    TEXT: TEXT,
    DETAIL: DETAIL,
    KEY: KEY,
    ORDER: ORDER,
    OPACITY: OPACITY,
    TOOLTIP: TOOLTIP,
    HREF: HREF,
    GEOPOSITION_CHANNEL_INDEX: GEOPOSITION_CHANNEL_INDEX,
    GEOPOSITION_CHANNELS: GEOPOSITION_CHANNELS,
    isColorChannel: isColorChannel,
    CHANNELS: CHANNELS,
    SINGLE_DEF_CHANNELS: SINGLE_DEF_CHANNELS,
    isChannel: isChannel,
    UNIT_CHANNELS: UNIT_CHANNELS,
    NONPOSITION_CHANNELS: NONPOSITION_CHANNELS,
    POSITION_SCALE_CHANNELS: POSITION_SCALE_CHANNELS,
    NONPOSITION_SCALE_CHANNELS: NONPOSITION_SCALE_CHANNELS,
    SCALE_CHANNELS: SCALE_CHANNELS,
    isScaleChannel: isScaleChannel,
    supportMark: supportMark,
    getSupportedMark: getSupportedMark,
    rangeType: rangeType
  });

  function binToString(bin) {
      if (isBoolean(bin)) {
          return 'bin';
      }
      return 'bin' + keys(bin).map(function (p) { return varName("_" + p + "_" + bin[p]); }).join('');
  }
  function isBinParams(bin) {
      return bin && !isBoolean(bin);
  }
  function autoMaxBins(channel) {
      switch (channel) {
          case ROW:
          case COLUMN:
          case SIZE:
          case COLOR:
          case FILL:
          case STROKE:
          case OPACITY:
          // Facets and Size shouldn't have too many bins
          // We choose 6 like shape to simplify the rule
          case SHAPE:
              return 6; // Vega's "shape" has 6 distinct values
          default:
              return 10;
      }
  }

  var bin = /*#__PURE__*/Object.freeze({
    binToString: binToString,
    isBinParams: isBinParams,
    autoMaxBins: autoMaxBins
  });

  var Mark;
  (function (Mark) {
      Mark.AREA = 'area';
      Mark.BAR = 'bar';
      Mark.LINE = 'line';
      Mark.POINT = 'point';
      Mark.RECT = 'rect';
      Mark.RULE = 'rule';
      Mark.TEXT = 'text';
      Mark.TICK = 'tick';
      Mark.TRAIL = 'trail';
      Mark.CIRCLE = 'circle';
      Mark.SQUARE = 'square';
      Mark.GEOSHAPE = 'geoshape';
  })(Mark || (Mark = {}));
  var AREA = Mark.AREA;
  var BAR = Mark.BAR;
  var LINE = Mark.LINE;
  var POINT = Mark.POINT;
  var TEXT$1 = Mark.TEXT;
  var TICK = Mark.TICK;
  var TRAIL = Mark.TRAIL;
  var RECT = Mark.RECT;
  var RULE = Mark.RULE;
  var GEOSHAPE = Mark.GEOSHAPE;
  var CIRCLE = Mark.CIRCLE;
  var SQUARE = Mark.SQUARE;
  // Using mapped type to declare index, ensuring we always have all marks when we add more.
  var MARK_INDEX = {
      area: 1,
      bar: 1,
      line: 1,
      point: 1,
      text: 1,
      tick: 1,
      trail: 1,
      rect: 1,
      geoshape: 1,
      rule: 1,
      circle: 1,
      square: 1
  };
  function isMark(m) {
      return !!MARK_INDEX[m];
  }
  function isPathMark(m) {
      return contains(['line', 'area', 'trail'], m);
  }
  var PRIMITIVE_MARKS = flagKeys(MARK_INDEX);
  function isMarkDef(mark) {
      return mark['type'];
  }
  var PRIMITIVE_MARK_INDEX = toSet(PRIMITIVE_MARKS);
  function isPrimitiveMark(mark) {
      var markType = isMarkDef(mark) ? mark.type : mark;
      return markType in PRIMITIVE_MARK_INDEX;
  }
  var STROKE_CONFIG = ['stroke', 'strokeWidth',
      'strokeDash', 'strokeDashOffset', 'strokeOpacity'];
  var FILL_CONFIG = ['fill', 'fillOpacity'];
  var FILL_STROKE_CONFIG = [].concat(STROKE_CONFIG, FILL_CONFIG);
  var VL_ONLY_MARK_CONFIG_PROPERTIES = ['filled', 'color'];
  var VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX = {
      area: ['line', 'point'],
      bar: ['binSpacing', 'continuousBandSize', 'discreteBandSize'],
      line: ['point'],
      text: ['shortTimeLabels'],
      tick: ['bandSize', 'thickness']
  };
  var defaultMarkConfig = {
      color: '#4c78a8',
  };
  var defaultBarConfig = {
      binSpacing: 1,
      continuousBandSize: 5
  };
  var defaultTickConfig = {
      thickness: 1
  };

  var mark = /*#__PURE__*/Object.freeze({
    get Mark () { return Mark; },
    AREA: AREA,
    BAR: BAR,
    LINE: LINE,
    POINT: POINT,
    TEXT: TEXT$1,
    TICK: TICK,
    TRAIL: TRAIL,
    RECT: RECT,
    RULE: RULE,
    GEOSHAPE: GEOSHAPE,
    CIRCLE: CIRCLE,
    SQUARE: SQUARE,
    isMark: isMark,
    isPathMark: isPathMark,
    PRIMITIVE_MARKS: PRIMITIVE_MARKS,
    isMarkDef: isMarkDef,
    isPrimitiveMark: isPrimitiveMark,
    STROKE_CONFIG: STROKE_CONFIG,
    FILL_CONFIG: FILL_CONFIG,
    FILL_STROKE_CONFIG: FILL_STROKE_CONFIG,
    VL_ONLY_MARK_CONFIG_PROPERTIES: VL_ONLY_MARK_CONFIG_PROPERTIES,
    VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX: VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX,
    defaultMarkConfig: defaultMarkConfig,
    defaultBarConfig: defaultBarConfig,
    defaultTickConfig: defaultTickConfig
  });

  /**
   * Vega-Lite's singleton logger utility.
   */
  /**
   * Main (default) Vega Logger instance for Vega-Lite
   */
  var main = logger(Warn);
  var current = main;
  /**
   * Set the singleton logger to be a custom logger
   */
  function set(newLogger) {
      current = newLogger;
      return current;
  }
  /**
   * Reset the main logger to use the default Vega Logger
   */
  function reset() {
      current = main;
      return current;
  }
  function warn() {
      var _ = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          _[_i] = arguments[_i];
      }
      current.warn.apply(current, arguments);
  }
  function debug() {
      var _ = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          _[_i] = arguments[_i];
      }
      current.debug.apply(current, arguments);
  }
  /**
   * Collection of all Vega-Lite Error Messages
   */
  var message;
  (function (message) {
      message.INVALID_SPEC = 'Invalid spec';
      // FIT
      message.FIT_NON_SINGLE = 'Autosize "fit" only works for single views and layered views.';
      message.CANNOT_FIX_RANGE_STEP_WITH_FIT = 'Cannot use a fixed value of "rangeStep" when "autosize" is "fit".';
      // SELECTION
      function cannotProjectOnChannelWithoutField(channel) {
          return "Cannot project a selection on encoding channel \"" + channel + "\", which has no field.";
      }
      message.cannotProjectOnChannelWithoutField = cannotProjectOnChannelWithoutField;
      function nearestNotSupportForContinuous(mark) {
          return "The \"nearest\" transform is not supported for " + mark + " marks.";
      }
      message.nearestNotSupportForContinuous = nearestNotSupportForContinuous;
      function selectionNotFound(name) {
          return "Cannot find a selection named \"" + name + "\"";
      }
      message.selectionNotFound = selectionNotFound;
      message.SCALE_BINDINGS_CONTINUOUS = 'Scale bindings are currently only supported for scales with unbinned, continuous domains.';
      // REPEAT
      function noSuchRepeatedValue(field$$1) {
          return "Unknown repeated value \"" + field$$1 + "\".";
      }
      message.noSuchRepeatedValue = noSuchRepeatedValue;
      // CONCAT
      message.CONCAT_CANNOT_SHARE_AXIS = 'Axes cannot be shared in concatenated views.';
      // REPEAT
      message.REPEAT_CANNOT_SHARE_AXIS = 'Axes cannot be shared in repeated views.';
      // TITLE
      function cannotSetTitleAnchor(type) {
          return "Cannot set title \"anchor\" for a " + type + " spec";
      }
      message.cannotSetTitleAnchor = cannotSetTitleAnchor;
      // DATA
      function unrecognizedParse(p) {
          return "Unrecognized parse \"" + p + "\".";
      }
      message.unrecognizedParse = unrecognizedParse;
      function differentParse(field$$1, local, ancestor) {
          return "An ancestor parsed field \"" + field$$1 + "\" as " + ancestor + " but a child wants to parse the field as " + local + ".";
      }
      message.differentParse = differentParse;
      // TRANSFORMS
      function invalidTransformIgnored(transform) {
          return "Ignoring an invalid transform: " + stringify$2(transform) + ".";
      }
      message.invalidTransformIgnored = invalidTransformIgnored;
      message.NO_FIELDS_NEEDS_AS = 'If "from.fields" is not specified, "as" has to be a string that specifies the key to be used for the data from the secondary source.';
      // ENCODING & FACET
      function encodingOverridden(channels) {
          return "Layer's shared " + channels.join(',') + " channel " + (channels.length === 1 ? 'is' : 'are') + " overriden";
      }
      message.encodingOverridden = encodingOverridden;
      function projectionOverridden(opt) {
          var parentProjection = opt.parentProjection, projection = opt.projection;
          return "Layer's shared projection " + stringify$2(parentProjection) + " is overridden by a child projection " + stringify$2(projection) + ".";
      }
      message.projectionOverridden = projectionOverridden;
      function primitiveChannelDef(channel, type, value) {
          return "Channel " + channel + " is a " + type + ". Converted to {value: " + stringify$2(value) + "}.";
      }
      message.primitiveChannelDef = primitiveChannelDef;
      function invalidFieldType(type) {
          return "Invalid field type \"" + type + "\"";
      }
      message.invalidFieldType = invalidFieldType;
      function nonZeroScaleUsedWithLengthMark(mark, channel, opt) {
          var scaleText = opt.scaleType ? opt.scaleType + " scale" :
              opt.zeroFalse ? 'scale with zero=false' :
                  'scale with custom domain that excludes zero';
          return "A " + scaleText + " is used with " + mark + " mark. This can be misleading as the " + (channel === 'x' ? 'width' : 'height') + " of the " + mark + " can be arbitrary based on the scale domain. You may want to use point mark instead.";
      }
      message.nonZeroScaleUsedWithLengthMark = nonZeroScaleUsedWithLengthMark;
      function invalidFieldTypeForCountAggregate(type, aggregate) {
          return "Invalid field type \"" + type + "\" for aggregate: \"" + aggregate + "\", using \"quantitative\" instead.";
      }
      message.invalidFieldTypeForCountAggregate = invalidFieldTypeForCountAggregate;
      function invalidAggregate(aggregate) {
          return "Invalid aggregation operator \"" + aggregate + "\"";
      }
      message.invalidAggregate = invalidAggregate;
      function emptyOrInvalidFieldType(type, channel, newType) {
          return "Invalid field type \"" + type + "\" for channel \"" + channel + "\", using \"" + newType + "\" instead.";
      }
      message.emptyOrInvalidFieldType = emptyOrInvalidFieldType;
      function droppingColor(type, opt) {
          var fill = opt.fill, stroke = opt.stroke;
          return "Dropping color " + type + " as the plot also has " + (fill && stroke ? 'fill and stroke' : fill ? 'fill' : 'stroke');
      }
      message.droppingColor = droppingColor;
      function emptyFieldDef(fieldDef, channel) {
          return "Dropping " + stringify$2(fieldDef) + " from channel \"" + channel + "\" since it does not contain data field or value.";
      }
      message.emptyFieldDef = emptyFieldDef;
      function latLongDeprecated(channel, type, newChannel) {
          return channel + "-encoding with type " + type + " is deprecated. Replacing with " + newChannel + "-encoding.";
      }
      message.latLongDeprecated = latLongDeprecated;
      message.LINE_WITH_VARYING_SIZE = 'Line marks cannot encode size with a non-groupby field. You may want to use trail marks instead.';
      function incompatibleChannel(channel, markOrFacet, when) {
          return channel + " dropped as it is incompatible with \"" + markOrFacet + "\"" + (when ? " when " + when : '') + ".";
      }
      message.incompatibleChannel = incompatibleChannel;
      function invalidEncodingChannel(channel) {
          return channel + "-encoding is dropped as " + channel + " is not a valid encoding channel.";
      }
      message.invalidEncodingChannel = invalidEncodingChannel;
      function facetChannelShouldBeDiscrete(channel) {
          return channel + " encoding should be discrete (ordinal / nominal / binned).";
      }
      message.facetChannelShouldBeDiscrete = facetChannelShouldBeDiscrete;
      function discreteChannelCannotEncode(channel, type) {
          return "Using discrete channel \"" + channel + "\" to encode \"" + type + "\" field can be misleading as it does not encode " + (type === 'ordinal' ? 'order' : 'magnitude') + ".";
      }
      message.discreteChannelCannotEncode = discreteChannelCannotEncode;
      // Mark
      message.BAR_WITH_POINT_SCALE_AND_RANGESTEP_NULL = 'Bar mark should not be used with point scale when rangeStep is null. Please use band scale instead.';
      function lineWithRange(hasX2, hasY2) {
          var channels = hasX2 && hasY2 ? 'x2 and y2' : hasX2 ? 'x2' : 'y2';
          return "Line mark is for continuous lines and thus cannot be used with " + channels + ". We will use the rule mark (line segments) instead.";
      }
      message.lineWithRange = lineWithRange;
      function unclearOrientContinuous(mark) {
          return "Cannot clearly determine orientation for \"" + mark + "\" since both x and y channel encode continuous fields. In this case, we use vertical by default";
      }
      message.unclearOrientContinuous = unclearOrientContinuous;
      function unclearOrientDiscreteOrEmpty(mark) {
          return "Cannot clearly determine orientation for \"" + mark + "\" since both x and y channel encode discrete or empty fields.";
      }
      message.unclearOrientDiscreteOrEmpty = unclearOrientDiscreteOrEmpty;
      function orientOverridden(original, actual) {
          return "Specified orient \"" + original + "\" overridden with \"" + actual + "\"";
      }
      message.orientOverridden = orientOverridden;
      // SCALE
      message.CANNOT_UNION_CUSTOM_DOMAIN_WITH_FIELD_DOMAIN = 'custom domain scale cannot be unioned with default field-based domain';
      function cannotUseScalePropertyWithNonColor(prop) {
          return "Cannot use the scale property \"" + prop + "\" with non-color channel.";
      }
      message.cannotUseScalePropertyWithNonColor = cannotUseScalePropertyWithNonColor;
      function unaggregateDomainHasNoEffectForRawField(fieldDef) {
          return "Using unaggregated domain with raw field has no effect (" + stringify$2(fieldDef) + ").";
      }
      message.unaggregateDomainHasNoEffectForRawField = unaggregateDomainHasNoEffectForRawField;
      function unaggregateDomainWithNonSharedDomainOp(aggregate) {
          return "Unaggregated domain not applicable for \"" + aggregate + "\" since it produces values outside the origin domain of the source data.";
      }
      message.unaggregateDomainWithNonSharedDomainOp = unaggregateDomainWithNonSharedDomainOp;
      function unaggregatedDomainWithLogScale(fieldDef) {
          return "Unaggregated domain is currently unsupported for log scale (" + stringify$2(fieldDef) + ").";
      }
      message.unaggregatedDomainWithLogScale = unaggregatedDomainWithLogScale;
      function cannotApplySizeToNonOrientedMark(mark) {
          return "Cannot apply size to non-oriented mark \"" + mark + "\".";
      }
      message.cannotApplySizeToNonOrientedMark = cannotApplySizeToNonOrientedMark;
      function rangeStepDropped(channel) {
          return "rangeStep for \"" + channel + "\" is dropped as top-level " + (channel === 'x' ? 'width' : 'height') + " is provided.";
      }
      message.rangeStepDropped = rangeStepDropped;
      function scaleTypeNotWorkWithChannel(channel, scaleType, defaultScaleType) {
          return "Channel \"" + channel + "\" does not work with \"" + scaleType + "\" scale. We are using \"" + defaultScaleType + "\" scale instead.";
      }
      message.scaleTypeNotWorkWithChannel = scaleTypeNotWorkWithChannel;
      function scaleTypeNotWorkWithFieldDef(scaleType, defaultScaleType) {
          return "FieldDef does not work with \"" + scaleType + "\" scale. We are using \"" + defaultScaleType + "\" scale instead.";
      }
      message.scaleTypeNotWorkWithFieldDef = scaleTypeNotWorkWithFieldDef;
      function scalePropertyNotWorkWithScaleType(scaleType, propName, channel) {
          return channel + "-scale's \"" + propName + "\" is dropped as it does not work with " + scaleType + " scale.";
      }
      message.scalePropertyNotWorkWithScaleType = scalePropertyNotWorkWithScaleType;
      function scaleTypeNotWorkWithMark(mark, scaleType) {
          return "Scale type \"" + scaleType + "\" does not work with mark \"" + mark + "\".";
      }
      message.scaleTypeNotWorkWithMark = scaleTypeNotWorkWithMark;
      function mergeConflictingProperty(property, propertyOf, v1, v2) {
          return "Conflicting " + propertyOf + " property \"" + property + "\" (" + stringify$2(v1) + " and " + stringify$2(v2) + ").  Using " + stringify$2(v1) + ".";
      }
      message.mergeConflictingProperty = mergeConflictingProperty;
      function independentScaleMeansIndependentGuide(channel) {
          return "Setting the scale to be independent for \"" + channel + "\" means we also have to set the guide (axis or legend) to be independent.";
      }
      message.independentScaleMeansIndependentGuide = independentScaleMeansIndependentGuide;
      function domainSortDropped(sort) {
          return "Dropping sort property " + stringify$2(sort) + " as unioned domains only support boolean or op 'count'.";
      }
      message.domainSortDropped = domainSortDropped;
      message.UNABLE_TO_MERGE_DOMAINS = 'Unable to merge domains';
      message.MORE_THAN_ONE_SORT = 'Domains that should be unioned has conflicting sort properties. Sort will be set to true.';
      // AXIS
      message.INVALID_CHANNEL_FOR_AXIS = 'Invalid channel for axis.';
      // STACK
      function cannotStackRangedMark(channel) {
          return "Cannot stack \"" + channel + "\" if there is already \"" + channel + "2\"";
      }
      message.cannotStackRangedMark = cannotStackRangedMark;
      function cannotStackNonLinearScale(scaleType) {
          return "Cannot stack non-linear scale (" + scaleType + ")";
      }
      message.cannotStackNonLinearScale = cannotStackNonLinearScale;
      function stackNonSummativeAggregate(aggregate) {
          return "Stacking is applied even though the aggregate function is non-summative (\"" + aggregate + "\")";
      }
      message.stackNonSummativeAggregate = stackNonSummativeAggregate;
      // TIMEUNIT
      function invalidTimeUnit(unitName, value) {
          return "Invalid " + unitName + ": " + stringify$2(value);
      }
      message.invalidTimeUnit = invalidTimeUnit;
      function dayReplacedWithDate(fullTimeUnit) {
          return "Time unit \"" + fullTimeUnit + "\" is not supported. We are replacing it with " + fullTimeUnit.replace('day', 'date') + ".";
      }
      message.dayReplacedWithDate = dayReplacedWithDate;
      function droppedDay(d) {
          return "Dropping day from datetime " + stringify$2(d) + " as day cannot be combined with other units.";
      }
      message.droppedDay = droppedDay;
  })(message || (message = {}));

  // DateTime definition object
  /*
   * A designated year that starts on Sunday.
   */
  var SUNDAY_YEAR = 2006;
  function isDateTime(o) {
      return !!o && (!!o.year || !!o.quarter || !!o.month || !!o.date || !!o.day ||
          !!o.hours || !!o.minutes || !!o.seconds || !!o.milliseconds);
  }
  var MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  var SHORT_MONTHS = MONTHS.map(function (m) { return m.substr(0, 3); });
  var DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var SHORT_DAYS = DAYS.map(function (d) { return d.substr(0, 3); });
  function normalizeQuarter(q) {
      if (isNumber(q)) {
          if (q > 4) {
              warn(message.invalidTimeUnit('quarter', q));
          }
          // We accept 1-based quarter, so need to readjust to 0-based quarter
          return (q - 1) + '';
      }
      else {
          // Invalid quarter
          throw new Error(message.invalidTimeUnit('quarter', q));
      }
  }
  function normalizeMonth(m) {
      if (isNumber(m)) {
          // We accept 1-based month, so need to readjust to 0-based month
          return (m - 1) + '';
      }
      else {
          var lowerM = m.toLowerCase();
          var monthIndex = MONTHS.indexOf(lowerM);
          if (monthIndex !== -1) {
              return monthIndex + ''; // 0 for january, ...
          }
          var shortM = lowerM.substr(0, 3);
          var shortMonthIndex = SHORT_MONTHS.indexOf(shortM);
          if (shortMonthIndex !== -1) {
              return shortMonthIndex + '';
          }
          // Invalid month
          throw new Error(message.invalidTimeUnit('month', m));
      }
  }
  function normalizeDay(d) {
      if (isNumber(d)) {
          // mod so that this can be both 0-based where 0 = sunday
          // and 1-based where 7=sunday
          return (d % 7) + '';
      }
      else {
          var lowerD = d.toLowerCase();
          var dayIndex = DAYS.indexOf(lowerD);
          if (dayIndex !== -1) {
              return dayIndex + ''; // 0 for january, ...
          }
          var shortD = lowerD.substr(0, 3);
          var shortDayIndex = SHORT_DAYS.indexOf(shortD);
          if (shortDayIndex !== -1) {
              return shortDayIndex + '';
          }
          // Invalid day
          throw new Error(message.invalidTimeUnit('day', d));
      }
  }
  /**
   * Return Vega Expression for a particular date time.
   * @param d
   * @param normalize whether to normalize quarter, month, day.
   */
  function dateTimeExpr(d, normalize) {
      if (normalize === void 0) { normalize = false; }
      var units = [];
      if (normalize && d.day !== undefined) {
          if (keys(d).length > 1) {
              warn(message.droppedDay(d));
              d = duplicate(d);
              delete d.day;
          }
      }
      if (d.year !== undefined) {
          units.push(d.year);
      }
      else if (d.day !== undefined) {
          // Set year to 2006 for working with day since January 1 2006 is a Sunday
          units.push(SUNDAY_YEAR);
      }
      else {
          units.push(0);
      }
      if (d.month !== undefined) {
          var month = normalize ? normalizeMonth(d.month) : d.month;
          units.push(month);
      }
      else if (d.quarter !== undefined) {
          var quarter = normalize ? normalizeQuarter(d.quarter) : d.quarter;
          units.push(quarter + '*3');
      }
      else {
          units.push(0); // months start at zero in JS
      }
      if (d.date !== undefined) {
          units.push(d.date);
      }
      else if (d.day !== undefined) {
          // HACK: Day only works as a standalone unit
          // This is only correct because we always set year to 2006 for day
          var day = normalize ? normalizeDay(d.day) : d.day;
          units.push(day + '+1');
      }
      else {
          units.push(1); // Date starts at 1 in JS
      }
      // Note: can't use TimeUnit enum here as importing it will create
      // circular dependency problem!
      for (var _i = 0, _a = ['hours', 'minutes', 'seconds', 'milliseconds']; _i < _a.length; _i++) {
          var timeUnit = _a[_i];
          if (d[timeUnit] !== undefined) {
              units.push(d[timeUnit]);
          }
          else {
              units.push(0);
          }
      }
      if (d.utc) {
          return "utc(" + units.join(', ') + ")";
      }
      else {
          return "datetime(" + units.join(', ') + ")";
      }
  }

  var datetime = /*#__PURE__*/Object.freeze({
    isDateTime: isDateTime,
    MONTHS: MONTHS,
    SHORT_MONTHS: SHORT_MONTHS,
    DAYS: DAYS,
    SHORT_DAYS: SHORT_DAYS,
    dateTimeExpr: dateTimeExpr
  });

  var TimeUnit;
  (function (TimeUnit) {
      TimeUnit.YEAR = 'year';
      TimeUnit.MONTH = 'month';
      TimeUnit.DAY = 'day';
      TimeUnit.DATE = 'date';
      TimeUnit.HOURS = 'hours';
      TimeUnit.MINUTES = 'minutes';
      TimeUnit.SECONDS = 'seconds';
      TimeUnit.MILLISECONDS = 'milliseconds';
      TimeUnit.YEARMONTH = 'yearmonth';
      TimeUnit.YEARMONTHDATE = 'yearmonthdate';
      TimeUnit.YEARMONTHDATEHOURS = 'yearmonthdatehours';
      TimeUnit.YEARMONTHDATEHOURSMINUTES = 'yearmonthdatehoursminutes';
      TimeUnit.YEARMONTHDATEHOURSMINUTESSECONDS = 'yearmonthdatehoursminutesseconds';
      // MONTHDATE always include 29 February since we use year 0th (which is a leap year);
      TimeUnit.MONTHDATE = 'monthdate';
      TimeUnit.HOURSMINUTES = 'hoursminutes';
      TimeUnit.HOURSMINUTESSECONDS = 'hoursminutesseconds';
      TimeUnit.MINUTESSECONDS = 'minutesseconds';
      TimeUnit.SECONDSMILLISECONDS = 'secondsmilliseconds';
      TimeUnit.QUARTER = 'quarter';
      TimeUnit.YEARQUARTER = 'yearquarter';
      TimeUnit.QUARTERMONTH = 'quartermonth';
      TimeUnit.YEARQUARTERMONTH = 'yearquartermonth';
      TimeUnit.UTCYEAR = 'utcyear';
      TimeUnit.UTCMONTH = 'utcmonth';
      TimeUnit.UTCDAY = 'utcday';
      TimeUnit.UTCDATE = 'utcdate';
      TimeUnit.UTCHOURS = 'utchours';
      TimeUnit.UTCMINUTES = 'utcminutes';
      TimeUnit.UTCSECONDS = 'utcseconds';
      TimeUnit.UTCMILLISECONDS = 'utcmilliseconds';
      TimeUnit.UTCYEARMONTH = 'utcyearmonth';
      TimeUnit.UTCYEARMONTHDATE = 'utcyearmonthdate';
      TimeUnit.UTCYEARMONTHDATEHOURS = 'utcyearmonthdatehours';
      TimeUnit.UTCYEARMONTHDATEHOURSMINUTES = 'utcyearmonthdatehoursminutes';
      TimeUnit.UTCYEARMONTHDATEHOURSMINUTESSECONDS = 'utcyearmonthdatehoursminutesseconds';
      // MONTHDATE always include 29 February since we use year 0th (which is a leap year);
      TimeUnit.UTCMONTHDATE = 'utcmonthdate';
      TimeUnit.UTCHOURSMINUTES = 'utchoursminutes';
      TimeUnit.UTCHOURSMINUTESSECONDS = 'utchoursminutesseconds';
      TimeUnit.UTCMINUTESSECONDS = 'utcminutesseconds';
      TimeUnit.UTCSECONDSMILLISECONDS = 'utcsecondsmilliseconds';
      TimeUnit.UTCQUARTER = 'utcquarter';
      TimeUnit.UTCYEARQUARTER = 'utcyearquarter';
      TimeUnit.UTCQUARTERMONTH = 'utcquartermonth';
      TimeUnit.UTCYEARQUARTERMONTH = 'utcyearquartermonth';
  })(TimeUnit || (TimeUnit = {}));
  /** Time Unit that only corresponds to only one part of Date objects. */
  var LOCAL_SINGLE_TIMEUNIT_INDEX = {
      year: 1,
      quarter: 1,
      month: 1,
      day: 1,
      date: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
      milliseconds: 1
  };
  var TIMEUNIT_PARTS = flagKeys(LOCAL_SINGLE_TIMEUNIT_INDEX);
  function isLocalSingleTimeUnit(timeUnit) {
      return !!LOCAL_SINGLE_TIMEUNIT_INDEX[timeUnit];
  }
  var UTC_SINGLE_TIMEUNIT_INDEX = {
      utcyear: 1,
      utcquarter: 1,
      utcmonth: 1,
      utcday: 1,
      utcdate: 1,
      utchours: 1,
      utcminutes: 1,
      utcseconds: 1,
      utcmilliseconds: 1
  };
  function isUtcSingleTimeUnit(timeUnit) {
      return !!UTC_SINGLE_TIMEUNIT_INDEX[timeUnit];
  }
  var LOCAL_MULTI_TIMEUNIT_INDEX = {
      yearquarter: 1,
      yearquartermonth: 1,
      yearmonth: 1,
      yearmonthdate: 1,
      yearmonthdatehours: 1,
      yearmonthdatehoursminutes: 1,
      yearmonthdatehoursminutesseconds: 1,
      quartermonth: 1,
      monthdate: 1,
      hoursminutes: 1,
      hoursminutesseconds: 1,
      minutesseconds: 1,
      secondsmilliseconds: 1
  };
  var UTC_MULTI_TIMEUNIT_INDEX = {
      utcyearquarter: 1,
      utcyearquartermonth: 1,
      utcyearmonth: 1,
      utcyearmonthdate: 1,
      utcyearmonthdatehours: 1,
      utcyearmonthdatehoursminutes: 1,
      utcyearmonthdatehoursminutesseconds: 1,
      utcquartermonth: 1,
      utcmonthdate: 1,
      utchoursminutes: 1,
      utchoursminutesseconds: 1,
      utcminutesseconds: 1,
      utcsecondsmilliseconds: 1
  };
  var UTC_TIMEUNIT_INDEX = __assign({}, UTC_SINGLE_TIMEUNIT_INDEX, UTC_MULTI_TIMEUNIT_INDEX);
  function isUTCTimeUnit(t) {
      return !!UTC_TIMEUNIT_INDEX[t];
  }
  function getLocalTimeUnit(t) {
      return t.substr(3);
  }
  var TIMEUNIT_INDEX = __assign({}, LOCAL_SINGLE_TIMEUNIT_INDEX, UTC_SINGLE_TIMEUNIT_INDEX, LOCAL_MULTI_TIMEUNIT_INDEX, UTC_MULTI_TIMEUNIT_INDEX);
  var TIMEUNITS = flagKeys(TIMEUNIT_INDEX);
  function isTimeUnit(t) {
      return !!TIMEUNIT_INDEX[t];
  }
  var SET_DATE_METHOD = {
      year: 'setFullYear',
      month: 'setMonth',
      date: 'setDate',
      hours: 'setHours',
      minutes: 'setMinutes',
      seconds: 'setSeconds',
      milliseconds: 'setMilliseconds',
      // Day and quarter have their own special cases
      quarter: null,
      day: null,
  };
  /**
   * Converts a date to only have the measurements relevant to the specified unit
   * i.e. ('yearmonth', '2000-12-04 07:58:14') -> '2000-12-01 00:00:00'
   * Note: the base date is Jan 01 1900 00:00:00
   */
  function convert(unit, date) {
      var isUTC = isUTCTimeUnit(unit);
      var result = isUTC ?
          // start with uniform date
          new Date(Date.UTC(0, 0, 1, 0, 0, 0, 0)) :
          new Date(0, 0, 1, 0, 0, 0, 0);
      for (var _i = 0, TIMEUNIT_PARTS_1 = TIMEUNIT_PARTS; _i < TIMEUNIT_PARTS_1.length; _i++) {
          var timeUnitPart = TIMEUNIT_PARTS_1[_i];
          if (containsTimeUnit(unit, timeUnitPart)) {
              switch (timeUnitPart) {
                  case TimeUnit.DAY:
                      throw new Error('Cannot convert to TimeUnits containing \'day\'');
                  case TimeUnit.QUARTER: {
                      var _a = dateMethods('month', isUTC), getDateMethod_1 = _a.getDateMethod, setDateMethod_1 = _a.setDateMethod;
                      // indicate quarter by setting month to be the first of the quarter i.e. may (4) -> april (3)
                      result[setDateMethod_1]((Math.floor(date[getDateMethod_1]() / 3)) * 3);
                      break;
                  }
                  default:
                      var _b = dateMethods(timeUnitPart, isUTC), getDateMethod = _b.getDateMethod, setDateMethod = _b.setDateMethod;
                      result[setDateMethod](date[getDateMethod]());
              }
          }
      }
      return result;
  }
  function dateMethods(singleUnit, isUtc) {
      var rawSetDateMethod = SET_DATE_METHOD[singleUnit];
      var setDateMethod = isUtc ? 'setUTC' + rawSetDateMethod.substr(3) : rawSetDateMethod;
      var getDateMethod = 'get' + (isUtc ? 'UTC' : '') + rawSetDateMethod.substr(3);
      return { setDateMethod: setDateMethod, getDateMethod: getDateMethod };
  }
  function getTimeUnitParts(timeUnit) {
      return TIMEUNIT_PARTS.reduce(function (parts, part) {
          if (containsTimeUnit(timeUnit, part)) {
              return parts.concat(part);
          }
          return parts;
      }, []);
  }
  /** Returns true if fullTimeUnit contains the timeUnit, false otherwise. */
  function containsTimeUnit(fullTimeUnit, timeUnit) {
      var index = fullTimeUnit.indexOf(timeUnit);
      return index > -1 &&
          (timeUnit !== TimeUnit.SECONDS ||
              index === 0 ||
              fullTimeUnit.charAt(index - 1) !== 'i' // exclude milliseconds
          );
  }
  /**
   * Returns Vega expresssion for a given timeUnit and fieldRef
   */
  function fieldExpr(fullTimeUnit, field) {
      var fieldRef = accessPathWithDatum(field);
      var utc = isUTCTimeUnit(fullTimeUnit) ? 'utc' : '';
      function func(timeUnit) {
          if (timeUnit === TimeUnit.QUARTER) {
              // quarter starting at 0 (0,3,6,9).
              return "(" + utc + "quarter(" + fieldRef + ")-1)";
          }
          else {
              return "" + utc + timeUnit + "(" + fieldRef + ")";
          }
      }
      var d = TIMEUNIT_PARTS.reduce(function (dateExpr, tu) {
          if (containsTimeUnit(fullTimeUnit, tu)) {
              dateExpr[tu] = func(tu);
          }
          return dateExpr;
      }, {});
      return dateTimeExpr(d);
  }
  /**
   * returns the signal expression used for axis labels for a time unit
   */
  function formatExpression(timeUnit, field, shortTimeLabels, isUTCScale) {
      if (!timeUnit) {
          return undefined;
      }
      var dateComponents = [];
      var expression = '';
      var hasYear = containsTimeUnit(timeUnit, TimeUnit.YEAR);
      if (containsTimeUnit(timeUnit, TimeUnit.QUARTER)) {
          // special expression for quarter as prefix
          expression = "'Q' + quarter(" + field + ")";
      }
      if (containsTimeUnit(timeUnit, TimeUnit.MONTH)) {
          // By default use short month name
          dateComponents.push(shortTimeLabels !== false ? '%b' : '%B');
      }
      if (containsTimeUnit(timeUnit, TimeUnit.DAY)) {
          dateComponents.push(shortTimeLabels ? '%a' : '%A');
      }
      else if (containsTimeUnit(timeUnit, TimeUnit.DATE)) {
          dateComponents.push('%d' + (hasYear ? ',' : '')); // add comma if there is year
      }
      if (hasYear) {
          dateComponents.push(shortTimeLabels ? '%y' : '%Y');
      }
      var timeComponents = [];
      if (containsTimeUnit(timeUnit, TimeUnit.HOURS)) {
          timeComponents.push('%H');
      }
      if (containsTimeUnit(timeUnit, TimeUnit.MINUTES)) {
          timeComponents.push('%M');
      }
      if (containsTimeUnit(timeUnit, TimeUnit.SECONDS)) {
          timeComponents.push('%S');
      }
      if (containsTimeUnit(timeUnit, TimeUnit.MILLISECONDS)) {
          timeComponents.push('%L');
      }
      var dateTimeComponents = [];
      if (dateComponents.length > 0) {
          dateTimeComponents.push(dateComponents.join(' '));
      }
      if (timeComponents.length > 0) {
          dateTimeComponents.push(timeComponents.join(':'));
      }
      if (dateTimeComponents.length > 0) {
          if (expression) {
              // Add space between quarter and main time format
              expression += " + ' ' + ";
          }
          // We only use utcFormat for utc scale
          // For utc time units, the data is already converted as a part of timeUnit transform.
          // Thus, utc time units should use timeFormat to avoid shifting the time twice.
          if (isUTCScale) {
              expression += "utcFormat(" + field + ", '" + dateTimeComponents.join(' ') + "')";
          }
          else {
              expression += "timeFormat(" + field + ", '" + dateTimeComponents.join(' ') + "')";
          }
      }
      // If expression is still an empty string, return undefined instead.
      return expression || undefined;
  }
  function normalizeTimeUnit(timeUnit) {
      if (timeUnit !== 'day' && timeUnit.indexOf('day') >= 0) {
          warn(message.dayReplacedWithDate(timeUnit));
          return timeUnit.replace('day', 'date');
      }
      return timeUnit;
  }

  var timeunit = /*#__PURE__*/Object.freeze({
    get TimeUnit () { return TimeUnit; },
    TIMEUNIT_PARTS: TIMEUNIT_PARTS,
    isLocalSingleTimeUnit: isLocalSingleTimeUnit,
    isUtcSingleTimeUnit: isUtcSingleTimeUnit,
    isUTCTimeUnit: isUTCTimeUnit,
    getLocalTimeUnit: getLocalTimeUnit,
    TIMEUNITS: TIMEUNITS,
    isTimeUnit: isTimeUnit,
    convert: convert,
    getTimeUnitParts: getTimeUnitParts,
    containsTimeUnit: containsTimeUnit,
    fieldExpr: fieldExpr,
    formatExpression: formatExpression,
    normalizeTimeUnit: normalizeTimeUnit
  });

  /** Constants and utilities for data type */
  /** Data type based on level of measurement */
  var Type;
  (function (Type) {
      Type.QUANTITATIVE = 'quantitative';
      Type.ORDINAL = 'ordinal';
      Type.TEMPORAL = 'temporal';
      Type.NOMINAL = 'nominal';
      Type.LATITUDE = 'latitude';
      Type.LONGITUDE = 'longitude';
      Type.GEOJSON = 'geojson';
  })(Type || (Type = {}));
  var TYPE_INDEX = {
      quantitative: 1,
      ordinal: 1,
      temporal: 1,
      nominal: 1,
      latitude: 1,
      longitude: 1,
      geojson: 1
  };
  function isType(t) {
      return !!TYPE_INDEX[t];
  }
  var QUANTITATIVE = Type.QUANTITATIVE;
  var ORDINAL = Type.ORDINAL;
  var TEMPORAL = Type.TEMPORAL;
  var NOMINAL = Type.NOMINAL;
  var GEOJSON = Type.GEOJSON;
  /**
   * Get full, lowercase type name for a given type.
   * @param  type
   * @return Full type name.
   */
  function getFullName(type) {
      if (type) {
          type = type.toLowerCase();
          switch (type) {
              case 'q':
              case QUANTITATIVE:
                  return 'quantitative';
              case 't':
              case TEMPORAL:
                  return 'temporal';
              case 'o':
              case ORDINAL:
                  return 'ordinal';
              case 'n':
              case NOMINAL:
                  return 'nominal';
              case Type.LATITUDE:
                  return 'latitude';
              case Type.LONGITUDE:
                  return 'longitude';
              case GEOJSON:
                  return 'geojson';
          }
      }
      // If we get invalid input, return undefined type.
      return undefined;
  }

  var type = /*#__PURE__*/Object.freeze({
    get Type () { return Type; },
    TYPE_INDEX: TYPE_INDEX,
    isType: isType,
    QUANTITATIVE: QUANTITATIVE,
    ORDINAL: ORDINAL,
    TEMPORAL: TEMPORAL,
    NOMINAL: NOMINAL,
    GEOJSON: GEOJSON,
    getFullName: getFullName
  });

  function isConditionalSelection(c) {
      return c['selection'];
  }
  function isRepeatRef(field$$1) {
      return field$$1 && !isString(field$$1) && 'repeat' in field$$1;
  }
  function toFieldDefBase(fieldDef) {
      var field$$1 = fieldDef.field, timeUnit = fieldDef.timeUnit, bin = fieldDef.bin, aggregate = fieldDef.aggregate;
      return __assign({}, (timeUnit ? { timeUnit: timeUnit } : {}), (bin ? { bin: bin } : {}), (aggregate ? { aggregate: aggregate } : {}), { field: field$$1 });
  }
  function isConditionalDef(channelDef) {
      return !!channelDef && !!channelDef.condition;
  }
  /**
   * Return if a channelDef is a ConditionalValueDef with ConditionFieldDef
   */
  function hasConditionalFieldDef(channelDef) {
      return !!channelDef && !!channelDef.condition && !isArray(channelDef.condition) && isFieldDef(channelDef.condition);
  }
  function hasConditionalValueDef(channelDef) {
      return !!channelDef && !!channelDef.condition && (isArray(channelDef.condition) || isValueDef(channelDef.condition));
  }
  function isFieldDef(channelDef) {
      return !!channelDef && (!!channelDef['field'] || channelDef['aggregate'] === 'count');
  }
  function isStringFieldDef(fieldDef) {
      return isFieldDef(fieldDef) && isString(fieldDef.field);
  }
  function isValueDef(channelDef) {
      return channelDef && 'value' in channelDef && channelDef['value'] !== undefined;
  }
  function isScaleFieldDef(channelDef) {
      return !!channelDef && (!!channelDef['scale'] || !!channelDef['sort']);
  }
  function isOpFieldDef(fieldDef) {
      return !!fieldDef['op'];
  }
  function vgField(fieldDef, opt) {
      if (opt === void 0) { opt = {}; }
      var field$$1 = fieldDef.field;
      var prefix = opt.prefix;
      var suffix = opt.suffix;
      if (isCount(fieldDef)) {
          field$$1 = 'count_*';
      }
      else {
          var fn = undefined;
          if (!opt.nofn) {
              if (isOpFieldDef(fieldDef)) {
                  fn = fieldDef.op;
              }
              else if (fieldDef.bin) {
                  fn = binToString(fieldDef.bin);
                  suffix = opt.binSuffix || '';
              }
              else if (fieldDef.aggregate) {
                  fn = String(fieldDef.aggregate);
              }
              else if (fieldDef.timeUnit) {
                  fn = String(fieldDef.timeUnit);
              }
          }
          if (fn) {
              field$$1 = field$$1 ? fn + "_" + field$$1 : fn;
          }
      }
      if (suffix) {
          field$$1 = field$$1 + "_" + suffix;
      }
      if (prefix) {
          field$$1 = prefix + "_" + field$$1;
      }
      if (opt.expr) {
          // Expression to access flattened field. No need to escape dots.
          return flatAccessWithDatum(field$$1, opt.expr);
      }
      else {
          // We flattened all fields so paths should have become dot.
          return replacePathInField(field$$1);
      }
  }
  function isDiscrete(fieldDef) {
      switch (fieldDef.type) {
          case 'nominal':
          case 'ordinal':
          case 'geojson':
              return true;
          case 'quantitative':
              return !!fieldDef.bin;
          case 'latitude':
          case 'longitude':
          case 'temporal':
              return false;
      }
      throw new Error(message.invalidFieldType(fieldDef.type));
  }
  function isContinuous(fieldDef) {
      return !isDiscrete(fieldDef);
  }
  function isCount(fieldDef) {
      return fieldDef.aggregate === 'count';
  }
  function verbalTitleFormatter(fieldDef, config) {
      var field$$1 = fieldDef.field, bin = fieldDef.bin, timeUnit = fieldDef.timeUnit, aggregate = fieldDef.aggregate;
      if (aggregate === 'count') {
          return config.countTitle;
      }
      else if (bin) {
          return field$$1 + " (binned)";
      }
      else if (timeUnit) {
          var units = getTimeUnitParts(timeUnit).join('-');
          return field$$1 + " (" + units + ")";
      }
      else if (aggregate) {
          return titlecase(aggregate) + " of " + field$$1;
      }
      return field$$1;
  }
  function functionalTitleFormatter(fieldDef, config) {
      var fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin');
      if (fn) {
          return fn.toUpperCase() + '(' + fieldDef.field + ')';
      }
      else {
          return fieldDef.field;
      }
  }
  var defaultTitleFormatter = function (fieldDef, config) {
      switch (config.fieldTitle) {
          case 'plain':
              return fieldDef.field;
          case 'functional':
              return functionalTitleFormatter(fieldDef, config);
          default:
              return verbalTitleFormatter(fieldDef, config);
      }
  };
  var titleFormatter = defaultTitleFormatter;
  function setTitleFormatter(formatter) {
      titleFormatter = formatter;
  }
  function resetTitleFormatter() {
      setTitleFormatter(defaultTitleFormatter);
  }
  function title(fieldDef, config) {
      return titleFormatter(fieldDef, config);
  }
  function defaultType(fieldDef, channel) {
      if (fieldDef.timeUnit) {
          return 'temporal';
      }
      if (fieldDef.bin) {
          return 'quantitative';
      }
      switch (rangeType(channel)) {
          case 'continuous':
              return 'quantitative';
          case 'discrete':
              return 'nominal';
          case 'flexible': // color
              return 'nominal';
          default:
              return 'quantitative';
      }
  }
  /**
   * Returns the fieldDef -- either from the outer channelDef or from the condition of channelDef.
   * @param channelDef
   */
  function getFieldDef(channelDef) {
      if (isFieldDef(channelDef)) {
          return channelDef;
      }
      else if (hasConditionalFieldDef(channelDef)) {
          return channelDef.condition;
      }
      return undefined;
  }
  /**
   * Convert type to full, lowercase type, or augment the fieldDef with a default type if missing.
   */
  function normalize(channelDef, channel) {
      if (isString(channelDef) || isNumber(channelDef) || isBoolean(channelDef)) {
          var primitiveType = isString(channelDef) ? 'string' :
              isNumber(channelDef) ? 'number' : 'boolean';
          warn(message.primitiveChannelDef(channel, primitiveType, channelDef));
          return { value: channelDef };
      }
      // If a fieldDef contains a field, we need type.
      if (isFieldDef(channelDef)) {
          return normalizeFieldDef(channelDef, channel);
      }
      else if (hasConditionalFieldDef(channelDef)) {
          return __assign({}, channelDef, { 
              // Need to cast as normalizeFieldDef normally return FieldDef, but here we know that it is definitely Condition<FieldDef>
              condition: normalizeFieldDef(channelDef.condition, channel) });
      }
      return channelDef;
  }
  function normalizeFieldDef(fieldDef, channel) {
      // Drop invalid aggregate
      if (fieldDef.aggregate && !isAggregateOp(fieldDef.aggregate)) {
          var aggregate = fieldDef.aggregate, fieldDefWithoutAggregate = __rest(fieldDef, ["aggregate"]);
          warn(message.invalidAggregate(fieldDef.aggregate));
          fieldDef = fieldDefWithoutAggregate;
      }
      // Normalize Time Unit
      if (fieldDef.timeUnit) {
          fieldDef = __assign({}, fieldDef, { timeUnit: normalizeTimeUnit(fieldDef.timeUnit) });
      }
      // Normalize bin
      if (fieldDef.bin) {
          fieldDef = __assign({}, fieldDef, { bin: normalizeBin(fieldDef.bin, channel) });
      }
      // Normalize Type
      if (fieldDef.type) {
          var fullType = getFullName(fieldDef.type);
          if (fieldDef.type !== fullType) {
              // convert short type to full type
              fieldDef = __assign({}, fieldDef, { type: fullType });
          }
          if (fieldDef.type !== 'quantitative') {
              if (isCountingAggregateOp(fieldDef.aggregate)) {
                  warn(message.invalidFieldTypeForCountAggregate(fieldDef.type, fieldDef.aggregate));
                  fieldDef = __assign({}, fieldDef, { type: 'quantitative' });
              }
          }
      }
      else {
          // If type is empty / invalid, then augment with default type
          var newType = defaultType(fieldDef, channel);
          warn(message.emptyOrInvalidFieldType(fieldDef.type, channel, newType));
          fieldDef = __assign({}, fieldDef, { type: newType });
      }
      var _a = channelCompatibility(fieldDef, channel), compatible = _a.compatible, warning = _a.warning;
      if (!compatible) {
          warn(warning);
      }
      return fieldDef;
  }
  function normalizeBin(bin, channel) {
      if (isBoolean(bin)) {
          return { maxbins: autoMaxBins(channel) };
      }
      else if (!bin.maxbins && !bin.step) {
          return __assign({}, bin, { maxbins: autoMaxBins(channel) });
      }
      else {
          return bin;
      }
  }
  var COMPATIBLE = { compatible: true };
  function channelCompatibility(fieldDef, channel) {
      var type = fieldDef.type;
      switch (channel) {
          case 'row':
          case 'column':
              if (isContinuous(fieldDef)) {
                  return {
                      compatible: false,
                      warning: message.facetChannelShouldBeDiscrete(channel)
                  };
              }
              return COMPATIBLE;
          case 'x':
          case 'y':
          case 'color':
          case 'fill':
          case 'stroke':
          case 'text':
          case 'detail':
          case 'key':
          case 'tooltip':
          case 'href':
              return COMPATIBLE;
          case 'longitude':
          case 'longitude2':
          case 'latitude':
          case 'latitude2':
              if (type !== QUANTITATIVE) {
                  return {
                      compatible: false,
                      warning: "Channel " + channel + " should be used with a quantitative field only, not " + fieldDef.type + " field."
                  };
              }
              return COMPATIBLE;
          case 'opacity':
          case 'size':
          case 'x2':
          case 'y2':
              if ((type === 'nominal' && !fieldDef['sort']) || type === 'geojson') {
                  return {
                      compatible: false,
                      warning: "Channel " + channel + " should not be used with an unsorted discrete field."
                  };
              }
              return COMPATIBLE;
          case 'shape':
              if (fieldDef.type !== 'nominal' && fieldDef.type !== 'geojson') {
                  return {
                      compatible: false,
                      warning: 'Shape channel should be used with only either nominal or geojson data'
                  };
              }
              return COMPATIBLE;
          case 'order':
              if (fieldDef.type === 'nominal') {
                  return {
                      compatible: false,
                      warning: "Channel order is inappropriate for nominal field, which has no inherent order."
                  };
              }
              return COMPATIBLE;
      }
      throw new Error('channelCompatability not implemented for channel ' + channel);
  }
  function isNumberFieldDef(fieldDef) {
      return fieldDef.type === 'quantitative' || !!fieldDef.bin;
  }
  function isTimeFieldDef(fieldDef) {
      return fieldDef.type === 'temporal' || !!fieldDef.timeUnit;
  }

  var fielddef = /*#__PURE__*/Object.freeze({
    isConditionalSelection: isConditionalSelection,
    isRepeatRef: isRepeatRef,
    toFieldDefBase: toFieldDefBase,
    isConditionalDef: isConditionalDef,
    hasConditionalFieldDef: hasConditionalFieldDef,
    hasConditionalValueDef: hasConditionalValueDef,
    isFieldDef: isFieldDef,
    isStringFieldDef: isStringFieldDef,
    isValueDef: isValueDef,
    isScaleFieldDef: isScaleFieldDef,
    vgField: vgField,
    isDiscrete: isDiscrete,
    isContinuous: isContinuous,
    isCount: isCount,
    verbalTitleFormatter: verbalTitleFormatter,
    functionalTitleFormatter: functionalTitleFormatter,
    defaultTitleFormatter: defaultTitleFormatter,
    setTitleFormatter: setTitleFormatter,
    resetTitleFormatter: resetTitleFormatter,
    title: title,
    defaultType: defaultType,
    getFieldDef: getFieldDef,
    normalize: normalize,
    normalizeFieldDef: normalizeFieldDef,
    normalizeBin: normalizeBin,
    channelCompatibility: channelCompatibility,
    isNumberFieldDef: isNumberFieldDef,
    isTimeFieldDef: isTimeFieldDef
  });

  function channelHasField(encoding, channel) {
      var channelDef = encoding && encoding[channel];
      if (channelDef) {
          if (isArray(channelDef)) {
              return some(channelDef, function (fieldDef) { return !!fieldDef.field; });
          }
          else {
              return isFieldDef(channelDef) || hasConditionalFieldDef(channelDef);
          }
      }
      return false;
  }
  function isAggregate(encoding) {
      return some(CHANNELS, function (channel) {
          if (channelHasField(encoding, channel)) {
              var channelDef = encoding[channel];
              if (isArray(channelDef)) {
                  return some(channelDef, function (fieldDef) { return !!fieldDef.aggregate; });
              }
              else {
                  var fieldDef = getFieldDef(channelDef);
                  return fieldDef && !!fieldDef.aggregate;
              }
          }
          return false;
      });
  }
  function normalizeEncoding(encoding, mark) {
      return keys(encoding).reduce(function (normalizedEncoding, channel) {
          if (!isChannel(channel)) {
              // Drop invalid channel
              warn(message.invalidEncodingChannel(channel));
              return normalizedEncoding;
          }
          if (!supportMark(channel, mark)) {
              // Drop unsupported channel
              warn(message.incompatibleChannel(channel, mark));
              return normalizedEncoding;
          }
          // Drop line's size if the field is aggregated.
          if (channel === 'size' && mark === 'line') {
              var fieldDef = getFieldDef(encoding[channel]);
              if (fieldDef && fieldDef.aggregate) {
                  warn(message.LINE_WITH_VARYING_SIZE);
                  return normalizedEncoding;
              }
          }
          // Drop color if either fill or stroke is specified
          if (channel === 'color' && ('fill' in encoding || 'stroke' in encoding)) {
              warn(message.droppingColor('encoding', { fill: 'fill' in encoding, stroke: 'stroke' in encoding }));
              return normalizedEncoding;
          }
          var channelDef = encoding[channel];
          if (channel === 'detail' ||
              (channel === 'order' && !isArray(channelDef) && !isValueDef(channelDef)) ||
              (channel === 'tooltip' && isArray(channelDef))) {
              if (channelDef) {
                  // Array of fieldDefs for detail channel (or production rule)
                  normalizedEncoding[channel] = (isArray(channelDef) ? channelDef : [channelDef])
                      .reduce(function (defs, fieldDef) {
                      if (!isFieldDef(fieldDef)) {
                          warn(message.emptyFieldDef(fieldDef, channel));
                      }
                      else {
                          defs.push(normalizeFieldDef(fieldDef, channel));
                      }
                      return defs;
                  }, []);
              }
          }
          else {
              var fieldDef = getFieldDef(encoding[channel]);
              if (fieldDef && contains([Type.LATITUDE, Type.LONGITUDE], fieldDef.type)) {
                  var _a = channel, _ = normalizedEncoding[_a], newEncoding = __rest(normalizedEncoding, [typeof _a === "symbol" ? _a : _a + ""]);
                  var newChannel = channel === 'x' ? 'longitude' :
                      channel === 'y' ? 'latitude' :
                          channel === 'x2' ? 'longitude2' :
                              channel === 'y2' ? 'latitude2' : undefined;
                  warn(message.latLongDeprecated(channel, fieldDef.type, newChannel));
                  return __assign({}, newEncoding, (_b = {}, _b[newChannel] = __assign({}, normalize(fieldDef, channel), { type: 'quantitative' }), _b));
              }
              if (!isFieldDef(channelDef) && !isValueDef(channelDef) && !isConditionalDef(channelDef)) {
                  warn(message.emptyFieldDef(channelDef, channel));
                  return normalizedEncoding;
              }
              normalizedEncoding[channel] = normalize(channelDef, channel);
          }
          return normalizedEncoding;
          var _b;
      }, {});
  }
  function isRanged(encoding) {
      return encoding && ((!!encoding.x && !!encoding.x2) || (!!encoding.y && !!encoding.y2));
  }
  function fieldDefs(encoding) {
      var arr = [];
      CHANNELS.forEach(function (channel) {
          if (channelHasField(encoding, channel)) {
              var channelDef = encoding[channel];
              (isArray(channelDef) ? channelDef : [channelDef]).forEach(function (def) {
                  if (isFieldDef(def)) {
                      arr.push(def);
                  }
                  else if (hasConditionalFieldDef(def)) {
                      arr.push(def.condition);
                  }
              });
          }
      });
      return arr;
  }
  function forEach(mapping, f, thisArg) {
      if (!mapping) {
          return;
      }
      var _loop_1 = function (channel) {
          if (isArray(mapping[channel])) {
              mapping[channel].forEach(function (channelDef) {
                  f.call(thisArg, channelDef, channel);
              });
          }
          else {
              f.call(thisArg, mapping[channel], channel);
          }
      };
      for (var _i = 0, _a = keys(mapping); _i < _a.length; _i++) {
          var channel = _a[_i];
          _loop_1(channel);
      }
  }
  function reduce(mapping, f, init, thisArg) {
      if (!mapping) {
          return init;
      }
      return keys(mapping).reduce(function (r, channel) {
          var map = mapping[channel];
          if (isArray(map)) {
              return map.reduce(function (r1, channelDef) {
                  return f.call(thisArg, r1, channelDef, channel);
              }, r);
          }
          else {
              return f.call(thisArg, r, map, channel);
          }
      }, init);
  }

  var encoding = /*#__PURE__*/Object.freeze({
    channelHasField: channelHasField,
    isAggregate: isAggregate,
    normalizeEncoding: normalizeEncoding,
    isRanged: isRanged,
    fieldDefs: fieldDefs,
    forEach: forEach,
    reduce: reduce
  });

  function getMarkSpecificConfigMixins(markSpecificConfig, channel) {
      var value = markSpecificConfig[channel];
      return value !== undefined ? (_a = {}, _a[channel] = { value: value }, _a) : {};
      var _a;
  }

  var BOXPLOT = 'box-plot';
  function isBoxPlotDef(mark) {
      return !!mark['type'];
  }
  var BOXPLOT_STYLES = ['boxWhisker', 'box', 'boxMid'];
  var VL_ONLY_BOXPLOT_CONFIG_PROPERTY_INDEX = {
      box: ['size', 'color', 'extent'],
      boxWhisker: ['color'],
      boxMid: ['color']
  };
  var supportedChannels = ['x', 'y', 'color', 'detail', 'opacity', 'size'];
  function filterUnsupportedChannels(spec) {
      return __assign({}, spec, { encoding: reduce(spec.encoding, function (newEncoding, fieldDef, channel) {
              if (supportedChannels.indexOf(channel) > -1) {
                  newEncoding[channel] = fieldDef;
              }
              else {
                  warn(message.incompatibleChannel(channel, BOXPLOT));
              }
              return newEncoding;
          }, {}) });
  }
  function normalizeBoxPlot(spec, config) {
      spec = filterUnsupportedChannels(spec);
      // TODO: use selection
      var mark = spec.mark, encoding = spec.encoding, selection = spec.selection, _p = spec.projection, outerSpec = __rest(spec, ["mark", "encoding", "selection", "projection"]);
      var kIQRScalar = undefined;
      if (isNumber(config.box.extent)) {
          kIQRScalar = config.box.extent;
      }
      if (isBoxPlotDef(mark)) {
          if (mark.extent) {
              if (mark.extent === 'min-max') {
                  kIQRScalar = undefined;
              }
          }
      }
      var orient = boxOrient(spec);
      var _a = boxParams(spec, orient, kIQRScalar), transform = _a.transform, continuousAxisChannelDef = _a.continuousAxisChannelDef, continuousAxis = _a.continuousAxis, encodingWithoutContinuousAxis = _a.encodingWithoutContinuousAxis;
      var size = encodingWithoutContinuousAxis.size, encodingWithoutSizeColorAndContinuousAxis = __rest(encodingWithoutContinuousAxis, ["color", "size"]);
      // Size encoding or the default config.box.size is applied to box and boxMid
      var sizeMixins = size ? { size: size } : getMarkSpecificConfigMixins(config.box, 'size');
      var continuousAxisScaleAndAxis = {};
      if (continuousAxisChannelDef.scale) {
          continuousAxisScaleAndAxis['scale'] = continuousAxisChannelDef.scale;
      }
      if (continuousAxisChannelDef.axis) {
          continuousAxisScaleAndAxis['axis'] = continuousAxisChannelDef.axis;
      }
      return __assign({}, outerSpec, { transform: transform, layer: [
              {
                  mark: {
                      type: 'rule',
                      style: 'boxWhisker'
                  },
                  encoding: __assign((_b = {}, _b[continuousAxis] = __assign({ field: 'lower_whisker_' + continuousAxisChannelDef.field, type: continuousAxisChannelDef.type }, continuousAxisScaleAndAxis), _b[continuousAxis + '2'] = {
                      field: 'lower_box_' + continuousAxisChannelDef.field,
                      type: continuousAxisChannelDef.type
                  }, _b), encodingWithoutSizeColorAndContinuousAxis, getMarkSpecificConfigMixins(config.boxWhisker, 'color'))
              }, {
                  mark: {
                      type: 'rule',
                      style: 'boxWhisker'
                  },
                  encoding: __assign((_c = {}, _c[continuousAxis] = {
                      field: 'upper_box_' + continuousAxisChannelDef.field,
                      type: continuousAxisChannelDef.type
                  }, _c[continuousAxis + '2'] = {
                      field: 'upper_whisker_' + continuousAxisChannelDef.field,
                      type: continuousAxisChannelDef.type
                  }, _c), encodingWithoutSizeColorAndContinuousAxis, getMarkSpecificConfigMixins(config.boxWhisker, 'color'))
              },
              __assign({}, (selection ? { selection: selection } : {}), { mark: {
                      type: 'bar',
                      style: 'box'
                  }, encoding: __assign((_d = {}, _d[continuousAxis] = {
                      field: 'lower_box_' + continuousAxisChannelDef.field,
                      type: continuousAxisChannelDef.type
                  }, _d[continuousAxis + '2'] = {
                      field: 'upper_box_' + continuousAxisChannelDef.field,
                      type: continuousAxisChannelDef.type
                  }, _d), encodingWithoutContinuousAxis, (encodingWithoutContinuousAxis.color ? {} : getMarkSpecificConfigMixins(config.box, 'color')), sizeMixins) }),
              {
                  mark: {
                      type: 'tick',
                      style: 'boxMid'
                  },
                  encoding: __assign((_e = {}, _e[continuousAxis] = {
                      field: 'mid_box_' + continuousAxisChannelDef.field,
                      type: continuousAxisChannelDef.type
                  }, _e), encodingWithoutSizeColorAndContinuousAxis, getMarkSpecificConfigMixins(config.boxMid, 'color'), sizeMixins)
              }
          ] });
      var _b, _c, _d, _e;
  }
  function boxOrient(spec) {
      var mark = spec.mark, encoding = spec.encoding, _p = spec.projection, _outerSpec = __rest(spec, ["mark", "encoding", "projection"]);
      if (isFieldDef(encoding.x) && isContinuous(encoding.x)) {
          // x is continuous
          if (isFieldDef(encoding.y) && isContinuous(encoding.y)) {
              // both x and y are continuous
              if (encoding.x.aggregate === undefined && encoding.y.aggregate === BOXPLOT) {
                  return 'vertical';
              }
              else if (encoding.y.aggregate === undefined && encoding.x.aggregate === BOXPLOT) {
                  return 'horizontal';
              }
              else if (encoding.x.aggregate === BOXPLOT && encoding.y.aggregate === BOXPLOT) {
                  throw new Error('Both x and y cannot have aggregate');
              }
              else {
                  if (isBoxPlotDef(mark) && mark.orient) {
                      return mark.orient;
                  }
                  // default orientation = vertical
                  return 'vertical';
              }
          }
          // x is continuous but y is not
          return 'horizontal';
      }
      else if (isFieldDef(encoding.y) && isContinuous(encoding.y)) {
          // y is continuous but x is not
          return 'vertical';
      }
      else {
          // Neither x nor y is continuous.
          throw new Error('Need a valid continuous axis for boxplots');
      }
  }
  function boxContinousAxis(spec, orient) {
      var mark = spec.mark, encoding = spec.encoding, _p = spec.projection, _outerSpec = __rest(spec, ["mark", "encoding", "projection"]);
      var continuousAxisChannelDef;
      var continuousAxis;
      if (orient === 'vertical') {
          continuousAxis = 'y';
          continuousAxisChannelDef = encoding.y; // Safe to cast because if y is not continuous fielddef, the orient would not be vertical.
      }
      else {
          continuousAxis = 'x';
          continuousAxisChannelDef = encoding.x; // Safe to cast because if x is not continuous fielddef, the orient would not be horizontal.
      }
      if (continuousAxisChannelDef && continuousAxisChannelDef.aggregate) {
          var aggregate = continuousAxisChannelDef.aggregate, continuousAxisWithoutAggregate = __rest(continuousAxisChannelDef, ["aggregate"]);
          if (aggregate !== BOXPLOT) {
              warn("Continuous axis should not have customized aggregation function " + aggregate);
          }
          continuousAxisChannelDef = continuousAxisWithoutAggregate;
      }
      return {
          continuousAxisChannelDef: continuousAxisChannelDef,
          continuousAxis: continuousAxis
      };
  }
  function boxParams(spec, orient, kIQRScalar) {
      var _a = boxContinousAxis(spec, orient), continuousAxisChannelDef = _a.continuousAxisChannelDef, continuousAxis = _a.continuousAxis;
      var encoding = spec.encoding;
      var isMinMax = kIQRScalar === undefined;
      var aggregate = [
          {
              op: 'q1',
              field: continuousAxisChannelDef.field,
              as: 'lower_box_' + continuousAxisChannelDef.field
          },
          {
              op: 'q3',
              field: continuousAxisChannelDef.field,
              as: 'upper_box_' + continuousAxisChannelDef.field
          },
          {
              op: 'median',
              field: continuousAxisChannelDef.field,
              as: 'mid_box_' + continuousAxisChannelDef.field
          }
      ];
      var postAggregateCalculates = [];
      aggregate.push({
          op: 'min',
          field: continuousAxisChannelDef.field,
          as: (isMinMax ? 'lower_whisker_' : 'min_') + continuousAxisChannelDef.field
      });
      aggregate.push({
          op: 'max',
          field: continuousAxisChannelDef.field,
          as: (isMinMax ? 'upper_whisker_' : 'max_') + continuousAxisChannelDef.field
      });
      if (!isMinMax) {
          postAggregateCalculates = [
              {
                  calculate: "datum.upper_box_" + continuousAxisChannelDef.field + " - datum.lower_box_" + continuousAxisChannelDef.field,
                  as: 'iqr_' + continuousAxisChannelDef.field
              },
              {
                  calculate: "min(datum.upper_box_" + continuousAxisChannelDef.field + " + datum.iqr_" + continuousAxisChannelDef.field + " * " + kIQRScalar + ", datum.max_" + continuousAxisChannelDef.field + ")",
                  as: 'upper_whisker_' + continuousAxisChannelDef.field
              },
              {
                  calculate: "max(datum.lower_box_" + continuousAxisChannelDef.field + " - datum.iqr_" + continuousAxisChannelDef.field + " * " + kIQRScalar + ", datum.min_" + continuousAxisChannelDef.field + ")",
                  as: 'lower_whisker_' + continuousAxisChannelDef.field
              }
          ];
      }
      var groupby = [];
      var bins = [];
      var timeUnits = [];
      var encodingWithoutContinuousAxis = {};
      forEach(encoding, function (channelDef, channel) {
          if (channel === continuousAxis) {
              // Skip continuous axis as we already handle it separately
              return;
          }
          if (isFieldDef(channelDef)) {
              if (channelDef.aggregate && channelDef.aggregate !== BOXPLOT) {
                  aggregate.push({
                      op: channelDef.aggregate,
                      field: channelDef.field,
                      as: vgField(channelDef)
                  });
              }
              else if (channelDef.aggregate === undefined) {
                  var transformedField = vgField(channelDef);
                  // Add bin or timeUnit transform if applicable
                  var bin = channelDef.bin;
                  if (bin) {
                      var field$$1 = channelDef.field;
                      bins.push({ bin: bin, field: field$$1, as: transformedField });
                  }
                  else if (channelDef.timeUnit) {
                      var timeUnit = channelDef.timeUnit, field$$1 = channelDef.field;
                      timeUnits.push({ timeUnit: timeUnit, field: field$$1, as: transformedField });
                  }
                  groupby.push(transformedField);
              }
              // now the field should refer to post-transformed field instead
              encodingWithoutContinuousAxis[channel] = {
                  field: vgField(channelDef),
                  type: channelDef.type
              };
          }
          else {
              // For value def, just copy
              encodingWithoutContinuousAxis[channel] = encoding[channel];
          }
      });
      return {
          transform: [].concat(bins, timeUnits, [{ aggregate: aggregate, groupby: groupby }], postAggregateCalculates),
          continuousAxisChannelDef: continuousAxisChannelDef,
          continuousAxis: continuousAxis,
          encodingWithoutContinuousAxis: encodingWithoutContinuousAxis
      };
  }

  var ERRORBAR = 'error-bar';
  function normalizeErrorBar(spec) {
      // TODO: use selection
      var _m = spec.mark, _sel = spec.selection, _p = spec.projection, encoding = spec.encoding, outerSpec = __rest(spec, ["mark", "selection", "projection", "encoding"]);
      var _s = encoding.size, encodingWithoutSize = __rest(encoding, ["size"]);
      var _x2 = encoding.x2, _y2 = encoding.y2, encodingWithoutX2Y2 = __rest(encoding, ["x2", "y2"]);
      var encodingWithoutX_X2_Y_Y2 = __rest(encodingWithoutX2Y2, ["x", "y"]);
      if (!encoding.x2 && !encoding.y2) {
          throw new Error('Neither x2 or y2 provided');
      }
      return __assign({}, outerSpec, { layer: [
              {
                  mark: 'rule',
                  encoding: encodingWithoutSize
              }, {
                  mark: 'tick',
                  encoding: encodingWithoutX2Y2
              }, {
                  mark: 'tick',
                  encoding: encoding.x2 ? __assign({ x: encoding.x2, y: encoding.y }, encodingWithoutX_X2_Y_Y2) : __assign({ x: encoding.x, y: encoding.y2 }, encodingWithoutX_X2_Y_Y2)
              }
          ] });
  }

  /**
   * Registry index for all composite mark's normalizer
   */
  var normalizerRegistry = {};
  function add(mark, normalizer) {
      normalizerRegistry[mark] = normalizer;
  }
  function remove(mark) {
      delete normalizerRegistry[mark];
  }
  var COMPOSITE_MARK_STYLES = BOXPLOT_STYLES;
  var VL_ONLY_COMPOSITE_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX = __assign({}, VL_ONLY_BOXPLOT_CONFIG_PROPERTY_INDEX);
  add(BOXPLOT, normalizeBoxPlot);
  add(ERRORBAR, normalizeErrorBar);
  /**
   * Transform a unit spec with composite mark into a normal layer spec.
   */
  function normalize$1(
  // This GenericUnitSpec has any as Encoding because unit specs with composite mark can have additional encoding channels.
  spec, config) {
      var mark = isMarkDef(spec.mark) ? spec.mark.type : spec.mark;
      var normalizer = normalizerRegistry[mark];
      if (normalizer) {
          return normalizer(spec, config);
      }
      throw new Error("Invalid mark type \"" + mark + "\"");
  }

  var index = /*#__PURE__*/Object.freeze({
    add: add,
    remove: remove,
    COMPOSITE_MARK_STYLES: COMPOSITE_MARK_STYLES,
    VL_ONLY_COMPOSITE_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX: VL_ONLY_COMPOSITE_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX,
    normalize: normalize$1
  });

  var VL_ONLY_GUIDE_CONFIG = ['shortTimeLabels'];

  var defaultLegendConfig = {};
  var COMMON_LEGEND_PROPERTY_INDEX = {
      entryPadding: 1,
      format: 1,
      offset: 1,
      orient: 1,
      padding: 1,
      tickCount: 1,
      title: 1,
      type: 1,
      values: 1,
      zindex: 1
  };
  var VG_LEGEND_PROPERTY_INDEX = __assign({}, COMMON_LEGEND_PROPERTY_INDEX, { 
      // channel scales
      opacity: 1, shape: 1, stroke: 1, fill: 1, size: 1, 
      // encode
      encode: 1 });
  var LEGEND_PROPERTIES = flagKeys(COMMON_LEGEND_PROPERTY_INDEX);
  var VG_LEGEND_PROPERTIES = flagKeys(VG_LEGEND_PROPERTY_INDEX);

  var legend = /*#__PURE__*/Object.freeze({
    defaultLegendConfig: defaultLegendConfig,
    LEGEND_PROPERTIES: LEGEND_PROPERTIES,
    VG_LEGEND_PROPERTIES: VG_LEGEND_PROPERTIES
  });

  var ScaleType;
  (function (ScaleType) {
      // Continuous - Quantitative
      ScaleType.LINEAR = 'linear';
      ScaleType.BIN_LINEAR = 'bin-linear';
      ScaleType.LOG = 'log';
      ScaleType.POW = 'pow';
      ScaleType.SQRT = 'sqrt';
      // Continuous - Time
      ScaleType.TIME = 'time';
      ScaleType.UTC = 'utc';
      // sequential
      ScaleType.SEQUENTIAL = 'sequential';
      // Quantile, Quantize, threshold
      ScaleType.QUANTILE = 'quantile';
      ScaleType.QUANTIZE = 'quantize';
      ScaleType.THRESHOLD = 'threshold';
      ScaleType.ORDINAL = 'ordinal';
      ScaleType.BIN_ORDINAL = 'bin-ordinal';
      ScaleType.POINT = 'point';
      ScaleType.BAND = 'band';
  })(ScaleType || (ScaleType = {}));
  /**
   * Index for scale categories -- only scale of the same categories can be merged together.
   * Current implementation is trying to be conservative and avoid merging scale type that might not work together
   */
  var SCALE_CATEGORY_INDEX = {
      linear: 'numeric',
      log: 'numeric',
      pow: 'numeric',
      sqrt: 'numeric',
      'bin-linear': 'bin-linear',
      time: 'time',
      utc: 'time',
      sequential: 'sequential',
      ordinal: 'ordinal',
      'bin-ordinal': 'bin-ordinal',
      point: 'ordinal-position',
      band: 'ordinal-position'
  };
  var SCALE_TYPES = keys(SCALE_CATEGORY_INDEX);
  /**
   * Whether the two given scale types can be merged together.
   */
  function scaleCompatible(scaleType1, scaleType2) {
      var scaleCategory1 = SCALE_CATEGORY_INDEX[scaleType1];
      var scaleCategory2 = SCALE_CATEGORY_INDEX[scaleType2];
      return scaleCategory1 === scaleCategory2 ||
          (scaleCategory1 === 'ordinal-position' && scaleCategory2 === 'time') ||
          (scaleCategory2 === 'ordinal-position' && scaleCategory1 === 'time');
  }
  /**
   * Index for scale precedence -- high score = higher priority for merging.
   */
  var SCALE_PRECEDENCE_INDEX = {
      // numeric
      linear: 0,
      log: 1,
      pow: 1,
      sqrt: 1,
      // time
      time: 0,
      utc: 0,
      // ordinal-position -- these have higher precedence than continuous scales as they support more types of data
      point: 10,
      band: 11,
      // non grouped types
      'bin-linear': 0,
      sequential: 0,
      ordinal: 0,
      'bin-ordinal': 0,
  };
  /**
   * Return scale categories -- only scale of the same categories can be merged together.
   */
  function scaleTypePrecedence(scaleType) {
      return SCALE_PRECEDENCE_INDEX[scaleType];
  }
  var CONTINUOUS_TO_CONTINUOUS_SCALES = ['linear', 'bin-linear', 'log', 'pow', 'sqrt', 'time', 'utc'];
  var CONTINUOUS_TO_CONTINUOUS_INDEX = toSet(CONTINUOUS_TO_CONTINUOUS_SCALES);
  var CONTINUOUS_DOMAIN_SCALES = CONTINUOUS_TO_CONTINUOUS_SCALES.concat(['sequential' /* TODO add 'quantile', 'quantize', 'threshold'*/]);
  var CONTINUOUS_DOMAIN_INDEX = toSet(CONTINUOUS_DOMAIN_SCALES);
  var DISCRETE_DOMAIN_SCALES = ['ordinal', 'bin-ordinal', 'point', 'band'];
  var DISCRETE_DOMAIN_INDEX = toSet(DISCRETE_DOMAIN_SCALES);
  var BIN_SCALES_INDEX = toSet(['bin-linear', 'bin-ordinal']);
  var TIME_SCALE_TYPES = ['time', 'utc'];
  function hasDiscreteDomain(type) {
      return type in DISCRETE_DOMAIN_INDEX;
  }
  function isBinScale(type) {
      return type in BIN_SCALES_INDEX;
  }
  function hasContinuousDomain(type) {
      return type in CONTINUOUS_DOMAIN_INDEX;
  }
  function isContinuousToContinuous(type) {
      return type in CONTINUOUS_TO_CONTINUOUS_INDEX;
  }
  var defaultScaleConfig = {
      textXRangeStep: 90,
      rangeStep: 21,
      pointPadding: 0.5,
      bandPaddingInner: 0.1,
      facetSpacing: 16,
      minBandSize: 2,
      minFontSize: 8,
      maxFontSize: 40,
      minOpacity: 0.3,
      maxOpacity: 0.8,
      // FIXME: revise if these *can* become ratios of rangeStep
      minSize: 9,
      minStrokeWidth: 1,
      maxStrokeWidth: 4
  };
  function isExtendedScheme(scheme) {
      return scheme && !!scheme['name'];
  }
  function isSelectionDomain(domain) {
      return domain && domain['selection'];
  }
  var SCALE_PROPERTY_INDEX = {
      type: 1,
      domain: 1,
      range: 1,
      rangeStep: 1,
      scheme: 1,
      // Other properties
      reverse: 1,
      round: 1,
      // quantitative / time
      clamp: 1,
      nice: 1,
      // quantitative
      base: 1,
      exponent: 1,
      interpolate: 1,
      zero: 1,
      // band/point
      padding: 1,
      paddingInner: 1,
      paddingOuter: 1
  };
  var SCALE_PROPERTIES = flagKeys(SCALE_PROPERTY_INDEX);
  var NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTY_INDEX = __rest(SCALE_PROPERTY_INDEX, ["type", "domain", "range", "rangeStep", "scheme"]);
  var NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES = flagKeys(NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTY_INDEX);
  var SCALE_TYPE_INDEX = generateScaleTypeIndex();
  function scaleTypeSupportProperty(scaleType, propName) {
      switch (propName) {
          case 'type':
          case 'domain':
          case 'reverse':
          case 'range':
              return true;
          case 'scheme':
              return contains(['sequential', 'ordinal', 'bin-ordinal', 'quantile', 'quantize'], scaleType);
          case 'interpolate':
              // FIXME(https://github.com/vega/vega-lite/issues/2902) how about ordinal?
              return contains(['linear', 'bin-linear', 'pow', 'log', 'sqrt', 'utc', 'time'], scaleType);
          case 'round':
              return isContinuousToContinuous(scaleType) || scaleType === 'band' || scaleType === 'point';
          case 'padding':
              return isContinuousToContinuous(scaleType) || contains(['point', 'band'], scaleType);
          case 'paddingOuter':
          case 'rangeStep':
              return contains(['point', 'band'], scaleType);
          case 'paddingInner':
              return scaleType === 'band';
          case 'clamp':
              return isContinuousToContinuous(scaleType) || scaleType === 'sequential';
          case 'nice':
              return isContinuousToContinuous(scaleType) || scaleType === 'sequential' || scaleType === 'quantize';
          case 'exponent':
              return scaleType === 'pow';
          case 'base':
              return scaleType === 'log';
          case 'zero':
              return hasContinuousDomain(scaleType) && !contains([
                  'log',
                  'time', 'utc',
                  'bin-linear',
                  'threshold',
                  'quantile' // quantile depends on distribution so zero does not matter
              ], scaleType);
      }
      /* istanbul ignore next: should never reach here*/
      throw new Error("Invalid scale property " + propName + ".");
  }
  /**
   * Returns undefined if the input channel supports the input scale property name
   */
  function channelScalePropertyIncompatability(channel, propName) {
      switch (propName) {
          case 'interpolate':
          case 'scheme':
              if (!isColorChannel(channel)) {
                  return message.cannotUseScalePropertyWithNonColor(channel);
              }
              return undefined;
          case 'type':
          case 'domain':
          case 'range':
          case 'base':
          case 'exponent':
          case 'nice':
          case 'padding':
          case 'paddingInner':
          case 'paddingOuter':
          case 'rangeStep':
          case 'reverse':
          case 'round':
          case 'clamp':
          case 'zero':
              return undefined; // GOOD!
      }
      /* istanbul ignore next: it should never reach here */
      throw new Error("Invalid scale property \"" + propName + "\".");
  }
  function scaleTypeSupportDataType(specifiedType, fieldDefType, bin) {
      if (contains([Type.ORDINAL, Type.NOMINAL], fieldDefType)) {
          return specifiedType === undefined || hasDiscreteDomain(specifiedType);
      }
      else if (fieldDefType === Type.TEMPORAL) {
          return contains([ScaleType.TIME, ScaleType.UTC, ScaleType.SEQUENTIAL, undefined], specifiedType);
      }
      else if (fieldDefType === Type.QUANTITATIVE) {
          if (bin) {
              return contains([ScaleType.BIN_LINEAR, ScaleType.BIN_ORDINAL, ScaleType.LINEAR], specifiedType);
          }
          return contains([ScaleType.LOG, ScaleType.POW, ScaleType.SQRT, ScaleType.QUANTILE, ScaleType.QUANTIZE, ScaleType.LINEAR, ScaleType.SEQUENTIAL, undefined], specifiedType);
      }
      return true;
  }
  function channelSupportScaleType(channel, scaleType) {
      switch (channel) {
          case Channel.X:
          case Channel.Y:
          case Channel.SIZE: // TODO: size and opacity can support ordinal with more modification
          case Channel.OPACITY:
              // Although it generally doesn't make sense to use band with size and opacity,
              // it can also work since we use band: 0.5 to get midpoint.
              return isContinuousToContinuous(scaleType) || contains(['band', 'point'], scaleType);
          case Channel.COLOR:
          case Channel.FILL:
          case Channel.STROKE:
              return scaleType !== 'band'; // band does not make sense with color
          case Channel.SHAPE:
              return scaleType === 'ordinal'; // shape = lookup only
      }
      /* istanbul ignore next: it should never reach here */
      return false;
  }
  function getSupportedScaleType(channel, fieldDefType, bin) {
      return SCALE_TYPE_INDEX[generateScaleTypeIndexKey(channel, fieldDefType, bin)];
  }
  // generates ScaleTypeIndex where keys are encoding channels and values are list of valid ScaleTypes
  function generateScaleTypeIndex() {
      var index = {};
      for (var _i = 0, CHANNELS_1 = CHANNELS; _i < CHANNELS_1.length; _i++) {
          var channel = CHANNELS_1[_i];
          for (var _a = 0, _b = keys(TYPE_INDEX); _a < _b.length; _a++) {
              var fieldDefType = _b[_a];
              for (var _c = 0, SCALE_TYPES_1 = SCALE_TYPES; _c < SCALE_TYPES_1.length; _c++) {
                  var scaleType = SCALE_TYPES_1[_c];
                  for (var _d = 0, _e = [false, true]; _d < _e.length; _d++) {
                      var bin = _e[_d];
                      var key$$1 = generateScaleTypeIndexKey(channel, fieldDefType, bin);
                      if (channelSupportScaleType(channel, scaleType) && scaleTypeSupportDataType(scaleType, fieldDefType, bin)) {
                          index[key$$1] = index[key$$1] || [];
                          index[key$$1].push(scaleType);
                      }
                  }
              }
          }
      }
      return index;
  }
  function generateScaleTypeIndexKey(channel, fieldDefType, bin) {
      var key$$1 = channel + '_' + fieldDefType;
      return bin ? key$$1 + '_bin' : key$$1;
  }

  var scale = /*#__PURE__*/Object.freeze({
    get ScaleType () { return ScaleType; },
    SCALE_TYPES: SCALE_TYPES,
    scaleCompatible: scaleCompatible,
    scaleTypePrecedence: scaleTypePrecedence,
    CONTINUOUS_TO_CONTINUOUS_SCALES: CONTINUOUS_TO_CONTINUOUS_SCALES,
    CONTINUOUS_DOMAIN_SCALES: CONTINUOUS_DOMAIN_SCALES,
    DISCRETE_DOMAIN_SCALES: DISCRETE_DOMAIN_SCALES,
    TIME_SCALE_TYPES: TIME_SCALE_TYPES,
    hasDiscreteDomain: hasDiscreteDomain,
    isBinScale: isBinScale,
    hasContinuousDomain: hasContinuousDomain,
    isContinuousToContinuous: isContinuousToContinuous,
    defaultScaleConfig: defaultScaleConfig,
    isExtendedScheme: isExtendedScheme,
    isSelectionDomain: isSelectionDomain,
    SCALE_PROPERTIES: SCALE_PROPERTIES,
    NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES: NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES,
    SCALE_TYPE_INDEX: SCALE_TYPE_INDEX,
    scaleTypeSupportProperty: scaleTypeSupportProperty,
    channelScalePropertyIncompatability: channelScalePropertyIncompatability,
    scaleTypeSupportDataType: scaleTypeSupportDataType,
    channelSupportScaleType: channelSupportScaleType,
    getSupportedScaleType: getSupportedScaleType
  });

  var SELECTION_ID = '_vgsid_';
  var defaultConfig = {
      single: {
          on: 'click',
          fields: [SELECTION_ID],
          resolve: 'global',
          empty: 'all'
      },
      multi: {
          on: 'click',
          fields: [SELECTION_ID],
          toggle: 'event.shiftKey',
          resolve: 'global',
          empty: 'all'
      },
      interval: {
          on: '[mousedown, window:mouseup] > window:mousemove!',
          encodings: ['x', 'y'],
          translate: '[mousedown, window:mouseup] > window:mousemove!',
          zoom: 'wheel!',
          mark: { fill: '#333', fillOpacity: 0.125, stroke: 'white' },
          resolve: 'global'
      }
  };

  function extractTitleConfig(titleConfig) {
      var 
      // These are non-mark title config that need to be hardcoded
      anchor = titleConfig.anchor, offset = titleConfig.offset, orient = titleConfig.orient, 
      // color needs to be redirect to fill
      color = titleConfig.color, 
      // The rest are mark config.
      titleMarkConfig = __rest(titleConfig, ["anchor", "offset", "orient", "color"]);
      var mark = __assign({}, titleMarkConfig, color ? { fill: color } : {});
      var nonMark = __assign({}, anchor ? { anchor: anchor } : {}, offset ? { offset: offset } : {}, orient ? { orient: orient } : {});
      return { mark: mark, nonMark: nonMark };
  }

  var defaultViewConfig = {
      width: 200,
      height: 200
  };
  var defaultConfig$1 = {
      padding: 5,
      timeFormat: '',
      countTitle: 'Number of Records',
      invalidValues: 'filter',
      view: defaultViewConfig,
      mark: defaultMarkConfig,
      area: {},
      bar: defaultBarConfig,
      circle: {},
      geoshape: {},
      line: {},
      point: {},
      rect: {},
      rule: { color: 'black' },
      square: {},
      text: { color: 'black' },
      tick: defaultTickConfig,
      trail: {},
      box: { size: 14, extent: 1.5 },
      boxWhisker: {},
      boxMid: { color: 'white' },
      scale: defaultScaleConfig,
      projection: {},
      axis: {},
      axisX: {},
      axisY: { minExtent: 30 },
      axisLeft: {},
      axisRight: {},
      axisTop: {},
      axisBottom: {},
      axisBand: {},
      legend: defaultLegendConfig,
      selection: defaultConfig,
      style: {},
      title: {},
  };
  function initConfig(config) {
      return mergeDeep(duplicate(defaultConfig$1), config);
  }
  var MARK_STYLES = ['view'].concat(PRIMITIVE_MARKS, COMPOSITE_MARK_STYLES);
  var VL_ONLY_CONFIG_PROPERTIES = [
      'padding', 'numberFormat', 'timeFormat', 'countTitle',
      'stack', 'scale', 'selection', 'invalidValues',
      'overlay' // FIXME: Redesign and unhide this
  ];
  var VL_ONLY_ALL_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX = __assign({ view: ['width', 'height'] }, VL_ONLY_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX, VL_ONLY_COMPOSITE_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX);
  function stripAndRedirectConfig(config) {
      config = duplicate(config);
      for (var _i = 0, VL_ONLY_CONFIG_PROPERTIES_1 = VL_ONLY_CONFIG_PROPERTIES; _i < VL_ONLY_CONFIG_PROPERTIES_1.length; _i++) {
          var prop = VL_ONLY_CONFIG_PROPERTIES_1[_i];
          delete config[prop];
      }
      // Remove Vega-Lite only axis/legend config
      if (config.axis) {
          for (var _a = 0, VL_ONLY_GUIDE_CONFIG_1 = VL_ONLY_GUIDE_CONFIG; _a < VL_ONLY_GUIDE_CONFIG_1.length; _a++) {
              var prop = VL_ONLY_GUIDE_CONFIG_1[_a];
              delete config.axis[prop];
          }
      }
      if (config.legend) {
          for (var _b = 0, VL_ONLY_GUIDE_CONFIG_2 = VL_ONLY_GUIDE_CONFIG; _b < VL_ONLY_GUIDE_CONFIG_2.length; _b++) {
              var prop = VL_ONLY_GUIDE_CONFIG_2[_b];
              delete config.legend[prop];
          }
      }
      // Remove Vega-Lite only generic mark config
      if (config.mark) {
          for (var _c = 0, VL_ONLY_MARK_CONFIG_PROPERTIES_1 = VL_ONLY_MARK_CONFIG_PROPERTIES; _c < VL_ONLY_MARK_CONFIG_PROPERTIES_1.length; _c++) {
              var prop = VL_ONLY_MARK_CONFIG_PROPERTIES_1[_c];
              delete config.mark[prop];
          }
      }
      for (var _d = 0, MARK_STYLES_1 = MARK_STYLES; _d < MARK_STYLES_1.length; _d++) {
          var markType = MARK_STYLES_1[_d];
          // Remove Vega-Lite-only mark config
          for (var _e = 0, VL_ONLY_MARK_CONFIG_PROPERTIES_2 = VL_ONLY_MARK_CONFIG_PROPERTIES; _e < VL_ONLY_MARK_CONFIG_PROPERTIES_2.length; _e++) {
              var prop = VL_ONLY_MARK_CONFIG_PROPERTIES_2[_e];
              delete config[markType][prop];
          }
          // Remove Vega-Lite only mark-specific config
          var vlOnlyMarkSpecificConfigs = VL_ONLY_ALL_MARK_SPECIFIC_CONFIG_PROPERTY_INDEX[markType];
          if (vlOnlyMarkSpecificConfigs) {
              for (var _f = 0, vlOnlyMarkSpecificConfigs_1 = vlOnlyMarkSpecificConfigs; _f < vlOnlyMarkSpecificConfigs_1.length; _f++) {
                  var prop = vlOnlyMarkSpecificConfigs_1[_f];
                  delete config[markType][prop];
              }
          }
          // Redirect mark config to config.style so that mark config only affect its own mark type
          // without affecting other marks that share the same underlying Vega marks.
          // For example, config.rect should not affect bar marks.
          redirectConfig(config, markType);
      }
      // Redirect config.title -- so that title config do not
      // affect header labels, which also uses `title` directive to implement.
      redirectConfig(config, 'title', 'group-title');
      // Remove empty config objects
      for (var prop in config) {
          if (isObject(config[prop]) && keys(config[prop]).length === 0) {
              delete config[prop];
          }
      }
      return keys(config).length > 0 ? config : undefined;
  }
  function redirectConfig(config, prop, toProp) {
      var propConfig = prop === 'title' ? extractTitleConfig(config.title).mark : config[prop];
      if (prop === 'view') {
          toProp = 'cell'; // View's default style is "cell"
      }
      var style = __assign({}, propConfig, config.style[prop]);
      // set config.style if it is not an empty object
      if (keys(style).length > 0) {
          config.style[toProp || prop] = style;
      }
      delete config[prop];
  }

  var config = /*#__PURE__*/Object.freeze({
    defaultViewConfig: defaultViewConfig,
    defaultConfig: defaultConfig$1,
    initConfig: initConfig,
    stripAndRedirectConfig: stripAndRedirectConfig
  });

  var STACK_OFFSET_INDEX = {
      zero: 1,
      center: 1,
      normalize: 1
  };
  function isStackOffset(s) {
      return !!STACK_OFFSET_INDEX[s];
  }
  var STACKABLE_MARKS = [BAR, AREA, RULE, POINT, CIRCLE, SQUARE, LINE, TEXT$1, TICK];
  var STACK_BY_DEFAULT_MARKS = [BAR, AREA];
  function potentialStackedChannel(encoding) {
      var xDef = encoding.x;
      var yDef = encoding.y;
      if (isFieldDef(xDef) && isFieldDef(yDef)) {
          if (xDef.type === 'quantitative' && yDef.type === 'quantitative') {
              if (xDef.stack) {
                  return 'x';
              }
              else if (yDef.stack) {
                  return 'y';
              }
              // if there is no explicit stacking, only apply stack if there is only one aggregate for x or y
              if ((!!xDef.aggregate) !== (!!yDef.aggregate)) {
                  return xDef.aggregate ? 'x' : 'y';
              }
          }
          else if (xDef.type === 'quantitative') {
              return 'x';
          }
          else if (yDef.type === 'quantitative') {
              return 'y';
          }
      }
      else if (isFieldDef(xDef) && xDef.type === 'quantitative') {
          return 'x';
      }
      else if (isFieldDef(yDef) && yDef.type === 'quantitative') {
          return 'y';
      }
      return undefined;
  }
  // Note: CompassQL uses this method and only pass in required properties of each argument object.
  // If required properties change, make sure to update CompassQL.
  function stack(m, encoding, stackConfig) {
      var mark = isMarkDef(m) ? m.type : m;
      // Should have stackable mark
      if (!contains(STACKABLE_MARKS, mark)) {
          return null;
      }
      var fieldChannel = potentialStackedChannel(encoding);
      if (!fieldChannel) {
          return null;
      }
      var stackedFieldDef = encoding[fieldChannel];
      var stackedField = isStringFieldDef(stackedFieldDef) ? vgField(stackedFieldDef, {}) : undefined;
      var dimensionChannel = fieldChannel === 'x' ? 'y' : 'x';
      var dimensionDef = encoding[dimensionChannel];
      var dimensionField = isStringFieldDef(dimensionDef) ? vgField(dimensionDef, {}) : undefined;
      // Should have grouping level of detail that is different from the dimension field
      var stackBy = NONPOSITION_CHANNELS.reduce(function (sc, channel) {
          if (channelHasField(encoding, channel)) {
              var channelDef = encoding[channel];
              (isArray(channelDef) ? channelDef : [channelDef]).forEach(function (cDef) {
                  var fieldDef = getFieldDef(cDef);
                  if (fieldDef.aggregate) {
                      return;
                  }
                  // Check whether the channel's field is identical to x/y's field or if the channel is a repeat
                  var f = isStringFieldDef(fieldDef) ? vgField(fieldDef, {}) : undefined;
                  if (
                  // if fielddef is a repeat, just include it in the stack by
                  !f ||
                      // otherwise, the field must be different from x and y fields.
                      (f !== dimensionField && f !== stackedField)) {
                      sc.push({ channel: channel, fieldDef: fieldDef });
                  }
              });
          }
          return sc;
      }, []);
      if (stackBy.length === 0) {
          return null;
      }
      // Automatically determine offset
      var offset = undefined;
      if (stackedFieldDef.stack !== undefined) {
          offset = stackedFieldDef.stack;
      }
      else if (contains(STACK_BY_DEFAULT_MARKS, mark)) {
          // Bar and Area with sum ops are automatically stacked by default
          offset = stackConfig === undefined ? 'zero' : stackConfig;
      }
      else {
          offset = stackConfig;
      }
      if (!offset || !isStackOffset(offset)) {
          return null;
      }
      // warn when stacking non-linear
      if (stackedFieldDef.scale && stackedFieldDef.scale.type && stackedFieldDef.scale.type !== ScaleType.LINEAR) {
          warn(message.cannotStackNonLinearScale(stackedFieldDef.scale.type));
      }
      // Check if it is a ranged mark
      if (channelHasField(encoding, fieldChannel === X ? X2 : Y2)) {
          warn(message.cannotStackRangedMark(fieldChannel));
          return null;
      }
      // Warn if stacking summative aggregate
      if (stackedFieldDef.aggregate && !contains(SUM_OPS, stackedFieldDef.aggregate)) {
          warn(message.stackNonSummativeAggregate(stackedFieldDef.aggregate));
      }
      return {
          groupbyChannel: dimensionDef ? dimensionChannel : undefined,
          fieldChannel: fieldChannel,
          impute: isPathMark(mark),
          stackBy: stackBy,
          offset: offset
      };
  }

  var stack$1 = /*#__PURE__*/Object.freeze({
    isStackOffset: isStackOffset,
    STACKABLE_MARKS: STACKABLE_MARKS,
    STACK_BY_DEFAULT_MARKS: STACK_BY_DEFAULT_MARKS,
    stack: stack
  });

  /* Custom type guards */
  function isFacetSpec(spec) {
      return spec['facet'] !== undefined;
  }
  function isUnitSpec(spec) {
      return !!spec['mark'];
  }
  function isLayerSpec(spec) {
      return spec['layer'] !== undefined;
  }
  function isRepeatSpec(spec) {
      return spec['repeat'] !== undefined;
  }
  function isConcatSpec(spec) {
      return isVConcatSpec(spec) || isHConcatSpec(spec);
  }
  function isVConcatSpec(spec) {
      return spec['vconcat'] !== undefined;
  }
  function isHConcatSpec(spec) {
      return spec['hconcat'] !== undefined;
  }
  /**
   * Decompose extended unit specs into composition of pure unit specs.
   */
  // TODO: consider moving this to another file.  Maybe vl.spec.normalize or vl.normalize
  function normalize$2(spec, config) {
      if (isFacetSpec(spec)) {
          return normalizeFacet(spec, config);
      }
      if (isLayerSpec(spec)) {
          return normalizeLayer(spec, config);
      }
      if (isRepeatSpec(spec)) {
          return normalizeRepeat(spec, config);
      }
      if (isVConcatSpec(spec)) {
          return normalizeVConcat(spec, config);
      }
      if (isHConcatSpec(spec)) {
          return normalizeHConcat(spec, config);
      }
      if (isUnitSpec(spec)) {
          var hasRow = channelHasField(spec.encoding, ROW);
          var hasColumn = channelHasField(spec.encoding, COLUMN);
          if (hasRow || hasColumn) {
              return normalizeFacetedUnit(spec, config);
          }
          return normalizeNonFacetUnit(spec, config);
      }
      throw new Error(message.INVALID_SPEC);
  }
  function normalizeFacet(spec, config) {
      var subspec = spec.spec, rest = __rest(spec, ["spec"]);
      return __assign({}, rest, { 
          // TODO: remove "any" once we support all facet listed in https://github.com/vega/vega-lite/issues/2760
          spec: normalize$2(subspec, config) });
  }
  function mergeEncoding(opt) {
      var parentEncoding = opt.parentEncoding, encoding = opt.encoding;
      if (parentEncoding && encoding) {
          var overriden = keys(parentEncoding).reduce(function (o, key$$1) {
              if (encoding[key$$1]) {
                  o.push(key$$1);
              }
              return o;
          }, []);
          if (overriden.length > 0) {
              warn(message.encodingOverridden(overriden));
          }
      }
      var merged = __assign({}, (parentEncoding || {}), (encoding || {}));
      return keys(merged).length > 0 ? merged : undefined;
  }
  function mergeProjection(opt) {
      var parentProjection = opt.parentProjection, projection = opt.projection;
      if (parentProjection && projection) {
          warn(message.projectionOverridden({ parentProjection: parentProjection, projection: projection }));
      }
      return projection || parentProjection;
  }
  function normalizeLayer(spec, config, parentEncoding, parentProjection) {
      var layer = spec.layer, encoding = spec.encoding, projection = spec.projection, rest = __rest(spec, ["layer", "encoding", "projection"]);
      var mergedEncoding = mergeEncoding({ parentEncoding: parentEncoding, encoding: encoding });
      var mergedProjection = mergeProjection({ parentProjection: parentProjection, projection: projection });
      return __assign({}, rest, { layer: layer.map(function (subspec) {
              if (isLayerSpec(subspec)) {
                  return normalizeLayer(subspec, config, mergedEncoding, mergedProjection);
              }
              return normalizeNonFacetUnit(subspec, config, mergedEncoding, mergedProjection);
          }) });
  }
  function normalizeRepeat(spec, config) {
      var subspec = spec.spec, rest = __rest(spec, ["spec"]);
      return __assign({}, rest, { spec: normalize$2(subspec, config) });
  }
  function normalizeVConcat(spec, config) {
      var vconcat = spec.vconcat, rest = __rest(spec, ["vconcat"]);
      return __assign({}, rest, { vconcat: vconcat.map(function (subspec) { return normalize$2(subspec, config); }) });
  }
  function normalizeHConcat(spec, config) {
      var hconcat = spec.hconcat, rest = __rest(spec, ["hconcat"]);
      return __assign({}, rest, { hconcat: hconcat.map(function (subspec) { return normalize$2(subspec, config); }) });
  }
  function normalizeFacetedUnit(spec, config) {
      // New encoding in the inside spec should not contain row / column
      // as row/column should be moved to facet
      var _a = spec.encoding, row = _a.row, column = _a.column, encoding = __rest(_a, ["row", "column"]);
      // Mark and encoding should be moved into the inner spec
      var mark = spec.mark, width = spec.width, projection = spec.projection, height = spec.height, selection = spec.selection, _ = spec.encoding, outerSpec = __rest(spec, ["mark", "width", "projection", "height", "selection", "encoding"]);
      return __assign({}, outerSpec, { facet: __assign({}, (row ? { row: row } : {}), (column ? { column: column } : {})), spec: normalizeNonFacetUnit(__assign({}, (projection ? { projection: projection } : {}), { mark: mark }, (width ? { width: width } : {}), (height ? { height: height } : {}), { encoding: encoding }, (selection ? { selection: selection } : {})), config) });
  }
  function isNonFacetUnitSpecWithPrimitiveMark(spec) {
      return isPrimitiveMark(spec.mark);
  }
  function getPointOverlay(markDef, markConfig, encoding) {
      if (markDef.point === 'transparent') {
          return { opacity: 0 };
      }
      else if (markDef.point) { // truthy : true or object
          return isObject(markDef.point) ? markDef.point : {};
      }
      else if (markDef.point !== undefined) { // false or null
          return null;
      }
      else { // undefined (not disabled)
          if (markConfig.point || encoding.shape) {
              // enable point overlay if config[mark].point is truthy or if encoding.shape is provided
              return isObject(markConfig.point) ? markConfig.point : {};
          }
          // markDef.point is defined as falsy
          return null;
      }
  }
  function getLineOverlay(markDef, markConfig) {
      if (markDef.line) { // true or object
          return markDef.line === true ? {} : markDef.line;
      }
      else if (markDef.line !== undefined) { // false or null
          return null;
      }
      else { // undefined (not disabled)
          if (markConfig.line) {
              // enable line overlay if config[mark].line is truthy
              return markConfig.line === true ? {} : markConfig.line;
          }
          // markDef.point is defined as falsy
          return null;
      }
  }
  function normalizeNonFacetUnit(spec, config, parentEncoding, parentProjection) {
      var encoding = spec.encoding, projection = spec.projection;
      var mark = isMarkDef(spec.mark) ? spec.mark.type : spec.mark;
      // merge parent encoding / projection first
      if (parentEncoding || parentProjection) {
          var mergedProjection = mergeProjection({ parentProjection: parentProjection, projection: projection });
          var mergedEncoding = mergeEncoding({ parentEncoding: parentEncoding, encoding: encoding });
          return normalizeNonFacetUnit(__assign({}, spec, (mergedProjection ? { projection: mergedProjection } : {}), (mergedEncoding ? { encoding: mergedEncoding } : {})), config);
      }
      if (isNonFacetUnitSpecWithPrimitiveMark(spec)) {
          // TODO: thoroughly test
          if (isRanged(encoding)) {
              return normalizeRangedUnit(spec);
          }
          if (mark === 'line' && (encoding.x2 || encoding.y2)) {
              warn(message.lineWithRange(!!encoding.x2, !!encoding.y2));
              return normalizeNonFacetUnit(__assign({ mark: 'rule' }, spec), config, parentEncoding, parentProjection);
          }
          if (isPathMark(mark)) {
              return normalizePathOverlay(spec, config);
          }
          return spec; // Nothing to normalize
      }
      else {
          return normalize$1(spec, config);
      }
  }
  function normalizeRangedUnit(spec) {
      var hasX = channelHasField(spec.encoding, X);
      var hasY = channelHasField(spec.encoding, Y);
      var hasX2 = channelHasField(spec.encoding, X2);
      var hasY2 = channelHasField(spec.encoding, Y2);
      if ((hasX2 && !hasX) || (hasY2 && !hasY)) {
          var normalizedSpec = duplicate(spec);
          if (hasX2 && !hasX) {
              normalizedSpec.encoding.x = normalizedSpec.encoding.x2;
              delete normalizedSpec.encoding.x2;
          }
          if (hasY2 && !hasY) {
              normalizedSpec.encoding.y = normalizedSpec.encoding.y2;
              delete normalizedSpec.encoding.y2;
          }
          return normalizedSpec;
      }
      return spec;
  }
  function dropLineAndPoint(markDef) {
      var _point = markDef.point, _line = markDef.line, mark = __rest(markDef, ["point", "line"]);
      return keys(mark).length > 1 ? mark : mark.type;
  }
  function normalizePathOverlay(spec, config) {
      if (config === void 0) { config = {}; }
      // _ is used to denote a dropped property of the unit spec
      // which should not be carried over to the layer spec
      var selection = spec.selection, projection = spec.projection, encoding = spec.encoding, mark = spec.mark, outerSpec = __rest(spec, ["selection", "projection", "encoding", "mark"]);
      var markDef = isMarkDef(mark) ? mark : { type: mark };
      var pointOverlay = getPointOverlay(markDef, config[markDef.type], encoding);
      var lineOverlay = markDef.type === 'area' && getLineOverlay(markDef, config[markDef.type]);
      if (!pointOverlay && !lineOverlay) {
          return __assign({}, spec, { 
              // Do not include point / line overlay in the normalize spec
              mark: dropLineAndPoint(markDef) });
      }
      var layer = [__assign({}, (selection ? { selection: selection } : {}), { 
              // Do not include point / line overlay in the normalize spec
              mark: dropLineAndPoint(__assign({}, markDef, (markDef.type === 'area' ? { opacity: 0.7 } : {}))), 
              // drop shape from encoding as this might be used to trigger point overlay
              encoding: omit(encoding, ['shape']) })];
      // FIXME: disable tooltip for the line layer if tooltip is not group-by field.
      // FIXME: determine rules for applying selections.
      // Need to copy stack config to overlayed layer
      var stackProps = stack(markDef, encoding, config ? config.stack : undefined);
      var overlayEncoding = encoding;
      if (stackProps) {
          var stackFieldChannel = stackProps.fieldChannel, offset = stackProps.offset;
          overlayEncoding = __assign({}, encoding, (_a = {}, _a[stackFieldChannel] = __assign({}, encoding[stackFieldChannel], (offset ? { stack: offset } : {})), _a));
      }
      if (lineOverlay) {
          layer.push(__assign({}, (projection ? { projection: projection } : {}), { mark: __assign({ type: 'line' }, lineOverlay), encoding: overlayEncoding }));
      }
      if (pointOverlay) {
          layer.push(__assign({}, (projection ? { projection: projection } : {}), { mark: __assign({ type: 'point', opacity: 1, filled: true }, pointOverlay), encoding: overlayEncoding }));
      }
      return __assign({}, outerSpec, { layer: layer });
      var _a;
  }
  // TODO: add vl.spec.validate & move stuff from vl.validate to here
  /* Accumulate non-duplicate fieldDefs in a dictionary */
  function accumulate(dict, defs) {
      defs.forEach(function (fieldDef) {
          // Consider only pure fieldDef properties (ignoring scale, axis, legend)
          var pureFieldDef = ['field', 'type', 'value', 'timeUnit', 'bin', 'aggregate'].reduce(function (f, key$$1) {
              if (fieldDef[key$$1] !== undefined) {
                  f[key$$1] = fieldDef[key$$1];
              }
              return f;
          }, {});
          var key$$1 = hash(pureFieldDef);
          dict[key$$1] = dict[key$$1] || fieldDef;
      });
      return dict;
  }
  /* Recursively get fieldDefs from a spec, returns a dictionary of fieldDefs */
  function fieldDefIndex(spec, dict) {
      if (dict === void 0) { dict = {}; }
      // FIXME(https://github.com/vega/vega-lite/issues/2207): Support fieldDefIndex for repeat
      if (isLayerSpec(spec)) {
          spec.layer.forEach(function (layer) {
              if (isUnitSpec(layer)) {
                  accumulate(dict, fieldDefs(layer.encoding));
              }
              else {
                  fieldDefIndex(layer, dict);
              }
          });
      }
      else if (isFacetSpec(spec)) {
          accumulate(dict, fieldDefs(spec.facet));
          fieldDefIndex(spec.spec, dict);
      }
      else if (isRepeatSpec(spec)) {
          fieldDefIndex(spec.spec, dict);
      }
      else if (isConcatSpec(spec)) {
          var childSpec = isVConcatSpec(spec) ? spec.vconcat : spec.hconcat;
          childSpec.forEach(function (child) { return fieldDefIndex(child, dict); });
      }
      else { // Unit Spec
          accumulate(dict, fieldDefs(spec.encoding));
      }
      return dict;
  }
  /* Returns all non-duplicate fieldDefs in a spec in a flat array */
  function fieldDefs$1(spec) {
      return vals(fieldDefIndex(spec));
  }
  function isStacked(spec, config) {
      config = config || spec.config;
      if (isPrimitiveMark(spec.mark)) {
          return stack(spec.mark, spec.encoding, config ? config.stack : undefined) !== null;
      }
      return false;
  }

  var spec = /*#__PURE__*/Object.freeze({
    isFacetSpec: isFacetSpec,
    isUnitSpec: isUnitSpec,
    isLayerSpec: isLayerSpec,
    isRepeatSpec: isRepeatSpec,
    isConcatSpec: isConcatSpec,
    isVConcatSpec: isVConcatSpec,
    isHConcatSpec: isHConcatSpec,
    normalize: normalize$2,
    fieldDefs: fieldDefs$1,
    isStacked: isStacked
  });

  function _normalizeAutoSize(autosize) {
      return isString(autosize) ? { type: autosize } : autosize || {};
  }
  function normalizeAutoSize(topLevelAutosize, configAutosize, isUnitOrLayer) {
      if (isUnitOrLayer === void 0) { isUnitOrLayer = true; }
      var autosize = __assign({ type: 'pad' }, _normalizeAutoSize(configAutosize), _normalizeAutoSize(topLevelAutosize));
      if (autosize.type === 'fit') {
          if (!isUnitOrLayer) {
              warn(message.FIT_NON_SINGLE);
              autosize.type = 'pad';
          }
      }
      return autosize;
  }
  var TOP_LEVEL_PROPERTIES = [
      'background', 'padding', 'datasets'
      // We do not include "autosize" here as it is supported by only unit and layer specs and thus need to be normalized
  ];
  function extractTopLevelProperties(t) {
      return TOP_LEVEL_PROPERTIES.reduce(function (o, p) {
          if (t && t[p] !== undefined) {
              o[p] = t[p];
          }
          return o;
      }, {});
  }

  function isUrlData(data) {
      return !!data['url'];
  }
  function isInlineData(data) {
      return !!data['values'];
  }
  function isNamedData(data) {
      return !!data['name'] && !isUrlData(data) && !isInlineData(data);
  }
  var MAIN = 'main';
  var RAW = 'raw';

  var data = /*#__PURE__*/Object.freeze({
    isUrlData: isUrlData,
    isInlineData: isInlineData,
    isNamedData: isNamedData,
    MAIN: MAIN,
    RAW: RAW
  });

  /**
   * Parse an event selector string.
   * Returns an array of event stream definitions.
   */
  function parseSelector(selector, source, marks) {
    DEFAULT_SOURCE = source || VIEW;
    MARKS = marks || DEFAULT_MARKS;
    return parseMerge(selector.trim()).map(parseSelector$1);
  }

  var VIEW    = 'view',
      LBRACK  = '[',
      RBRACK  = ']',
      LBRACE  = '{',
      RBRACE  = '}',
      COLON   = ':',
      COMMA   = ',',
      NAME    = '@',
      GT      = '>',
      ILLEGAL = /[[\]{}]/,
      DEFAULT_SOURCE,
      MARKS,
      DEFAULT_MARKS = {
        '*': 1,
        arc: 1,
        area: 1,
        group: 1,
        image: 1,
        line: 1,
        path: 1,
        rect: 1,
        rule: 1,
        shape: 1,
        symbol: 1,
        text: 1,
        trail: 1
      };

  function isMarkType(type) {
    return MARKS.hasOwnProperty(type);
  }

  function find(s, i, endChar, pushChar, popChar) {
    var count = 0,
        n = s.length,
        c;
    for (; i<n; ++i) {
      c = s[i];
      if (!count && c === endChar) return i;
      else if (popChar && popChar.indexOf(c) >= 0) --count;
      else if (pushChar && pushChar.indexOf(c) >= 0) ++count;
    }
    return i;
  }

  function parseMerge(s) {
    var output = [],
        start = 0,
        n = s.length,
        i = 0;

    while (i < n) {
      i = find(s, i, COMMA, LBRACK + LBRACE, RBRACK + RBRACE);
      output.push(s.substring(start, i).trim());
      start = ++i;
    }

    if (output.length === 0) {
      throw 'Empty event selector: ' + s;
    }
    return output;
  }

  function parseSelector$1(s) {
    return s[0] === '['
      ? parseBetween(s)
      : parseStream(s);
  }

  function parseBetween(s) {
    var n = s.length,
        i = 1,
        b, stream;

    i = find(s, i, RBRACK, LBRACK, RBRACK);
    if (i === n) {
      throw 'Empty between selector: ' + s;
    }

    b = parseMerge(s.substring(1, i));
    if (b.length !== 2) {
      throw 'Between selector must have two elements: ' + s;
    }

    s = s.slice(i + 1).trim();
    if (s[0] !== GT) {
      throw 'Expected \'>\' after between selector: ' + s;
    }

    b = b.map(parseSelector$1);

    stream = parseSelector$1(s.slice(1).trim());
    if (stream.between) {
      return {
        between: b,
        stream: stream
      };
    } else {
      stream.between = b;
    }

    return stream;
  }

  function parseStream(s) {
    var stream = {source: DEFAULT_SOURCE},
        source = [],
        throttle = [0, 0],
        markname = 0,
        start = 0,
        n = s.length,
        i = 0, j,
        filter;

    // extract throttle from end
    if (s[n-1] === RBRACE) {
      i = s.lastIndexOf(LBRACE);
      if (i >= 0) {
        try {
          throttle = parseThrottle(s.substring(i+1, n-1));
        } catch (e) {
          throw 'Invalid throttle specification: ' + s;
        }
        s = s.slice(0, i).trim();
        n = s.length;
      } else throw 'Unmatched right brace: ' + s;
      i = 0;
    }

    if (!n) throw s;

    // set name flag based on first char
    if (s[0] === NAME) markname = ++i;

    // extract first part of multi-part stream selector
    j = find(s, i, COLON);
    if (j < n) {
      source.push(s.substring(start, j).trim());
      start = i = ++j;
    }

    // extract remaining part of stream selector
    i = find(s, i, LBRACK);
    if (i === n) {
      source.push(s.substring(start, n).trim());
    } else {
      source.push(s.substring(start, i).trim());
      filter = [];
      start = ++i;
      if (start === n) throw 'Unmatched left bracket: ' + s;
    }

    // extract filters
    while (i < n) {
      i = find(s, i, RBRACK);
      if (i === n) throw 'Unmatched left bracket: ' + s;
      filter.push(s.substring(start, i).trim());
      if (i < n-1 && s[++i] !== LBRACK) throw 'Expected left bracket: ' + s;
      start = ++i;
    }

    // marshall event stream specification
    if (!(n = source.length) || ILLEGAL.test(source[n-1])) {
      throw 'Invalid event selector: ' + s;
    }

    if (n > 1) {
      stream.type = source[1];
      if (markname) {
        stream.markname = source[0].slice(1);
      } else if (isMarkType(source[0])) {
        stream.marktype = source[0];
      } else {
        stream.source = source[0];
      }
    } else {
      stream.type = source[0];
    }
    if (stream.type.slice(-1) === '!') {
      stream.consume = true;
      stream.type = stream.type.slice(0, -1);
    }
    if (filter != null) stream.filter = filter;
    if (throttle[0]) stream.throttle = throttle[0];
    if (throttle[1]) stream.debounce = throttle[1];

    return stream;
  }

  function parseThrottle(s) {
    var a = s.split(COMMA);
    if (!s.length || a.length > 2) throw s;
    return a.map(function(_) {
      var x = +_;
      if (x !== x) throw s;
      return x;
    });
  }

  function isVgSignalRef(o) {
      return !!o['signal'];
  }
  function isVgRangeStep(range) {
      return !!range['step'];
  }
  function isDataRefUnionedDomain(domain) {
      if (!isArray(domain)) {
          return 'fields' in domain && !('data' in domain);
      }
      return false;
  }
  function isFieldRefUnionDomain(domain) {
      if (!isArray(domain)) {
          return 'fields' in domain && 'data' in domain;
      }
      return false;
  }
  function isDataRefDomain(domain) {
      if (!isArray(domain)) {
          return 'field' in domain && 'data' in domain;
      }
      return false;
  }
  var VG_MARK_CONFIG_INDEX = {
      opacity: 1,
      fill: 1,
      fillOpacity: 1,
      stroke: 1,
      strokeCap: 1,
      strokeWidth: 1,
      strokeOpacity: 1,
      strokeDash: 1,
      strokeDashOffset: 1,
      size: 1,
      shape: 1,
      interpolate: 1,
      tension: 1,
      orient: 1,
      align: 1,
      baseline: 1,
      text: 1,
      limit: 1,
      dx: 1,
      dy: 1,
      radius: 1,
      theta: 1,
      angle: 1,
      font: 1,
      fontSize: 1,
      fontWeight: 1,
      fontStyle: 1,
      cursor: 1,
      href: 1,
  };
  var VG_MARK_CONFIGS = flagKeys(VG_MARK_CONFIG_INDEX);

  function assembleTitle(title$$1, config) {
      if (isArray(title$$1)) {
          return title$$1.map(function (fieldDef) { return title(fieldDef, config); }).join(', ');
      }
      return title$$1;
  }
  function assembleAxis(axisCmpt, kind, config, opt) {
      if (opt === void 0) { opt = { header: false }; }
      var _a = axisCmpt.combine(), orient = _a.orient, scale = _a.scale, title$$1 = _a.title, zindex = _a.zindex, axis = __rest(_a, ["orient", "scale", "title", "zindex"]);
      // Remove properties that are not valid for this kind of axis
      keys(axis).forEach(function (key$$1) {
          var propType = AXIS_PROPERTY_TYPE[key$$1];
          if (propType && propType !== kind && propType !== 'both') {
              delete axis[key$$1];
          }
      });
      if (kind === 'grid') {
          if (!axis.grid) {
              return undefined;
          }
          // Remove unnecessary encode block
          if (axis.encode) {
              // Only need to keep encode block for grid
              var grid = axis.encode.grid;
              axis.encode = __assign({}, (grid ? { grid: grid } : {}));
              if (keys(axis.encode).length === 0) {
                  delete axis.encode;
              }
          }
          return __assign({ scale: scale,
              orient: orient }, axis, { domain: false, labels: false, 
              // Always set min/maxExtent to 0 to ensure that `config.axis*.minExtent` and `config.axis*.maxExtent`
              // would not affect gridAxis
              maxExtent: 0, minExtent: 0, ticks: false, zindex: zindex !== undefined ? zindex : 0 // put grid behind marks by default
           });
      }
      else { // kind === 'main'
          if (!opt.header && axisCmpt.mainExtracted) {
              // if mainExtracted has been extracted to a separate facet
              return undefined;
          }
          // Remove unnecessary encode block
          if (axis.encode) {
              for (var _i = 0, AXIS_PARTS_1 = AXIS_PARTS; _i < AXIS_PARTS_1.length; _i++) {
                  var part = AXIS_PARTS_1[_i];
                  if (!axisCmpt.hasAxisPart(part)) {
                      delete axis.encode[part];
                  }
              }
              if (keys(axis.encode).length === 0) {
                  delete axis.encode;
              }
          }
          var titleString = assembleTitle(title$$1, config);
          return __assign({ scale: scale,
              orient: orient, grid: false }, (titleString ? { title: titleString } : {}), axis, { zindex: zindex !== undefined ? zindex : 1 // put axis line above marks by default
           });
      }
  }
  function assembleAxes(axisComponents, config) {
      var _a = axisComponents.x, x = _a === void 0 ? [] : _a, _b = axisComponents.y, y = _b === void 0 ? [] : _b;
      return x.map(function (a) { return assembleAxis(a, 'main', config); }).concat(x.map(function (a) { return assembleAxis(a, 'grid', config); }), y.map(function (a) { return assembleAxis(a, 'main', config); }), y.map(function (a) { return assembleAxis(a, 'grid', config); })).filter(function (a) { return a; }); // filter undefined
  }

  // TODO: we need to find a way to refactor these so that scaleName is a part of scale
  // but that's complicated.  For now, this is a huge step moving forward.
  /**
   * @return Vega ValueRef for stackable x or y
   */
  function stackable(channel, channelDef, scaleName, scale, stack, defaultRef) {
      if (isFieldDef(channelDef) && stack && channel === stack.fieldChannel) {
          // x or y use stack_end so that stacked line's point mark use stack_end too.
          return fieldRef(channelDef, scaleName, { suffix: 'end' });
      }
      return midPoint(channel, channelDef, scaleName, scale, stack, defaultRef);
  }
  /**
   * @return Vega ValueRef for stackable x2 or y2
   */
  function stackable2(channel, aFieldDef, a2fieldDef, scaleName, scale, stack, defaultRef) {
      if (isFieldDef(aFieldDef) && stack &&
          // If fieldChannel is X and channel is X2 (or Y and Y2)
          channel.charAt(0) === stack.fieldChannel.charAt(0)) {
          return fieldRef(aFieldDef, scaleName, { suffix: 'start' });
      }
      return midPoint(channel, a2fieldDef, scaleName, scale, stack, defaultRef);
  }
  function getOffset(channel, markDef) {
      var offsetChannel = channel + 'Offset';
      // TODO: in the future read from encoding channel too
      var markDefOffsetValue = markDef[offsetChannel];
      if (markDefOffsetValue) {
          return markDefOffsetValue;
      }
      return undefined;
  }
  /**
   * Value Ref for binned fields
   */
  function bin$1(fieldDef, scaleName, side, offset) {
      var binSuffix = side === 'start' ? undefined : 'end';
      return fieldRef(fieldDef, scaleName, { binSuffix: binSuffix }, offset ? { offset: offset } : {});
  }
  function fieldRef(fieldDef, scaleName, opt, mixins) {
      var ref = __assign({}, (scaleName ? { scale: scaleName } : {}), { field: vgField(fieldDef, opt) });
      if (mixins) {
          return __assign({}, ref, mixins);
      }
      return ref;
  }
  function bandRef(scaleName, band) {
      if (band === void 0) { band = true; }
      return {
          scale: scaleName,
          band: band
      };
  }
  /**
   * Signal that returns the middle of a bin. Should only be used with x and y.
   */
  function binMidSignal(fieldDef, scaleName) {
      return {
          signal: "(" +
              ("scale(\"" + scaleName + "\", " + vgField(fieldDef, { expr: 'datum' }) + ")") +
              " + " +
              ("scale(\"" + scaleName + "\", " + vgField(fieldDef, { binSuffix: 'end', expr: 'datum' }) + ")") +
              ")/2"
      };
  }
  /**
   * @returns {VgValueRef} Value Ref for xc / yc or mid point for other channels.
   */
  function midPoint(channel, channelDef, scaleName, scale, stack, defaultRef) {
      // TODO: datum support
      if (channelDef) {
          /* istanbul ignore else */
          if (isFieldDef(channelDef)) {
              if (channelDef.bin) {
                  // Use middle only for x an y to place marks in the center between start and end of the bin range.
                  // We do not use the mid point for other channels (e.g. size) so that properties of legends and marks match.
                  if (contains([X, Y], channel) && channelDef.type === QUANTITATIVE) {
                      if (stack && stack.impute) {
                          // For stack, we computed bin_mid so we can impute.
                          return fieldRef(channelDef, scaleName, { binSuffix: 'mid' });
                      }
                      // For non-stack, we can just calculate bin mid on the fly using signal.
                      return binMidSignal(channelDef, scaleName);
                  }
                  return fieldRef(channelDef, scaleName, binRequiresRange(channelDef, channel) ? { binSuffix: 'range' } : {});
              }
              if (scale) {
                  var scaleType = scale.get('type');
                  if (hasDiscreteDomain(scaleType)) {
                      if (scaleType === 'band') {
                          // For band, to get mid point, need to offset by half of the band
                          return fieldRef(channelDef, scaleName, { binSuffix: 'range' }, { band: 0.5 });
                      }
                      return fieldRef(channelDef, scaleName, { binSuffix: 'range' });
                  }
              }
              return fieldRef(channelDef, scaleName, {}); // no need for bin suffix
          }
          else if (isValueDef(channelDef)) {
              var value = channelDef.value;
              if (contains(['x', 'x2'], channel) && value === 'width') {
                  return { field: { group: 'width' } };
              }
              else if (contains(['y', 'y2'], channel) && value === 'height') {
                  return { field: { group: 'height' } };
              }
              return { value: value };
          }
          // If channelDef is neither field def or value def, it's a condition-only def.
          // In such case, we will use default ref.
      }
      return defaultRef;
  }
  function text$1(textDef, config) {
      // text
      if (textDef) {
          if (isFieldDef(textDef)) {
              return formatSignalRef(textDef, textDef.format, 'datum', config);
          }
          else if (isValueDef(textDef)) {
              return { value: textDef.value };
          }
      }
      return undefined;
  }
  function mid(sizeRef) {
      return __assign({}, sizeRef, { mult: 0.5 });
  }
  /**
   * Whether the scale definitely includes zero in the domain
   */
  function domainDefinitelyIncludeZero(scale) {
      if (scale.get('zero') !== false) {
          return true;
      }
      var domains = scale.domains;
      if (isArray(domains)) {
          return some(domains, function (d) { return isArray(d) && d.length === 2 && d[0] <= 0 && d[1] >= 0; });
      }
      return false;
  }
  function getDefaultRef(defaultRef, channel, scaleName, scale, mark) {
      if (isString(defaultRef)) {
          if (scaleName) {
              var scaleType = scale.get('type');
              if (contains([ScaleType.LOG, ScaleType.TIME, ScaleType.UTC], scaleType)) {
                  // Log scales cannot have zero.
                  // Zero in time scale is arbitrary, and does not affect ratio.
                  // (Time is an interval level of measurement, not ratio).
                  // See https://en.wikipedia.org/wiki/Level_of_measurement for more info.
                  if (mark === 'bar' || mark === 'area') {
                      warn(message.nonZeroScaleUsedWithLengthMark(mark, channel, { scaleType: scaleType }));
                  }
              }
              else {
                  if (domainDefinitelyIncludeZero(scale)) {
                      return {
                          scale: scaleName,
                          value: 0
                      };
                  }
                  if (mark === 'bar' || mark === 'area') {
                      warn(message.nonZeroScaleUsedWithLengthMark(mark, channel, { zeroFalse: scale.explicit.zero === false }));
                  }
              }
          }
          if (defaultRef === 'zeroOrMin') {
              return channel === 'x' ? { value: 0 } : { field: { group: 'height' } };
          }
          else { // zeroOrMax
              return channel === 'x' ? { field: { group: 'width' } } : { value: 0 };
          }
      }
      return defaultRef;
  }

  function color(model, opt) {
      if (opt === void 0) { opt = { valueOnly: false }; }
      var markDef = model.markDef, encoding = model.encoding, config = model.config;
      var filled = markDef.filled, markType = markDef.type;
      var configValue = {
          fill: getMarkConfig('fill', markDef, config),
          stroke: getMarkConfig('stroke', markDef, config),
          color: getMarkConfig('color', markDef, config)
      };
      var transparentIfNeeded = contains(['bar', 'point', 'circle', 'square', 'geoshape'], markType) ? 'transparent' : undefined;
      var defaultValue = {
          fill: markDef.fill || configValue.fill ||
              // If there is no fill, always fill symbols, bar, geoshape
              // with transparent fills https://github.com/vega/vega-lite/issues/1316
              transparentIfNeeded,
          stroke: markDef.stroke || configValue.stroke
      };
      var colorVgChannel = filled ? 'fill' : 'stroke';
      var fillStrokeMarkDefAndConfig = __assign({}, (defaultValue.fill ? {
          fill: { value: defaultValue.fill }
      } : {}), (defaultValue.stroke ? {
          stroke: { value: defaultValue.stroke }
      } : {}));
      if (encoding.fill || encoding.stroke) {
          // ignore encoding.color, markDef.color, config.color
          if (markDef.color) {
              // warn for markDef.color  (no need to warn encoding.color as it will be dropped in normalized already)
              warn(message.droppingColor('property', { fill: 'fill' in encoding, stroke: 'stroke' in encoding }));
          }
          return __assign({}, nonPosition('fill', model, { defaultValue: defaultValue.fill || transparentIfNeeded }), nonPosition('stroke', model, { defaultValue: defaultValue.stroke }));
      }
      else if (encoding.color) {
          return __assign({}, fillStrokeMarkDefAndConfig, nonPosition('color', model, {
              vgChannel: colorVgChannel,
              // apply default fill/stroke first, then color config, then transparent if needed.
              defaultValue: markDef[colorVgChannel] || markDef.color || configValue[colorVgChannel] || configValue.color || (filled ? transparentIfNeeded : undefined)
          }));
      }
      else if (markDef.fill || markDef.stroke) {
          // Ignore markDef.color, config.color
          if (markDef.color) {
              warn(message.droppingColor('property', { fill: 'fill' in markDef, stroke: 'stroke' in markDef }));
          }
          return fillStrokeMarkDefAndConfig;
      }
      else if (markDef.color) {
          return __assign({}, fillStrokeMarkDefAndConfig, (_a = {}, _a[colorVgChannel] = { value: markDef.color }, _a));
      }
      else if (configValue.fill || configValue.stroke) {
          // ignore config.color
          return fillStrokeMarkDefAndConfig;
      }
      else if (configValue.color) {
          return __assign({}, (transparentIfNeeded ? { fill: { value: 'transparent' } } : {}), (_b = {}, _b[colorVgChannel] = { value: configValue.color }, _b));
      }
      return {};
      var _a, _b;
  }
  function baseEncodeEntry(model, ignore) {
      return __assign({}, markDefProperties(model.markDef, ignore), color(model), nonPosition('opacity', model), tooltip(model), text$2(model, 'href'));
  }
  function markDefProperties(mark, ignore) {
      return VG_MARK_CONFIGS.reduce(function (m, prop) {
          if (mark[prop] !== undefined && ignore[prop] !== 'ignore') {
              m[prop] = { value: mark[prop] };
          }
          return m;
      }, {});
  }
  function valueIfDefined(prop, value) {
      if (value !== undefined) {
          return _a = {}, _a[prop] = { value: value }, _a;
      }
      return undefined;
      var _a;
  }
  function validPredicate(vgRef) {
      return vgRef + " !== null && !isNaN(" + vgRef + ")";
  }
  function defined(model) {
      if (model.config.invalidValues === 'filter') {
          var fields = ['x', 'y'].map(function (channel) {
              var scaleComponent = model.getScaleComponent(channel);
              if (scaleComponent) {
                  var scaleType = scaleComponent.get('type');
                  // Discrete domain scales can handle invalid values, but continuous scales can't.
                  if (hasContinuousDomain(scaleType)) {
                      return model.vgField(channel, { expr: 'datum' });
                  }
              }
              return undefined;
          })
              .filter(function (field$$1) { return !!field$$1; })
              .map(validPredicate);
          if (fields.length > 0) {
              return {
                  defined: { signal: fields.join(' && ') }
              };
          }
      }
      return {};
  }
  /**
   * Return mixins for non-positional channels with scales.  (Text doesn't have scale.)
   */
  function nonPosition(channel, model, opt) {
      if (opt === void 0) { opt = {}; }
      var defaultValue = opt.defaultValue, vgChannel = opt.vgChannel;
      var defaultRef = opt.defaultRef || (defaultValue !== undefined ? { value: defaultValue } : undefined);
      var channelDef = model.encoding[channel];
      return wrapCondition(model, channelDef, vgChannel || channel, function (cDef) {
          return midPoint(channel, cDef, model.scaleName(channel), model.getScaleComponent(channel), null, // No need to provide stack for non-position as it does not affect mid point
          defaultRef);
      });
  }
  /**
   * Return a mixin that include a Vega production rule for a Vega-Lite conditional channel definition.
   * or a simple mixin if channel def has no condition.
   */
  function wrapCondition(model, channelDef, vgChannel, refFn) {
      var condition = channelDef && channelDef.condition;
      var valueRef = refFn(channelDef);
      if (condition) {
          var conditions = isArray(condition) ? condition : [condition];
          var vgConditions = conditions.map(function (c) {
              var conditionValueRef = refFn(c);
              var test = isConditionalSelection(c) ? selectionPredicate(model, c.selection) : expression(model, c.test);
              return __assign({ test: test }, conditionValueRef);
          });
          return _a = {},
              _a[vgChannel] = vgConditions.concat((valueRef !== undefined ? [valueRef] : [])),
              _a;
      }
      else {
          return valueRef !== undefined ? (_b = {}, _b[vgChannel] = valueRef, _b) : {};
      }
      var _a, _b;
  }
  function tooltip(model) {
      var channel = 'tooltip';
      var channelDef = model.encoding[channel];
      if (isArray(channelDef)) {
          var keyValues = channelDef.map(function (fieldDef) {
              var key$$1 = fieldDef.title !== undefined ? fieldDef.title : vgField(fieldDef, { binSuffix: 'range' });
              var value = text$1(fieldDef, model.config).signal;
              return "\"" + key$$1 + "\": " + value;
          });
          return { tooltip: { signal: "{" + keyValues.join(', ') + "}" } };
      }
      else {
          // if not an array, behave just like text
          return textCommon(model, channel, channelDef);
      }
  }
  function text$2(model, channel) {
      if (channel === void 0) { channel = 'text'; }
      var channelDef = model.encoding[channel];
      return textCommon(model, channel, channelDef);
  }
  function textCommon(model, channel, channelDef) {
      return wrapCondition(model, channelDef, channel, function (cDef) { return text$1(cDef, model.config); });
  }
  function bandPosition(fieldDef, channel, model) {
      var scaleName = model.scaleName(channel);
      var sizeChannel = channel === 'x' ? 'width' : 'height';
      if (model.encoding.size || model.markDef.size !== undefined) {
          var orient = model.markDef.orient;
          if (orient) {
              var centeredBandPositionMixins = (_a = {},
                  // Use xc/yc and place the mark at the middle of the band
                  // This way we never have to deal with size's condition for x/y position.
                  _a[channel + 'c'] = fieldRef(fieldDef, scaleName, {}, { band: 0.5 }),
                  _a);
              if (getFieldDef(model.encoding.size)) {
                  return __assign({}, centeredBandPositionMixins, nonPosition('size', model, { vgChannel: sizeChannel }));
              }
              else if (isValueDef(model.encoding.size)) {
                  return __assign({}, centeredBandPositionMixins, nonPosition('size', model, { vgChannel: sizeChannel }));
              }
              else if (model.markDef.size !== undefined) {
                  return __assign({}, centeredBandPositionMixins, (_b = {}, _b[sizeChannel] = { value: model.markDef.size }, _b));
              }
          }
          else {
              warn(message.cannotApplySizeToNonOrientedMark(model.markDef.type));
          }
      }
      return _c = {},
          _c[channel] = fieldRef(fieldDef, scaleName, { binSuffix: 'range' }),
          _c[sizeChannel] = bandRef(scaleName),
          _c;
      var _a, _b, _c;
  }
  function centeredBandPosition(channel, model, defaultPosRef, defaultSizeRef) {
      var centerChannel = channel === 'x' ? 'xc' : 'yc';
      var sizeChannel = channel === 'x' ? 'width' : 'height';
      return __assign({}, pointPosition(channel, model, defaultPosRef, centerChannel), nonPosition('size', model, { defaultRef: defaultSizeRef, vgChannel: sizeChannel }));
  }
  function binnedPosition(fieldDef, channel, scaleName, spacing, reverse) {
      if (channel === 'x') {
          return {
              x2: bin$1(fieldDef, scaleName, 'start', reverse ? 0 : spacing),
              x: bin$1(fieldDef, scaleName, 'end', reverse ? spacing : 0)
          };
      }
      else {
          return {
              y2: bin$1(fieldDef, scaleName, 'start', reverse ? spacing : 0),
              y: bin$1(fieldDef, scaleName, 'end', reverse ? 0 : spacing)
          };
      }
  }
  /**
   * Return mixins for point (non-band) position channels.
   */
  function pointPosition(channel, model, defaultRef, vgChannel) {
      // TODO: refactor how refer to scale as discussed in https://github.com/vega/vega-lite/pull/1613
      var encoding = model.encoding, mark = model.mark, stack = model.stack;
      var channelDef = encoding[channel];
      var scaleName = model.scaleName(channel);
      var scale = model.getScaleComponent(channel);
      var offset = getOffset(channel, model.markDef);
      var valueRef = !channelDef && (encoding.latitude || encoding.longitude) ?
          // use geopoint output if there are lat/long and there is no point position overriding lat/long.
          { field: model.getName(channel) } : __assign({}, stackable(channel, encoding[channel], scaleName, scale, stack, getDefaultRef(defaultRef, channel, scaleName, scale, mark)), (offset ? { offset: offset } : {}));
      return _a = {},
          _a[vgChannel || channel] = valueRef,
          _a;
      var _a;
  }
  /**
   * Return mixins for x2, y2.
   * If channel is not specified, return one channel based on orientation.
   */
  function pointPosition2(model, defaultRef, channel) {
      var encoding = model.encoding, mark = model.mark, stack = model.stack;
      var baseChannel = channel === 'x2' ? 'x' : 'y';
      var channelDef = encoding[baseChannel];
      var scaleName = model.scaleName(baseChannel);
      var scale = model.getScaleComponent(baseChannel);
      var offset = getOffset(channel, model.markDef);
      var valueRef = !channelDef && (encoding.latitude || encoding.longitude) ?
          // use geopoint output if there are lat2/long2 and there is no point position2 overriding lat2/long2.
          { field: model.getName(channel) } : __assign({}, stackable2(channel, channelDef, encoding[channel], scaleName, scale, stack, getDefaultRef(defaultRef, baseChannel, scaleName, scale, mark)), (offset ? { offset: offset } : {}));
      return _a = {}, _a[channel] = valueRef, _a;
      var _a;
  }

  function applyMarkConfig(e, model, propsList) {
      for (var _i = 0, propsList_2 = propsList; _i < propsList_2.length; _i++) {
          var property = propsList_2[_i];
          var value = getMarkConfig(property, model.markDef, model.config);
          if (value !== undefined) {
              e[property] = { value: value };
          }
      }
      return e;
  }
  function getStyles(mark) {
      return [].concat(mark.type, mark.style || []);
  }
  /**
   * Return property value from style or mark specific config property if exists.
   * Otherwise, return general mark specific config.
   */
  function getMarkConfig(prop, mark, config) {
      // By default, read from mark config first!
      var value = config.mark[prop];
      // Then read mark specific config, which has higher precedence
      var markSpecificConfig = config[mark.type];
      if (markSpecificConfig[prop] !== undefined) {
          value = markSpecificConfig[prop];
      }
      // Then read style config, which has even higher precedence.
      var styles = getStyles(mark);
      for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
          var style = styles_1[_i];
          var styleConfig = config.style[style];
          // MarkConfig extends VgMarkConfig so a prop may not be a valid property for style
          // However here we also check if it is defined, so it is okay to cast here
          var p = prop;
          if (styleConfig && styleConfig[p] !== undefined) {
              value = styleConfig[p];
          }
      }
      return value;
  }
  function formatSignalRef(fieldDef, specifiedFormat, expr, config) {
      var format = numberFormat(fieldDef, specifiedFormat, config);
      if (fieldDef.bin) {
          var startField = vgField(fieldDef, { expr: expr });
          var endField = vgField(fieldDef, { expr: expr, binSuffix: 'end' });
          return {
              signal: binFormatExpression(startField, endField, format, config)
          };
      }
      else if (fieldDef.type === 'quantitative') {
          return {
              signal: "" + formatExpr(vgField(fieldDef, { expr: expr, binSuffix: 'range' }), format)
          };
      }
      else if (isTimeFieldDef(fieldDef)) {
          var isUTCScale = isScaleFieldDef(fieldDef) && fieldDef['scale'] && fieldDef['scale'].type === ScaleType.UTC;
          return {
              signal: timeFormatExpression(vgField(fieldDef, { expr: expr }), fieldDef.timeUnit, specifiedFormat, config.text.shortTimeLabels, config.timeFormat, isUTCScale, true)
          };
      }
      else {
          return {
              signal: "''+" + vgField(fieldDef, { expr: expr })
          };
      }
  }
  function getSpecifiedOrDefaultValue(specifiedValue, defaultValue) {
      if (specifiedValue !== undefined) {
          return specifiedValue;
      }
      return defaultValue;
  }
  /**
   * Returns number format for a fieldDef
   *
   * @param format explicitly specified format
   */
  function numberFormat(fieldDef, specifiedFormat, config) {
      if (fieldDef.type === QUANTITATIVE) {
          // add number format for quantitative type only
          // Specified format in axis/legend has higher precedence than fieldDef.format
          if (specifiedFormat) {
              return specifiedFormat;
          }
          // TODO: need to make this work correctly for numeric ordinal / nominal type
          return config.numberFormat;
      }
      return undefined;
  }
  function formatExpr(field$$1, format) {
      return "format(" + field$$1 + ", \"" + (format || '') + "\")";
  }
  function numberFormatExpr(field$$1, specifiedFormat, config) {
      return formatExpr(field$$1, specifiedFormat || config.numberFormat);
  }
  function binFormatExpression(startField, endField, format, config) {
      return startField + " === null || isNaN(" + startField + ") ? \"null\" : " + numberFormatExpr(startField, format, config) + " + \" - \" + " + numberFormatExpr(endField, format, config);
  }
  /**
   * Returns the time expression used for axis/legend labels or text mark for a temporal field
   */
  function timeFormatExpression(field$$1, timeUnit, format, shortTimeLabels, timeFormatConfig, isUTCScale, alwaysReturn) {
      if (alwaysReturn === void 0) { alwaysReturn = false; }
      if (!timeUnit || format) {
          // If there is not time unit, or if user explicitly specify format for axis/legend/text.
          format = format || timeFormatConfig; // only use config.timeFormat if there is no timeUnit.
          if (format || alwaysReturn) {
              return (isUTCScale ? 'utc' : 'time') + "Format(" + field$$1 + ", '" + format + "')";
          }
          else {
              return undefined;
          }
      }
      else {
          return formatExpression(timeUnit, field$$1, shortTimeLabels, isUTCScale);
      }
  }
  /**
   * Return Vega sort parameters (tuple of field and order).
   */
  function sortParams(orderDef, fieldRefOption) {
      return (isArray(orderDef) ? orderDef : [orderDef]).reduce(function (s, orderChannelDef) {
          s.field.push(vgField(orderChannelDef, fieldRefOption));
          s.order.push(orderChannelDef.sort || 'ascending');
          return s;
      }, { field: [], order: [] });
  }
  function mergeTitleFieldDefs(f1, f2) {
      var merged = f1.slice();
      f2.forEach(function (fdToMerge) {
          for (var _i = 0, merged_1 = merged; _i < merged_1.length; _i++) {
              var fieldDef1 = merged_1[_i];
              // If already exists, no need to append to merged array
              if (stringify$2(fieldDef1) === stringify$2(fdToMerge)) {
                  return;
              }
          }
          merged.push(fdToMerge);
      });
      return merged;
  }
  function mergeTitle(title1, title2) {
      return title1 === title2 ?
          title1 : // if title is the same just use one of them
          title1 + ', ' + title2; // join title with comma if different
  }
  function mergeTitleComponent(v1, v2) {
      if (isArray(v1.value) && isArray(v2.value)) {
          return {
              explicit: v1.explicit,
              value: mergeTitleFieldDefs(v1.value, v2.value)
          };
      }
      else if (!isArray(v1.value) && !isArray(v2.value)) {
          return {
              explicit: v1.explicit,
              value: mergeTitle(v1.value, v2.value)
          };
      }
      /* istanbul ignore next: Condition should not happen -- only for warning in development. */
      throw new Error('It should never reach here');
  }
  /**
   * Checks whether a fieldDef for a particular channel requires a computed bin range.
   */
  function binRequiresRange(fieldDef, channel) {
      if (!fieldDef.bin) {
          console.warn('Only use this method with binned field defs');
          return false;
      }
      // We need the range only when the user explicitly forces a binned field to be use discrete scale. In this case, bin range is used in axis and legend labels.
      // We could check whether the axis or legend exists (not disabled) but that seems overkill.
      return isScaleChannel(channel) && contains(['ordinal', 'nominal'], fieldDef.type);
  }
  function guideEncodeEntry(encoding, model) {
      return keys(encoding).reduce(function (encode, channel) {
          var valueDef = encoding[channel];
          return __assign({}, encode, wrapCondition(model, valueDef, channel, function (x) { return ({ value: x.value }); }));
      }, {});
  }

  var HEADER_CHANNELS = ['row', 'column'];
  var HEADER_TYPES = ['header', 'footer'];
  function getHeaderType(orient) {
      if (orient === 'top' || orient === 'left') {
          return 'header';
      }
      return 'footer';
  }
  function getTitleGroup(model, channel) {
      var title$$1 = model.component.layoutHeaders[channel].title;
      var textOrient = channel === 'row' ? 'vertical' : undefined;
      var update = __assign({ align: { value: 'center' }, text: { value: title$$1 } }, (textOrient === 'vertical' ? { angle: { value: 270 } } : {}));
      return {
          name: model.getName(channel + "_title"),
          role: channel + "-title",
          type: 'group',
          marks: [__assign({ type: 'text', role: channel + "-title-text", style: 'guide-title' }, (keys(update).length > 0 ? { encode: { update: update } } : {}))]
      };
  }
  function getHeaderGroups(model, channel) {
      var layoutHeader = model.component.layoutHeaders[channel];
      var groups = [];
      for (var _i = 0, HEADER_TYPES_1 = HEADER_TYPES; _i < HEADER_TYPES_1.length; _i++) {
          var headerType = HEADER_TYPES_1[_i];
          if (layoutHeader[headerType]) {
              for (var _a = 0, _b = layoutHeader[headerType]; _a < _b.length; _a++) {
                  var headerCmpt = _b[_a];
                  groups.push(getHeaderGroup(model, channel, headerType, layoutHeader, headerCmpt));
              }
          }
      }
      return groups;
  }
  // 0, (0,90), 90, (90, 180), 180, (180, 270), 270, (270, 0)
  function labelAlign(angle) {
      // to keep angle in [0, 360)
      angle = ((angle % 360) + 360) % 360;
      if ((angle + 90) % 180 === 0) { // for 90 and 270
          return {}; // default center
      }
      else if (angle < 90 || 270 < angle) {
          return { align: { value: 'right' } };
      }
      else if (135 <= angle && angle < 225) {
          return { align: { value: 'left' } };
      }
      return {};
  }
  function labelBaseline(angle) {
      // to keep angle in [0, 360)
      angle = ((angle % 360) + 360) % 360;
      if (45 <= angle && angle <= 135) {
          return { baseline: { value: 'top' } };
      }
      return {};
  }
  function getHeaderGroup(model, channel, headerType, layoutHeader, headerCmpt) {
      if (headerCmpt) {
          var title$$1 = null;
          var facetFieldDef = layoutHeader.facetFieldDef;
          if (facetFieldDef && headerCmpt.labels) {
              var _a = facetFieldDef.header, header = _a === void 0 ? {} : _a;
              var format = header.format, labelAngle = header.labelAngle;
              var update = __assign({}, (labelAngle !== undefined ? { angle: { value: labelAngle } } : {}), labelAlign(labelAngle), labelBaseline(labelAngle));
              title$$1 = __assign({ text: formatSignalRef(facetFieldDef, format, 'parent', model.config), offset: 10, orient: channel === 'row' ? 'left' : 'top', style: 'guide-label' }, (keys(update).length > 0 ? { encode: { update: update } } : {}));
          }
          var axes = headerCmpt.axes;
          var hasAxes = axes && axes.length > 0;
          if (title$$1 || hasAxes) {
              var sizeChannel = channel === 'row' ? 'height' : 'width';
              return __assign({ name: model.getName(channel + "_" + headerType), type: 'group', role: channel + "-" + headerType }, (layoutHeader.facetFieldDef ? {
                  from: { data: model.getName(channel + '_domain') },
                  sort: {
                      field: vgField(facetFieldDef, { expr: 'datum' }),
                      order: facetFieldDef.sort || 'ascending'
                  }
              } : {}), (title$$1 ? { title: title$$1 } : {}), (headerCmpt.sizeSignal ? {
                  encode: {
                      update: (_b = {},
                          _b[sizeChannel] = headerCmpt.sizeSignal,
                          _b)
                  }
              } : {}), (hasAxes ? { axes: axes } : {}));
          }
      }
      return null;
      var _b;
  }

  function assembleLayoutSignals(model) {
      return [].concat(sizeSignals(model, 'width'), sizeSignals(model, 'height'));
  }
  function sizeSignals(model, sizeType) {
      var channel = sizeType === 'width' ? 'x' : 'y';
      var size = model.component.layoutSize.get(sizeType);
      if (!size || size === 'merged') {
          return [];
      }
      // Read size signal name from name map, just in case it is the top-level size signal that got renamed.
      var name = model.getSizeSignalRef(sizeType).signal;
      if (size === 'range-step') {
          var scaleComponent = model.getScaleComponent(channel);
          if (scaleComponent) {
              var type = scaleComponent.get('type');
              var range = scaleComponent.get('range');
              if (hasDiscreteDomain(type) && isVgRangeStep(range)) {
                  var scaleName = model.scaleName(channel);
                  if (isFacetModel(model.parent)) {
                      // If parent is facet and this is an independent scale, return only signal signal
                      // as the width/height will be calculated using the cardinality from
                      // facet's aggregate rather than reading from scale domain
                      var parentResolve = model.parent.component.resolve;
                      if (parentResolve.scale[channel] === 'independent') {
                          return [stepSignal(scaleName, range)];
                      }
                  }
                  return [
                      stepSignal(scaleName, range),
                      {
                          name: name,
                          update: sizeExpr(scaleName, scaleComponent, "domain('" + scaleName + "').length")
                      }
                  ];
              }
          }
          /* istanbul ignore next: Condition should not happen -- only for warning in development. */
          throw new Error('layout size is range step although there is no rangeStep.');
      }
      else {
          return [{
                  name: name,
                  value: size
              }];
      }
  }
  function stepSignal(scaleName, range) {
      return {
          name: scaleName + '_step',
          value: range.step,
      };
  }
  function sizeExpr(scaleName, scaleComponent, cardinality) {
      var type = scaleComponent.get('type');
      var padding = scaleComponent.get('padding');
      var paddingOuter = scaleComponent.get('paddingOuter');
      paddingOuter = paddingOuter !== undefined ? paddingOuter : padding;
      var paddingInner = scaleComponent.get('paddingInner');
      paddingInner = type === 'band' ?
          // only band has real paddingInner
          (paddingInner !== undefined ? paddingInner : padding) :
          // For point, as calculated in https://github.com/vega/vega-scale/blob/master/src/band.js#L128,
          // it's equivalent to have paddingInner = 1 since there is only n-1 steps between n points.
          1;
      return "bandspace(" + cardinality + ", " + paddingInner + ", " + paddingOuter + ") * " + scaleName + "_step";
  }

  function defaultScaleResolve(channel, model) {
      if (isLayerModel(model) || isFacetModel(model)) {
          return 'shared';
      }
      else if (isConcatModel(model) || isRepeatModel(model)) {
          return contains(POSITION_SCALE_CHANNELS, channel) ? 'independent' : 'shared';
      }
      /* istanbul ignore next: should never reach here. */
      throw new Error('invalid model type for resolve');
  }
  function parseGuideResolve(resolve, channel) {
      var channelScaleResolve = resolve.scale[channel];
      var guide = contains(POSITION_SCALE_CHANNELS, channel) ? 'axis' : 'legend';
      if (channelScaleResolve === 'independent') {
          if (resolve[guide][channel] === 'shared') {
              warn(message.independentScaleMeansIndependentGuide(channel));
          }
          return 'independent';
      }
      return resolve[guide][channel] || 'shared';
  }

  /**
   * Generic class for storing properties that are explicitly specified
   * and implicitly determined by the compiler.
   * This is important for scale/axis/legend merging as
   * we want to prioritize properties that users explicitly specified.
   */
  var Split = /** @class */ (function () {
      function Split(explicit, implicit) {
          if (explicit === void 0) { explicit = {}; }
          if (implicit === void 0) { implicit = {}; }
          this.explicit = explicit;
          this.implicit = implicit;
      }
      Split.prototype.clone = function () {
          return new Split(duplicate(this.explicit), duplicate(this.implicit));
      };
      Split.prototype.combine = function () {
          // FIXME remove "as any".
          // Add "as any" to avoid an error "Spread types may only be created from object types".
          return __assign({}, this.explicit, this.implicit);
      };
      Split.prototype.get = function (key) {
          // Explicit has higher precedence
          return this.explicit[key] !== undefined ? this.explicit[key] : this.implicit[key];
      };
      Split.prototype.getWithExplicit = function (key) {
          // Explicit has higher precedence
          if (this.explicit[key] !== undefined) {
              return { explicit: true, value: this.explicit[key] };
          }
          else if (this.implicit[key] !== undefined) {
              return { explicit: false, value: this.implicit[key] };
          }
          return { explicit: false, value: undefined };
      };
      Split.prototype.setWithExplicit = function (key, value) {
          if (value.value !== undefined) {
              this.set(key, value.value, value.explicit);
          }
      };
      Split.prototype.set = function (key, value, explicit) {
          delete this[explicit ? 'implicit' : 'explicit'][key];
          this[explicit ? 'explicit' : 'implicit'][key] = value;
          return this;
      };
      Split.prototype.copyKeyFromSplit = function (key, s) {
          // Explicit has higher precedence
          if (s.explicit[key] !== undefined) {
              this.set(key, s.explicit[key], true);
          }
          else if (s.implicit[key] !== undefined) {
              this.set(key, s.implicit[key], false);
          }
      };
      Split.prototype.copyKeyFromObject = function (key, s) {
          // Explicit has higher precedence
          if (s[key] !== undefined) {
              this.set(key, s[key], true);
          }
      };
      /**
       * Merge split object into this split object. Properties from the other split
       * overwrite properties from this split.
       */
      Split.prototype.copyAll = function (other) {
          for (var _i = 0, _a = keys(other.combine()); _i < _a.length; _i++) {
              var key = _a[_i];
              var val = other.getWithExplicit(key);
              this.setWithExplicit(key, val);
          }
      };
      return Split;
  }());
  function makeExplicit(value) {
      return {
          explicit: true,
          value: value
      };
  }
  function makeImplicit(value) {
      return {
          explicit: false,
          value: value
      };
  }
  function tieBreakByComparing(compare) {
      return function (v1, v2, property, propertyOf) {
          var diff = compare(v1.value, v2.value);
          if (diff > 0) {
              return v1;
          }
          else if (diff < 0) {
              return v2;
          }
          return defaultTieBreaker(v1, v2, property, propertyOf);
      };
  }
  function defaultTieBreaker(v1, v2, property, propertyOf) {
      if (v1.explicit && v2.explicit) {
          warn(message.mergeConflictingProperty(property, propertyOf, v1.value, v2.value));
      }
      // If equal score, prefer v1.
      return v1;
  }
  function mergeValuesWithExplicit(v1, v2, property, propertyOf, tieBreaker) {
      if (tieBreaker === void 0) { tieBreaker = defaultTieBreaker; }
      if (v1 === undefined || v1.value === undefined) {
          // For first run
          return v2;
      }
      if (v1.explicit && !v2.explicit) {
          return v1;
      }
      else if (v2.explicit && !v1.explicit) {
          return v2;
      }
      else if (stringify$2(v1.value) === stringify$2(v2.value)) {
          return v1;
      }
      else {
          return tieBreaker(v1, v2, property, propertyOf);
      }
  }

  var LegendComponent = /** @class */ (function (_super) {
      __extends(LegendComponent, _super);
      function LegendComponent() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      return LegendComponent;
  }(Split));

  function symbols(fieldDef, symbolsSpec, model, channel, type) {
      if (type === 'gradient') {
          return undefined;
      }
      var out = __assign({}, applyMarkConfig({}, model, FILL_STROKE_CONFIG), color(model));
      switch (model.mark) {
          case BAR:
          case TICK:
          case TEXT$1:
              out.shape = { value: 'square' };
              break;
          case CIRCLE:
          case SQUARE:
              out.shape = { value: model.mark };
              break;
          case POINT:
          case LINE:
          case GEOSHAPE:
          case AREA:
              // use default circle
              break;
      }
      var markDef = model.markDef, encoding = model.encoding;
      var filled = markDef.filled;
      if (out.fill) {
          // for fill legend, we don't want any fill in symbol
          if (channel === 'fill' || (filled && channel === COLOR)) {
              delete out.fill;
          }
          else {
              if (out.fill['field']) {
                  // For others, remove fill field
                  delete out.fill;
              }
              else if (isArray(out.fill)) {
                  var fill = getFirstConditionValue(encoding.fill || encoding.color) || markDef.fill || (filled && markDef.color);
                  if (fill) {
                      out.fill = { value: fill };
                  }
              }
          }
      }
      if (out.stroke) {
          if (channel === 'stroke' || (!filled && channel === COLOR)) {
              delete out.stroke;
          }
          else {
              if (out.stroke['field']) {
                  // For others, remove stroke field
                  delete out.stroke;
              }
              else if (isArray(out.stroke)) {
                  var stroke = getFirstConditionValue(encoding.stroke || encoding.color) || markDef.stroke || (!filled && markDef.color);
                  if (stroke) {
                      out.stroke = { value: stroke };
                  }
              }
          }
      }
      if (out.fill && out.fill['value'] !== 'transparent' && !out.stroke) {
          // for non color channel's legend, we need to override symbol stroke config from Vega config
          out.stroke = { value: 'transparent' };
      }
      if (channel !== SHAPE) {
          var shape = getFirstConditionValue(encoding.shape) || markDef.shape;
          if (shape) {
              out.shape = { value: shape };
          }
      }
      if (channel !== OPACITY) {
          var opacity = getMaxValue(encoding.opacity) || markDef.opacity;
          if (opacity) { // only apply opacity if it is neither zero or undefined
              out.opacity = { value: opacity };
          }
      }
      out = __assign({}, out, symbolsSpec);
      return keys(out).length > 0 ? out : undefined;
  }
  function gradient(fieldDef, gradientSpec, model, channel, type) {
      var out = {};
      if (type === 'gradient') {
          var opacity = getMaxValue(model.encoding.opacity) || model.markDef.opacity;
          if (opacity) { // only apply opacity if it is neither zero or undefined
              out.opacity = { value: opacity };
          }
      }
      out = __assign({}, out, gradientSpec);
      return keys(out).length > 0 ? out : undefined;
  }
  function labels(fieldDef, labelsSpec, model, channel, type) {
      var legend = model.legend(channel);
      var config = model.config;
      var out = {};
      if (isTimeFieldDef(fieldDef)) {
          var isUTCScale = model.getScaleComponent(channel).get('type') === ScaleType.UTC;
          var expr = timeFormatExpression('datum.value', fieldDef.timeUnit, legend.format, config.legend.shortTimeLabels, config.timeFormat, isUTCScale);
          labelsSpec = __assign({}, (expr ? { text: { signal: expr } } : {}), labelsSpec);
      }
      out = __assign({}, out, labelsSpec);
      return keys(out).length > 0 ? out : undefined;
  }
  function getMaxValue(channelDef) {
      return getConditionValue(channelDef, function (v, conditionalDef) { return Math.max(v, conditionalDef.value); });
  }
  function getFirstConditionValue(channelDef) {
      return getConditionValue(channelDef, function (v, conditionalDef) { return v !== undefined ? v : conditionalDef.value; });
  }
  function getConditionValue(channelDef, reducer) {
      if (hasConditionalValueDef(channelDef)) {
          return (isArray(channelDef.condition) ? channelDef.condition : [channelDef.condition])
              .reduce(reducer, channelDef.value);
      }
      else if (isValueDef(channelDef)) {
          return channelDef.value;
      }
      return undefined;
  }

  var encode = /*#__PURE__*/Object.freeze({
    symbols: symbols,
    gradient: gradient,
    labels: labels
  });

  function values(legend) {
      var vals$$1 = legend.values;
      if (vals$$1 && isDateTime(vals$$1[0])) {
          return vals$$1.map(function (dt) {
              // normalize = true as end user won't put 0 = January
              return { signal: dateTimeExpr(dt, true) };
          });
      }
      return vals$$1;
  }
  function type$2(t, channel, scaleType) {
      if (isColorChannel(channel) && ((t === 'quantitative' && !isBinScale(scaleType)) ||
          (t === 'temporal' && contains(['time', 'utc'], scaleType)))) {
          return 'gradient';
      }
      return undefined;
  }

  function parseLegend(model) {
      if (isUnitModel(model)) {
          model.component.legends = parseUnitLegend(model);
      }
      else {
          model.component.legends = parseNonUnitLegend(model);
      }
  }
  function parseUnitLegend(model) {
      var encoding = model.encoding;
      return [COLOR, FILL, STROKE, SIZE, SHAPE, OPACITY].reduce(function (legendComponent, channel) {
          var def = encoding[channel];
          if (model.legend(channel) && model.getScaleComponent(channel) && !(isFieldDef(def) && (channel === SHAPE && def.type === GEOJSON))) {
              legendComponent[channel] = parseLegendForChannel(model, channel);
          }
          return legendComponent;
      }, {});
  }
  function getLegendDefWithScale(model, channel) {
      // For binned field with continuous scale, use a special scale so we can overrride the mark props and labels
      switch (channel) {
          case COLOR:
              var scale = model.scaleName(COLOR);
              return model.markDef.filled ? { fill: scale } : { stroke: scale };
          case FILL:
          case STROKE:
          case SIZE:
          case SHAPE:
          case OPACITY:
              return _a = {}, _a[channel] = model.scaleName(channel), _a;
      }
      var _a;
  }
  function parseLegendForChannel(model, channel) {
      var fieldDef = model.fieldDef(channel);
      var legend = model.legend(channel);
      var legendCmpt = new LegendComponent({}, getLegendDefWithScale(model, channel));
      LEGEND_PROPERTIES.forEach(function (property) {
          var value = getProperty(property, legend, channel, model);
          if (value !== undefined) {
              var explicit = 
              // specified legend.values is already respected, but may get transformed.
              property === 'values' ? !!legend.values :
                  // title can be explicit if fieldDef.title is set
                  property === 'title' && value === model.fieldDef(channel).title ? true :
                      // Otherwise, things are explicit if the returned value matches the specified property
                      value === legend[property];
              if (explicit || model.config.legend[property] === undefined) {
                  legendCmpt.set(property, value, explicit);
              }
          }
      });
      // 2) Add mark property definition groups
      var legendEncoding = legend.encoding || {};
      var legendEncode = ['labels', 'legend', 'title', 'symbols', 'gradient'].reduce(function (e, part) {
          var legendEncodingPart = guideEncodeEntry(legendEncoding[part] || {}, model);
          var value = encode[part] ?
              // TODO: replace legendCmpt with type is sufficient
              encode[part](fieldDef, legendEncodingPart, model, channel, legendCmpt.get('type')) : // apply rule
              legendEncodingPart; // no rule -- just default values
          if (value !== undefined && keys(value).length > 0) {
              e[part] = { update: value };
          }
          return e;
      }, {});
      if (keys(legendEncode).length > 0) {
          legendCmpt.set('encode', legendEncode, !!legend.encoding);
      }
      return legendCmpt;
  }
  function getProperty(property, specifiedLegend, channel, model) {
      var fieldDef = model.fieldDef(channel);
      switch (property) {
          case 'format':
              // We don't include temporal field here as we apply format in encode block
              return numberFormat(fieldDef, specifiedLegend.format, model.config);
          case 'title':
              // For falsy value, keep undefined so we use default,
              // but use null for '', null, and false to hide the title
              var specifiedTitle = fieldDef.title !== undefined ? fieldDef.title :
                  specifiedLegend.title || (specifiedLegend.title === undefined ? undefined : null);
              return getSpecifiedOrDefaultValue(specifiedTitle, title(fieldDef, model.config)) || undefined; // make falsy value undefined so output Vega spec is shorter
          case 'values':
              return values(specifiedLegend);
          case 'type':
              return getSpecifiedOrDefaultValue(specifiedLegend.type, type$2(fieldDef.type, channel, model.getScaleComponent(channel).get('type')));
      }
      // Otherwise, return specified property.
      return specifiedLegend[property];
  }
  function parseNonUnitLegend(model) {
      var _a = model.component, legends = _a.legends, resolve = _a.resolve;
      var _loop_1 = function (child) {
          parseLegend(child);
          keys(child.component.legends).forEach(function (channel) {
              resolve.legend[channel] = parseGuideResolve(model.component.resolve, channel);
              if (resolve.legend[channel] === 'shared') {
                  // If the resolve says shared (and has not been overridden)
                  // We will try to merge and see if there is a conflict
                  legends[channel] = mergeLegendComponent(legends[channel], child.component.legends[channel]);
                  if (!legends[channel]) {
                      // If merge returns nothing, there is a conflict so we cannot make the legend shared.
                      // Thus, mark legend as independent and remove the legend component.
                      resolve.legend[channel] = 'independent';
                      delete legends[channel];
                  }
              }
          });
      };
      for (var _i = 0, _b = model.children; _i < _b.length; _i++) {
          var child = _b[_i];
          _loop_1(child);
      }
      keys(legends).forEach(function (channel) {
          for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
              var child = _a[_i];
              if (!child.component.legends[channel]) {
                  // skip if the child does not have a particular legend
                  continue;
              }
              if (resolve.legend[channel] === 'shared') {
                  // After merging shared legend, make sure to remove legend from child
                  delete child.component.legends[channel];
              }
          }
      });
      return legends;
  }
  function mergeLegendComponent(mergedLegend, childLegend) {
      if (!mergedLegend) {
          return childLegend.clone();
      }
      var mergedOrient = mergedLegend.getWithExplicit('orient');
      var childOrient = childLegend.getWithExplicit('orient');
      if (mergedOrient.explicit && childOrient.explicit && mergedOrient.value !== childOrient.value) {
          // TODO: throw warning if resolve is explicit (We don't have info about explicit/implicit resolve yet.)
          // Cannot merge due to inconsistent orient
          return undefined;
      }
      var typeMerged = false;
      var _loop_2 = function (prop) {
          var mergedValueWithExplicit = mergeValuesWithExplicit(mergedLegend.getWithExplicit(prop), childLegend.getWithExplicit(prop), prop, 'legend', 
          // Tie breaker function
          function (v1, v2) {
              switch (prop) {
                  case 'title':
                      return mergeTitleComponent(v1, v2);
                  case 'type':
                      // There are only two types. If we have different types, then prefer symbol over gradient.
                      typeMerged = true;
                      return makeImplicit('symbol');
              }
              return defaultTieBreaker(v1, v2, prop, 'legend');
          });
          mergedLegend.setWithExplicit(prop, mergedValueWithExplicit);
      };
      // Otherwise, let's merge
      for (var _i = 0, VG_LEGEND_PROPERTIES_1 = VG_LEGEND_PROPERTIES; _i < VG_LEGEND_PROPERTIES_1.length; _i++) {
          var prop = VG_LEGEND_PROPERTIES_1[_i];
          _loop_2(prop);
      }
      if (typeMerged) {
          if (((mergedLegend.implicit || {}).encode || {}).gradient) {
              deleteNestedProperty(mergedLegend.implicit, ['encode', 'gradient']);
          }
          if (((mergedLegend.explicit || {}).encode || {}).gradient) {
              deleteNestedProperty(mergedLegend.explicit, ['encode', 'gradient']);
          }
      }
      return mergedLegend;
  }

  function assembleLegends(model) {
      var legendComponentIndex = model.component.legends;
      var legendByDomain = {};
      for (var _i = 0, _a = keys(legendComponentIndex); _i < _a.length; _i++) {
          var channel = _a[_i];
          var scaleComponent = model.getScaleComponent(channel);
          var domainHash = stringify$2(scaleComponent.domains);
          if (legendByDomain[domainHash]) {
              for (var _b = 0, _c = legendByDomain[domainHash]; _b < _c.length; _b++) {
                  var mergedLegendComponent = _c[_b];
                  var merged = mergeLegendComponent(mergedLegendComponent, legendComponentIndex[channel]);
                  if (!merged) {
                      // If cannot merge, need to add this legend separately
                      legendByDomain[domainHash].push(legendComponentIndex[channel]);
                  }
              }
          }
          else {
              legendByDomain[domainHash] = [legendComponentIndex[channel].clone()];
          }
      }
      return flatten(vals(legendByDomain)).map(function (legendCmpt) { return legendCmpt.combine(); });
  }

  function assembleProjections(model) {
      if (isLayerModel(model) || isConcatModel(model) || isRepeatModel(model)) {
          return assembleProjectionsForModelAndChildren(model);
      }
      else {
          return assembleProjectionForModel(model);
      }
  }
  function assembleProjectionsForModelAndChildren(model) {
      return model.children.reduce(function (projections, child) {
          return projections.concat(child.assembleProjections());
      }, assembleProjectionForModel(model));
  }
  function assembleProjectionForModel(model) {
      var component = model.component.projection;
      if (!component || component.merged) {
          return [];
      }
      var projection = component.combine();
      var name = projection.name, rest = __rest(projection, ["name"]); // we need to extract name so that it is always present in the output and pass TS type validation
      var size = {
          signal: "[" + component.size.map(function (ref) { return ref.signal; }).join(', ') + "]"
      };
      var fit = component.data.reduce(function (sources, data) {
          var source = isVgSignalRef(data) ? data.signal : "data('" + model.lookupDataSource(data) + "')";
          if (!contains(sources, source)) {
              // build a unique list of sources
              sources.push(source);
          }
          return sources;
      }, []);
      if (fit.length <= 0) {
          throw new Error("Projection's fit didn't find any data sources");
      }
      return [__assign({ name: name,
              size: size, fit: {
                  signal: fit.length > 1 ? "[" + fit.join(', ') + "]" : fit[0]
              } }, rest)];
  }

  var PROJECTION_PROPERTIES = [
      'type',
      'clipAngle',
      'clipExtent',
      'center',
      'rotate',
      'precision',
      'coefficient',
      'distance',
      'fraction',
      'lobes',
      'parallel',
      'radius',
      'ratio',
      'spacing',
      'tilt'
  ];

  var ProjectionComponent = /** @class */ (function (_super) {
      __extends(ProjectionComponent, _super);
      function ProjectionComponent(name, specifiedProjection, size, data) {
          var _this = _super.call(this, __assign({}, specifiedProjection), // all explicit properties of projection
          { name: name } // name as initial implicit property
          ) || this;
          _this.specifiedProjection = specifiedProjection;
          _this.size = size;
          _this.data = data;
          _this.merged = false;
          return _this;
      }
      return ProjectionComponent;
  }(Split));

  function parseProjection(model) {
      if (isUnitModel(model)) {
          model.component.projection = parseUnitProjection(model);
      }
      else {
          // because parse happens from leaves up (unit specs before layer spec),
          // we can be sure that the above if statement has already occurred
          // and therefore we have access to child.component.projection
          // for each of model's children
          model.component.projection = parseNonUnitProjections(model);
      }
  }
  function parseUnitProjection(model) {
      var specifiedProjection = model.specifiedProjection, config = model.config, hasProjection = model.hasProjection;
      if (hasProjection) {
          var data_1 = [];
          [[LONGITUDE, LATITUDE], [LONGITUDE2, LATITUDE2]].forEach(function (posssiblePair) {
              if (model.channelHasField(posssiblePair[0]) || model.channelHasField(posssiblePair[1])) {
                  data_1.push({
                      signal: model.getName("geojson_" + data_1.length)
                  });
              }
          });
          if (model.channelHasField(SHAPE) && model.fieldDef(SHAPE).type === GEOJSON) {
              data_1.push({
                  signal: model.getName("geojson_" + data_1.length)
              });
          }
          if (data_1.length === 0) {
              // main source is geojson, so we can just use that
              data_1.push(model.requestDataName(MAIN));
          }
          return new ProjectionComponent(model.projectionName(true), __assign({}, (config.projection || {}), (specifiedProjection || {})), [model.getSizeSignalRef('width'), model.getSizeSignalRef('height')], data_1);
      }
      return undefined;
  }
  function mergeIfNoConflict(first, second) {
      var allPropertiesShared = every(PROJECTION_PROPERTIES, function (prop) {
          // neither has the poperty
          if (!first.explicit.hasOwnProperty(prop) &&
              !second.explicit.hasOwnProperty(prop)) {
              return true;
          }
          // both have property and an equal value for property
          if (first.explicit.hasOwnProperty(prop) &&
              second.explicit.hasOwnProperty(prop) &&
              // some properties might be signals or objects and require hashing for comparison
              stringify$2(first.get(prop)) === stringify$2(second.get(prop))) {
              return true;
          }
          return false;
      });
      var size = stringify$2(first.size) === stringify$2(second.size);
      if (size) {
          if (allPropertiesShared) {
              return first;
          }
          else if (stringify$2(first.explicit) === stringify$2({})) {
              return second;
          }
          else if (stringify$2(second.explicit) === stringify$2({})) {
              return first;
          }
      }
      // if all properties don't match, let each unit spec have its own projection
      return null;
  }
  function parseNonUnitProjections(model) {
      if (model.children.length === 0) {
          return undefined;
      }
      var nonUnitProjection;
      var mergable = every(model.children, function (child) {
          parseProjection(child);
          var projection = child.component.projection;
          if (!projection) {
              // child layer does not use a projection
              return true;
          }
          else if (!nonUnitProjection) {
              // cached 'projection' is null, cache this one
              nonUnitProjection = projection;
              return true;
          }
          else {
              var merge = mergeIfNoConflict(nonUnitProjection, projection);
              if (merge) {
                  nonUnitProjection = merge;
              }
              return !!merge;
          }
      });
      // it cached one and all other children share the same projection,
      if (nonUnitProjection && mergable) {
          // so we can elevate it to the layer level
          var name_1 = model.projectionName(true);
          var modelProjection_1 = new ProjectionComponent(name_1, nonUnitProjection.specifiedProjection, nonUnitProjection.size, duplicate(nonUnitProjection.data));
          // rename and assign all others as merged
          model.children.forEach(function (child) {
              if (child.component.projection) {
                  modelProjection_1.data = modelProjection_1.data.concat(child.component.projection.data);
                  child.renameProjection(child.component.projection.get('name'), name_1);
                  child.component.projection.merged = true;
              }
          });
          return modelProjection_1;
      }
      return undefined;
  }

  function isSortField(sort) {
      return !!sort && (sort['op'] === 'count' || !!sort['field']) && !!sort['op'];
  }
  function isSortArray(sort) {
      return !!sort && isArray(sort) && sort.every(function (s) { return isString(s); });
  }

  var sort = /*#__PURE__*/Object.freeze({
    isSortField: isSortField,
    isSortArray: isSortArray
  });

  /**
   * A node in the dataflow tree.
   */
  var DataFlowNode = /** @class */ (function () {
      function DataFlowNode(parent, debugName) {
          this.debugName = debugName;
          this._children = [];
          this._parent = null;
          if (parent) {
              this.parent = parent;
          }
      }
      /**
       * Clone this node with a deep copy but don't clone links to children or parents.
       */
      DataFlowNode.prototype.clone = function () {
          throw new Error('Cannot clone node');
      };
      /**
       * Set of fields that are being created by this node.
       */
      DataFlowNode.prototype.producedFields = function () {
          return {};
      };
      DataFlowNode.prototype.dependentFields = function () {
          return {};
      };
      Object.defineProperty(DataFlowNode.prototype, "parent", {
          get: function () {
              return this._parent;
          },
          /**
           * Set the parent of the node and also add this not to the parent's children.
           */
          set: function (parent) {
              this._parent = parent;
              parent.addChild(this);
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(DataFlowNode.prototype, "children", {
          get: function () {
              return this._children;
          },
          enumerable: true,
          configurable: true
      });
      DataFlowNode.prototype.numChildren = function () {
          return this._children.length;
      };
      DataFlowNode.prototype.addChild = function (child) {
          this._children.push(child);
      };
      DataFlowNode.prototype.removeChild = function (oldChild) {
          this._children.splice(this._children.indexOf(oldChild), 1);
      };
      /**
       * Remove node from the dataflow.
       */
      DataFlowNode.prototype.remove = function () {
          for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
              var child = _a[_i];
              child.parent = this._parent;
          }
          this._parent.removeChild(this);
      };
      /**
       * Insert another node as a parent of this node.
       */
      DataFlowNode.prototype.insertAsParentOf = function (other) {
          var parent = other.parent;
          parent.removeChild(this);
          this.parent = parent;
          other.parent = this;
      };
      DataFlowNode.prototype.swapWithParent = function () {
          var parent = this._parent;
          var newParent = parent.parent;
          // reconnect the children
          for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
              var child = _a[_i];
              child.parent = parent;
          }
          // remove old links
          this._children = []; // equivalent to removing every child link one by one
          parent.removeChild(this);
          parent.parent.removeChild(parent);
          // swap two nodes
          this.parent = newParent;
          parent.parent = this;
      };
      return DataFlowNode;
  }());
  var OutputNode = /** @class */ (function (_super) {
      __extends(OutputNode, _super);
      /**
       * @param source The name of the source. Will change in assemble.
       * @param type The type of the output node.
       * @param refCounts A global ref counter map.
       */
      function OutputNode(parent, source, type, refCounts) {
          var _this = _super.call(this, parent, source) || this;
          _this.type = type;
          _this.refCounts = refCounts;
          _this._source = _this._name = source;
          if (_this.refCounts && !(_this._name in _this.refCounts)) {
              _this.refCounts[_this._name] = 0;
          }
          return _this;
      }
      OutputNode.prototype.clone = function () {
          var cloneObj = new this.constructor;
          cloneObj.debugName = 'clone_' + this.debugName;
          cloneObj._source = this._source;
          cloneObj._name = 'clone_' + this._name;
          cloneObj.type = this.type;
          cloneObj.refCounts = this.refCounts;
          cloneObj.refCounts[cloneObj._name] = 0;
          return cloneObj;
      };
      /**
       * Request the datasource name and increase the ref counter.
       *
       * During the parsing phase, this will return the simple name such as 'main' or 'raw'.
       * It is crucial to request the name from an output node to mark it as a required node.
       * If nobody ever requests the name, this datasource will not be instantiated in the assemble phase.
       *
       * In the assemble phase, this will return the correct name.
       */
      OutputNode.prototype.getSource = function () {
          this.refCounts[this._name]++;
          return this._source;
      };
      OutputNode.prototype.isRequired = function () {
          return !!this.refCounts[this._name];
      };
      OutputNode.prototype.setSource = function (source) {
          this._source = source;
      };
      return OutputNode;
  }(DataFlowNode));

  /**
   * We don't know what a calculate node depends on so we should never move it beyond anything that produces fields.
   */
  var CalculateNode = /** @class */ (function (_super) {
      __extends(CalculateNode, _super);
      function CalculateNode(parent, transform) {
          var _this = _super.call(this, parent) || this;
          _this.transform = transform;
          return _this;
      }
      CalculateNode.prototype.clone = function () {
          return new CalculateNode(null, duplicate(this.transform));
      };
      CalculateNode.parseAllForSortIndex = function (parent, model) {
          // get all the encoding with sort fields from model
          model.forEachFieldDef(function (fieldDef, channel) {
              if (isScaleFieldDef(fieldDef) && isSortArray(fieldDef.sort)) {
                  var transform = {
                      calculate: CalculateNode.calculateExpressionFromSortField(fieldDef.field, fieldDef.sort),
                      as: sortArrayIndexField(model, channel)
                  };
                  parent = new CalculateNode(parent, transform);
              }
          });
          return parent;
      };
      CalculateNode.calculateExpressionFromSortField = function (field, sortFields) {
          var expression = '';
          var i;
          for (i = 0; i < sortFields.length; i++) {
              expression += "datum." + field + " === '" + sortFields[i] + "' ? " + i + " : ";
          }
          expression += i;
          return expression;
      };
      CalculateNode.prototype.producedFields = function () {
          var out = {};
          out[this.transform.as] = true;
          return out;
      };
      CalculateNode.prototype.assemble = function () {
          return {
              type: 'formula',
              expr: this.transform.calculate,
              as: this.transform.as
          };
      };
      return CalculateNode;
  }(DataFlowNode));
  function sortArrayIndexField(model, channel) {
      var fieldDef = model.fieldDef(channel);
      return channel + "_" + vgField(fieldDef) + "_sort_index";
  }

  function addDimension(dims, channel, fieldDef) {
      if (fieldDef.bin) {
          dims[vgField(fieldDef, {})] = true;
          dims[vgField(fieldDef, { binSuffix: 'end' })] = true;
          if (binRequiresRange(fieldDef, channel)) {
              dims[vgField(fieldDef, { binSuffix: 'range' })] = true;
          }
      }
      else {
          dims[vgField(fieldDef)] = true;
      }
      return dims;
  }
  function mergeMeasures(parentMeasures, childMeasures) {
      for (var f in childMeasures) {
          if (childMeasures.hasOwnProperty(f)) {
              // when we merge a measure, we either have to add an aggregation operator or even a new field
              var ops = childMeasures[f];
              for (var op in ops) {
                  if (ops.hasOwnProperty(op)) {
                      if (f in parentMeasures) {
                          // add operator to existing measure field
                          parentMeasures[f][op] = ops[op];
                      }
                      else {
                          parentMeasures[f] = { op: ops[op] };
                      }
                  }
              }
          }
      }
  }
  var AggregateNode = /** @class */ (function (_super) {
      __extends(AggregateNode, _super);
      /**
       * @param dimensions string set for dimensions
       * @param measures dictionary mapping field name => dict of aggregation functions and names to use
       */
      function AggregateNode(parent, dimensions, measures) {
          var _this = _super.call(this, parent) || this;
          _this.dimensions = dimensions;
          _this.measures = measures;
          return _this;
      }
      AggregateNode.prototype.clone = function () {
          return new AggregateNode(null, __assign({}, this.dimensions), duplicate(this.measures));
      };
      AggregateNode.makeFromEncoding = function (parent, model) {
          var isAggregate = false;
          model.forEachFieldDef(function (fd) {
              if (fd.aggregate) {
                  isAggregate = true;
              }
          });
          var meas = {};
          var dims = {};
          if (!isAggregate) {
              // no need to create this node if the model has no aggregation
              return null;
          }
          model.forEachFieldDef(function (fieldDef, channel) {
              var aggregate = fieldDef.aggregate, field = fieldDef.field;
              if (aggregate) {
                  if (aggregate === 'count') {
                      meas['*'] = meas['*'] || {};
                      meas['*']['count'] = vgField(fieldDef);
                  }
                  else {
                      meas[field] = meas[field] || {};
                      meas[field][aggregate] = vgField(fieldDef);
                      // For scale channel with domain === 'unaggregated', add min/max so we can use their union as unaggregated domain
                      if (isScaleChannel(channel) && model.scaleDomain(channel) === 'unaggregated') {
                          meas[field]['min'] = vgField({ field: field, aggregate: 'min' });
                          meas[field]['max'] = vgField({ field: field, aggregate: 'max' });
                      }
                  }
              }
              else {
                  addDimension(dims, channel, fieldDef);
              }
          });
          if ((keys(dims).length + keys(meas).length) === 0) {
              return null;
          }
          return new AggregateNode(parent, dims, meas);
      };
      AggregateNode.makeFromTransform = function (parent, t) {
          var dims = {};
          var meas = {};
          for (var _i = 0, _a = t.aggregate; _i < _a.length; _i++) {
              var s = _a[_i];
              var op = s.op, field = s.field, as = s.as;
              if (op) {
                  if (op === 'count') {
                      meas['*'] = meas['*'] || {};
                      meas['*']['count'] = as || vgField(s);
                  }
                  else {
                      meas[field] = meas[field] || {};
                      meas[field][op] = as || vgField(s);
                  }
              }
          }
          for (var _b = 0, _c = t.groupby || []; _b < _c.length; _b++) {
              var s = _c[_b];
              dims[s] = true;
          }
          if ((keys(dims).length + keys(meas).length) === 0) {
              return null;
          }
          return new AggregateNode(parent, dims, meas);
      };
      AggregateNode.prototype.merge = function (other) {
          if (!differ(this.dimensions, other.dimensions)) {
              mergeMeasures(this.measures, other.measures);
              other.remove();
          }
          else {
              debug('different dimensions, cannot merge');
          }
      };
      AggregateNode.prototype.addDimensions = function (fields) {
          var _this = this;
          fields.forEach(function (f) { return _this.dimensions[f] = true; });
      };
      AggregateNode.prototype.dependentFields = function () {
          var out = {};
          keys(this.dimensions).forEach(function (f) { return out[f] = true; });
          keys(this.measures).forEach(function (m) { return out[m] = true; });
          return out;
      };
      AggregateNode.prototype.producedFields = function () {
          var _this = this;
          var out = {};
          keys(this.measures).forEach(function (field) {
              keys(_this.measures[field]).forEach(function (op) {
                  out[op + "_" + field] = true;
              });
          });
          return out;
      };
      AggregateNode.prototype.assemble = function () {
          var ops = [];
          var fields = [];
          var as = [];
          for (var _i = 0, _a = keys(this.measures); _i < _a.length; _i++) {
              var field = _a[_i];
              for (var _b = 0, _c = keys(this.measures[field]); _b < _c.length; _b++) {
                  var op = _c[_b];
                  as.push(this.measures[field][op]);
                  ops.push(op);
                  fields.push(field);
              }
          }
          var result = {
              type: 'aggregate',
              groupby: keys(this.dimensions),
              ops: ops,
              fields: fields,
              as: as
          };
          return result;
      };
      return AggregateNode;
  }(DataFlowNode));

  /**
   * A node that helps us track what fields we are faceting by.
   */
  var FacetNode = /** @class */ (function (_super) {
      __extends(FacetNode, _super);
      /**
       * @param model The facet model.
       * @param name The name that this facet source will have.
       * @param data The source data for this facet data.
       */
      function FacetNode(parent, model, name, data) {
          var _this = _super.call(this, parent) || this;
          _this.model = model;
          _this.name = name;
          _this.data = data;
          if (model.facet.column) {
              _this.columnFields = [model.vgField(COLUMN)];
              _this.columnName = model.getName('column_domain');
              if (model.fieldDef(COLUMN).bin) {
                  _this.columnFields.push(model.vgField(COLUMN, { binSuffix: 'end' }));
              }
          }
          if (model.facet.row) {
              _this.rowFields = [model.vgField(ROW)];
              _this.rowName = model.getName('row_domain');
              if (model.fieldDef(ROW).bin) {
                  _this.rowFields.push(model.vgField(ROW, { binSuffix: 'end' }));
              }
          }
          _this.childModel = model.child;
          return _this;
      }
      Object.defineProperty(FacetNode.prototype, "fields", {
          get: function () {
              var fields = [];
              if (this.columnFields) {
                  fields = fields.concat(this.columnFields);
              }
              if (this.rowFields) {
                  fields = fields.concat(this.rowFields);
              }
              return fields;
          },
          enumerable: true,
          configurable: true
      });
      /**
       * The name to reference this source is its name.
       */
      FacetNode.prototype.getSource = function () {
          return this.name;
      };
      FacetNode.prototype.getChildIndependentFieldsWithStep = function () {
          var childIndependentFieldsWithStep = {};
          for (var _i = 0, _a = ['x', 'y']; _i < _a.length; _i++) {
              var channel = _a[_i];
              var childScaleComponent = this.childModel.component.scales[channel];
              if (childScaleComponent && !childScaleComponent.merged) {
                  var type = childScaleComponent.get('type');
                  var range = childScaleComponent.get('range');
                  if (hasDiscreteDomain(type) && isVgRangeStep(range)) {
                      var domain = assembleDomain(this.childModel, channel);
                      var field = getFieldFromDomain(domain);
                      if (field) {
                          childIndependentFieldsWithStep[channel] = field;
                      }
                      else {
                          warn('Unknown field for ${channel}.  Cannot calculate view size.');
                      }
                  }
              }
          }
          return childIndependentFieldsWithStep;
      };
      FacetNode.prototype.assembleRowColumnData = function (channel, crossedDataName, childIndependentFieldsWithStep) {
          var aggregateChildField = {};
          var childChannel = channel === 'row' ? 'y' : 'x';
          if (childIndependentFieldsWithStep[childChannel]) {
              if (crossedDataName) {
                  aggregateChildField = {
                      // If there is a crossed data, calculate max
                      fields: ["distinct_" + childIndependentFieldsWithStep[childChannel]],
                      ops: ['max'],
                      // Although it is technically a max, just name it distinct so it's easier to refer to it
                      as: ["distinct_" + childIndependentFieldsWithStep[childChannel]]
                  };
              }
              else {
                  aggregateChildField = {
                      // If there is no crossed data, just calculate distinct
                      fields: [childIndependentFieldsWithStep[childChannel]],
                      ops: ['distinct']
                  };
              }
          }
          return {
              name: channel === 'row' ? this.rowName : this.columnName,
              // Use data from the crossed one if it exist
              source: crossedDataName || this.data,
              transform: [__assign({ type: 'aggregate', groupby: channel === 'row' ? this.rowFields : this.columnFields }, aggregateChildField)]
          };
      };
      FacetNode.prototype.assemble = function () {
          var data = [];
          var crossedDataName = null;
          var childIndependentFieldsWithStep = this.getChildIndependentFieldsWithStep();
          if (this.columnName && this.rowName && (childIndependentFieldsWithStep.x || childIndependentFieldsWithStep.y)) {
              // Need to create a cross dataset to correctly calculate cardinality
              crossedDataName = "cross_" + this.columnName + "_" + this.rowName;
              var fields = [].concat(childIndependentFieldsWithStep.x ? [childIndependentFieldsWithStep.x] : [], childIndependentFieldsWithStep.y ? [childIndependentFieldsWithStep.y] : []);
              var ops = fields.map(function () { return 'distinct'; });
              data.push({
                  name: crossedDataName,
                  source: this.data,
                  transform: [{
                          type: 'aggregate',
                          groupby: this.columnFields.concat(this.rowFields),
                          fields: fields,
                          ops: ops
                      }]
              });
          }
          if (this.columnName) {
              data.push(this.assembleRowColumnData('column', crossedDataName, childIndependentFieldsWithStep));
          }
          if (this.rowName) {
              data.push(this.assembleRowColumnData('row', crossedDataName, childIndependentFieldsWithStep));
          }
          return data;
      };
      return FacetNode;
  }(DataFlowNode));

  var FilterInvalidNode = /** @class */ (function (_super) {
      __extends(FilterInvalidNode, _super);
      function FilterInvalidNode(parent, fieldDefs) {
          var _this = _super.call(this, parent) || this;
          _this.fieldDefs = fieldDefs;
          return _this;
      }
      FilterInvalidNode.prototype.clone = function () {
          return new FilterInvalidNode(null, __assign({}, this.fieldDefs));
      };
      FilterInvalidNode.make = function (parent, model) {
          var config = model.config, mark = model.mark;
          if (config.invalidValues !== 'filter') {
              return null;
          }
          var filter = model.reduceFieldDef(function (aggregator, fieldDef, channel) {
              var scaleComponent = isScaleChannel(channel) && model.getScaleComponent(channel);
              if (scaleComponent) {
                  var scaleType = scaleComponent.get('type');
                  // While discrete domain scales can handle invalid values, continuous scales can't.
                  // Thus, for non-path marks, we have to filter null for scales with continuous domains.
                  // (For path marks, we will use "defined" property and skip these values instead.)
                  if (hasContinuousDomain(scaleType) && !fieldDef.aggregate && !isPathMark(mark)) {
                      aggregator[fieldDef.field] = fieldDef;
                  }
              }
              return aggregator;
          }, {});
          if (!keys(filter).length) {
              return null;
          }
          return new FilterInvalidNode(parent, filter);
      };
      Object.defineProperty(FilterInvalidNode.prototype, "filter", {
          get: function () {
              return this.fieldDefs;
          },
          enumerable: true,
          configurable: true
      });
      // create the VgTransforms for each of the filtered fields
      FilterInvalidNode.prototype.assemble = function () {
          var _this = this;
          var filters = keys(this.filter).reduce(function (vegaFilters, field) {
              var fieldDef = _this.fieldDefs[field];
              var ref = vgField(fieldDef, { expr: 'datum' });
              if (fieldDef !== null) {
                  vegaFilters.push(ref + " !== null");
                  vegaFilters.push("!isNaN(" + ref + ")");
              }
              return vegaFilters;
          }, []);
          return filters.length > 0 ?
              {
                  type: 'filter',
                  expr: filters.join(' && ')
              } : null;
      };
      return FilterInvalidNode;
  }(DataFlowNode));

  /**
   * @param field The field.
   * @param parse What to parse the field as.
   */
  function parseExpression(field$$1, parse) {
      var f = accessPathWithDatum(field$$1);
      if (parse === 'number') {
          return "toNumber(" + f + ")";
      }
      else if (parse === 'boolean') {
          return "toBoolean(" + f + ")";
      }
      else if (parse === 'string') {
          return "toString(" + f + ")";
      }
      else if (parse === 'date') {
          return "toDate(" + f + ")";
      }
      else if (parse === 'flatten') {
          return f;
      }
      else if (parse.indexOf('date:') === 0) {
          var specifier = parse.slice(5, parse.length);
          return "timeParse(" + f + "," + specifier + ")";
      }
      else if (parse.indexOf('utc:') === 0) {
          var specifier = parse.slice(4, parse.length);
          return "utcParse(" + f + "," + specifier + ")";
      }
      else {
          warn(message.unrecognizedParse(parse));
          return null;
      }
  }
  var ParseNode = /** @class */ (function (_super) {
      __extends(ParseNode, _super);
      function ParseNode(parent, parse) {
          var _this = _super.call(this, parent) || this;
          _this._parse = parse;
          return _this;
      }
      ParseNode.prototype.clone = function () {
          return new ParseNode(null, duplicate(this._parse));
      };
      /**
       * Creates a parse node from a data.format.parse and updates ancestorParse.
       */
      ParseNode.makeExplicit = function (parent, model, ancestorParse) {
          // Custom parse
          var explicit = {};
          var data = model.data;
          if (data && data.format && data.format.parse) {
              explicit = data.format.parse;
          }
          return this.makeWithAncestors(parent, explicit, {}, ancestorParse);
      };
      ParseNode.makeImplicitFromFilterTransform = function (parent, transform, ancestorParse) {
          var parse = {};
          forEachLeaf(transform.filter, function (filter) {
              if (isFieldPredicate(filter)) {
                  // Automatically add a parse node for filters with filter objects
                  var val = null;
                  // For EqualFilter, just use the equal property.
                  // For RangeFilter and OneOfFilter, all array members should have
                  // the same type, so we only use the first one.
                  if (isFieldEqualPredicate(filter)) {
                      val = filter.equal;
                  }
                  else if (isFieldRangePredicate(filter)) {
                      val = filter.range[0];
                  }
                  else if (isFieldOneOfPredicate(filter)) {
                      val = (filter.oneOf || filter['in'])[0];
                  } // else -- for filter expression, we can't infer anything
                  if (val) {
                      if (isDateTime(val)) {
                          parse[filter.field] = 'date';
                      }
                      else if (isNumber(val)) {
                          parse[filter.field] = 'number';
                      }
                      else if (isString(val)) {
                          parse[filter.field] = 'string';
                      }
                  }
                  if (filter.timeUnit) {
                      parse[filter.field] = 'date';
                  }
              }
          });
          if (keys(parse).length === 0) {
              return null;
          }
          return this.makeWithAncestors(parent, {}, parse, ancestorParse);
      };
      /**
       * Creates a parse node for implicit parsing from a model and updates ancestorParse.
       */
      ParseNode.makeImplicitFromEncoding = function (parent, model, ancestorParse) {
          var implicit = {};
          if (isUnitModel(model) || isFacetModel(model)) {
              // Parse encoded fields
              model.forEachFieldDef(function (fieldDef) {
                  if (isTimeFieldDef(fieldDef)) {
                      implicit[fieldDef.field] = 'date';
                  }
                  else if (isNumberFieldDef(fieldDef)) {
                      if (!isCountingAggregateOp(fieldDef.aggregate)) {
                          implicit[fieldDef.field] = 'number';
                      }
                  }
                  else if (accessPathDepth(fieldDef.field) > 1) {
                      // For non-date/non-number (strings and booleans), derive a flattened field for a referenced nested field.
                      // (Parsing numbers / dates already flattens numeric and temporal fields.)
                      if (!(fieldDef.field in implicit)) {
                          implicit[fieldDef.field] = 'flatten';
                      }
                  }
                  else if (isScaleFieldDef(fieldDef) && isSortField(fieldDef.sort) && accessPathDepth(fieldDef.sort.field) > 1) {
                      // Flatten fields that we sort by but that are not otherwise flattened.
                      if (!(fieldDef.sort.field in implicit)) {
                          implicit[fieldDef.sort.field] = 'flatten';
                      }
                  }
              });
          }
          return this.makeWithAncestors(parent, {}, implicit, ancestorParse);
      };
      /**
       * Creates a parse node from "explicit" parse and "implicit" parse and updates ancestorParse.
       */
      ParseNode.makeWithAncestors = function (parent, explicit, implicit, ancestorParse) {
          // We should not parse what has already been parsed in a parent (explicitly or implicitly) or what has been derived (maked as "derived"). We also don't need to flatten a field that has already been parsed.
          for (var _i = 0, _a = keys(implicit); _i < _a.length; _i++) {
              var field$$1 = _a[_i];
              var parsedAs = ancestorParse.getWithExplicit(field$$1);
              if (parsedAs.value !== undefined) {
                  // We always ignore derived fields even if they are implicitly defined because we expect users to create the right types.
                  if (parsedAs.explicit || parsedAs.value === implicit[field$$1] || parsedAs.value === 'derived' || implicit[field$$1] === 'flatten') {
                      delete implicit[field$$1];
                  }
                  else {
                      warn(message.differentParse(field$$1, implicit[field$$1], parsedAs.value));
                  }
              }
          }
          for (var _b = 0, _c = keys(explicit); _b < _c.length; _b++) {
              var field$$1 = _c[_b];
              var parsedAs = ancestorParse.get(field$$1);
              if (parsedAs !== undefined) {
                  // Don't parse a field again if it has been parsed with the same type already.
                  if (parsedAs === explicit[field$$1]) {
                      delete explicit[field$$1];
                  }
                  else {
                      warn(message.differentParse(field$$1, explicit[field$$1], parsedAs));
                  }
              }
          }
          var parse = new Split(explicit, implicit);
          // add the format parse from this model so that children don't parse the same field again
          ancestorParse.copyAll(parse);
          // copy only non-null parses
          var p = {};
          for (var _d = 0, _e = keys(parse.combine()); _d < _e.length; _d++) {
              var key$$1 = _e[_d];
              var val = parse.get(key$$1);
              if (val !== null) {
                  p[key$$1] = val;
              }
          }
          if (keys(p).length === 0 || ancestorParse.parseNothing) {
              return null;
          }
          return new ParseNode(parent, p);
      };
      Object.defineProperty(ParseNode.prototype, "parse", {
          get: function () {
              return this._parse;
          },
          enumerable: true,
          configurable: true
      });
      ParseNode.prototype.merge = function (other) {
          this._parse = __assign({}, this._parse, other.parse);
          other.remove();
      };
      /**
       * Assemble an object for Vega's format.parse property.
       */
      ParseNode.prototype.assembleFormatParse = function () {
          var formatParse = {};
          for (var _i = 0, _a = keys(this._parse); _i < _a.length; _i++) {
              var field$$1 = _a[_i];
              var p = this._parse[field$$1];
              if (accessPathDepth(field$$1) === 1) {
                  formatParse[field$$1] = p;
              }
          }
          return formatParse;
      };
      // format parse depends and produces all fields in its parse
      ParseNode.prototype.producedFields = function () {
          return toSet(keys(this._parse));
      };
      ParseNode.prototype.dependentFields = function () {
          return toSet(keys(this._parse));
      };
      ParseNode.prototype.assembleTransforms = function (onlyNested) {
          var _this = this;
          if (onlyNested === void 0) { onlyNested = false; }
          return keys(this._parse)
              .filter(function (field$$1) { return onlyNested ? accessPathDepth(field$$1) > 1 : true; })
              .map(function (field$$1) {
              var expr = parseExpression(field$$1, _this._parse[field$$1]);
              if (!expr) {
                  return null;
              }
              var formula = {
                  type: 'formula',
                  expr: expr,
                  as: removePathFromField(field$$1) // Vega output is always flattened
              };
              return formula;
          }).filter(function (t) { return t !== null; });
      };
      return ParseNode;
  }(DataFlowNode));

  var SourceNode = /** @class */ (function (_super) {
      __extends(SourceNode, _super);
      function SourceNode(data) {
          var _this = _super.call(this, null) || this;
          data = data || { name: 'source' };
          if (isInlineData(data)) {
              _this._data = { values: data.values };
          }
          else if (isUrlData(data)) {
              _this._data = { url: data.url };
              if (!data.format) {
                  data.format = {};
              }
              if (!data.format || !data.format.type) {
                  // Extract extension from URL using snippet from
                  // http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
                  var defaultExtension = /(?:\.([^.]+))?$/.exec(data.url)[1];
                  if (!contains(['json', 'csv', 'tsv', 'dsv', 'topojson'], defaultExtension)) {
                      defaultExtension = 'json';
                  }
                  // defaultExtension has type string but we ensure that it is DataFormatType above
                  data.format.type = defaultExtension;
              }
          }
          else if (isNamedData(data)) {
              _this._data = {};
          }
          // any dataset can be named
          if (data.name) {
              _this._name = data.name;
          }
          if (data.format) {
              var _a = data.format, _b = _a.parse, format = __rest(_a, ["parse"]);
              _this._data.format = format;
          }
          return _this;
      }
      Object.defineProperty(SourceNode.prototype, "data", {
          get: function () {
              return this._data;
          },
          enumerable: true,
          configurable: true
      });
      SourceNode.prototype.hasName = function () {
          return !!this._name;
      };
      Object.defineProperty(SourceNode.prototype, "dataName", {
          get: function () {
              return this._name;
          },
          set: function (name) {
              this._name = name;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SourceNode.prototype, "parent", {
          set: function (parent) {
              throw new Error('Source nodes have to be roots.');
          },
          enumerable: true,
          configurable: true
      });
      SourceNode.prototype.remove = function () {
          throw new Error('Source nodes are roots and cannot be removed.');
      };
      /**
       * Return a unique identifier for this data source.
       */
      SourceNode.prototype.hash = function () {
          if (isInlineData(this._data)) {
              if (!this._hash) {
                  // Hashing can be expensive for large inline datasets.
                  this._hash = hash(this._data);
              }
              return this._hash;
          }
          else if (isUrlData(this._data)) {
              return hash([this._data.url, this._data.format]);
          }
          else {
              return this._name;
          }
      };
      SourceNode.prototype.assemble = function () {
          return __assign({ name: this._name }, this._data, { transform: [] });
      };
      return SourceNode;
  }(DataFlowNode));

  var TimeUnitNode = /** @class */ (function (_super) {
      __extends(TimeUnitNode, _super);
      function TimeUnitNode(parent, formula) {
          var _this = _super.call(this, parent) || this;
          _this.formula = formula;
          return _this;
      }
      TimeUnitNode.prototype.clone = function () {
          return new TimeUnitNode(null, duplicate(this.formula));
      };
      TimeUnitNode.makeFromEncoding = function (parent, model) {
          var formula = model.reduceFieldDef(function (timeUnitComponent, fieldDef) {
              if (fieldDef.timeUnit) {
                  var f = vgField(fieldDef);
                  timeUnitComponent[f] = {
                      as: f,
                      timeUnit: fieldDef.timeUnit,
                      field: fieldDef.field
                  };
              }
              return timeUnitComponent;
          }, {});
          if (keys(formula).length === 0) {
              return null;
          }
          return new TimeUnitNode(parent, formula);
      };
      TimeUnitNode.makeFromTransform = function (parent, t) {
          return new TimeUnitNode(parent, (_a = {},
              _a[t.field] = {
                  as: t.as,
                  timeUnit: t.timeUnit,
                  field: t.field
              },
              _a));
          var _a;
      };
      TimeUnitNode.prototype.merge = function (other) {
          this.formula = __assign({}, this.formula, other.formula);
          other.remove();
      };
      TimeUnitNode.prototype.producedFields = function () {
          var out = {};
          vals(this.formula).forEach(function (f) {
              out[f.as] = true;
          });
          return out;
      };
      TimeUnitNode.prototype.dependentFields = function () {
          var out = {};
          vals(this.formula).forEach(function (f) {
              out[f.field] = true;
          });
          return out;
      };
      TimeUnitNode.prototype.assemble = function () {
          return vals(this.formula).map(function (c) {
              return {
                  type: 'formula',
                  as: c.as,
                  expr: fieldExpr(c.timeUnit, c.field)
              };
          });
      };
      return TimeUnitNode;
  }(DataFlowNode));

  /**
   * Start optimization path at the leaves. Useful for merging up or removing things.
   *
   * If the callback returns true, the recursion continues.
   */
  function iterateFromLeaves(f) {
      function optimizeNextFromLeaves(node) {
          if (node instanceof SourceNode) {
              return;
          }
          var next = node.parent;
          if (f(node)) {
              optimizeNextFromLeaves(next);
          }
      }
      return optimizeNextFromLeaves;
  }
  /**
   * Move parse nodes up to forks.
   */
  function moveParseUp(node) {
      var parent = node.parent;
      // move parse up by merging or swapping
      if (node instanceof ParseNode) {
          if (parent instanceof SourceNode) {
              return false;
          }
          if (parent.numChildren() > 1) {
              // don't move parse further up but continue with parent.
              return true;
          }
          if (parent instanceof ParseNode) {
              parent.merge(node);
          }
          else {
              // don't swap with nodes that produce something that the parse node depends on (e.g. lookup)
              if (hasIntersection(parent.producedFields(), node.dependentFields())) {
                  return true;
              }
              node.swapWithParent();
          }
      }
      return true;
  }
  /**
   * Repeatedly remove leaf nodes that are not output or facet nodes.
   * The reason is that we don't need subtrees that don't have any output nodes.
   * Facet nodes are needed for the row or column domains.
   */
  function removeUnusedSubtrees(node) {
      if (node instanceof OutputNode || node.numChildren() > 0 || node instanceof FacetNode) {
          // no need to continue with parent because it is output node or will have children (there was a fork)
          return false;
      }
      else {
          node.remove();
      }
      return true;
  }
  /**
   * Removes duplicate time unit nodes (as determined by the name of the
   * output field) that may be generated due to selections projected over
   * time units.
   */
  function removeDuplicateTimeUnits(leaf) {
      var fields = {};
      return iterateFromLeaves(function (node) {
          if (node instanceof TimeUnitNode) {
              var pfields = node.producedFields();
              var dupe = keys(pfields).every(function (k) { return !!fields[k]; });
              if (dupe) {
                  node.remove();
              }
              else {
                  fields = __assign({}, fields, pfields);
              }
          }
          return true;
      })(leaf);
  }

  function getStackByFields(model) {
      return model.stack.stackBy.reduce(function (fields, by) {
          var fieldDef = by.fieldDef;
          var _field = vgField(fieldDef);
          if (_field) {
              fields.push(_field);
          }
          return fields;
      }, []);
  }
  function isValidAsArray(as) {
      return isArray(as) && as.every(function (s) { return isString(s); }) && as.length > 1;
  }
  var StackNode = /** @class */ (function (_super) {
      __extends(StackNode, _super);
      function StackNode(parent, stack) {
          var _this = _super.call(this, parent) || this;
          _this._stack = stack;
          return _this;
      }
      StackNode.prototype.clone = function () {
          return new StackNode(null, duplicate(this._stack));
      };
      StackNode.makeFromTransform = function (parent, stackTransform) {
          var stack = stackTransform.stack, groupby = stackTransform.groupby, as = stackTransform.as, _a = stackTransform.offset, offset = _a === void 0 ? 'zero' : _a;
          var sortFields = [];
          var sortOrder = [];
          if (stackTransform.sort !== undefined) {
              for (var _i = 0, _b = stackTransform.sort; _i < _b.length; _i++) {
                  var sortField = _b[_i];
                  sortFields.push(sortField.field);
                  sortOrder.push(sortField.order === undefined ? 'ascending' : sortField.order);
              }
          }
          var sort = {
              field: sortFields,
              order: sortOrder,
          };
          var normalizedAs;
          if (isValidAsArray(as)) {
              normalizedAs = as;
          }
          else if (isString(as)) {
              normalizedAs = [as, as + '_end'];
          }
          else {
              normalizedAs = [stackTransform.stack + '_start', stackTransform.stack + '_end'];
          }
          return new StackNode(parent, {
              stackField: stack,
              groupby: groupby,
              offset: offset,
              sort: sort,
              facetby: [],
              as: normalizedAs
          });
      };
      StackNode.makeFromEncoding = function (parent, model) {
          var stackProperties = model.stack;
          if (!stackProperties) {
              return null;
          }
          var dimensionFieldDef;
          if (stackProperties.groupbyChannel) {
              dimensionFieldDef = model.fieldDef(stackProperties.groupbyChannel);
          }
          var stackby = getStackByFields(model);
          var orderDef = model.encoding.order;
          var sort;
          if (isArray(orderDef) || isFieldDef(orderDef)) {
              sort = sortParams(orderDef);
          }
          else {
              // default = descending by stackFields
              // FIXME is the default here correct for binned fields?
              sort = stackby.reduce(function (s, field$$1) {
                  s.field.push(field$$1);
                  s.order.push('descending');
                  return s;
              }, { field: [], order: [] });
          }
          // Refactored to add "as" in the make phase so that we can get producedFields
          // from the as property
          var field$$1 = model.vgField(stackProperties.fieldChannel);
          return new StackNode(parent, {
              dimensionFieldDef: dimensionFieldDef,
              stackField: field$$1,
              facetby: [],
              stackby: stackby,
              sort: sort,
              offset: stackProperties.offset,
              impute: stackProperties.impute,
              as: [field$$1 + '_start', field$$1 + '_end']
          });
      };
      Object.defineProperty(StackNode.prototype, "stack", {
          get: function () {
              return this._stack;
          },
          enumerable: true,
          configurable: true
      });
      StackNode.prototype.addDimensions = function (fields) {
          this._stack.facetby = this._stack.facetby.concat(fields);
      };
      StackNode.prototype.dependentFields = function () {
          var out = {};
          out[this._stack.stackField] = true;
          this.getGroupbyFields().forEach(function (f) { return out[f] = true; });
          this._stack.facetby.forEach(function (f) { return out[f] = true; });
          var field$$1 = this._stack.sort.field;
          isArray(field$$1) ? field$$1.forEach(function (f) { return out[f] = true; }) : out[field$$1] = true;
          return out;
      };
      StackNode.prototype.producedFields = function () {
          return this._stack.as.reduce(function (result, item) {
              result[item] = true;
              return result;
          }, {});
      };
      StackNode.prototype.getGroupbyFields = function () {
          var _a = this._stack, dimensionFieldDef = _a.dimensionFieldDef, impute = _a.impute, groupby = _a.groupby;
          if (dimensionFieldDef) {
              if (dimensionFieldDef.bin) {
                  if (impute) {
                      // For binned group by field with impute, we calculate bin_mid
                      // as we cannot impute two fields simultaneously
                      return [vgField(dimensionFieldDef, { binSuffix: 'mid' })];
                  }
                  return [
                      // For binned group by field without impute, we need both bin (start) and bin_end
                      vgField(dimensionFieldDef, {}),
                      vgField(dimensionFieldDef, { binSuffix: 'end' })
                  ];
              }
              return [vgField(dimensionFieldDef)];
          }
          return groupby || [];
      };
      StackNode.prototype.assemble = function () {
          var transform = [];
          var _a = this._stack, facetby = _a.facetby, dimensionFieldDef = _a.dimensionFieldDef, field$$1 = _a.stackField, stackby = _a.stackby, sort = _a.sort, offset = _a.offset, impute = _a.impute, as = _a.as;
          // Impute
          if (impute && dimensionFieldDef) {
              var dimensionField = dimensionFieldDef ? vgField(dimensionFieldDef, { binSuffix: 'mid' }) : undefined;
              if (dimensionFieldDef.bin) {
                  // As we can only impute one field at a time, we need to calculate
                  // mid point for a binned field
                  transform.push({
                      type: 'formula',
                      expr: '(' +
                          vgField(dimensionFieldDef, { expr: 'datum' }) +
                          '+' +
                          vgField(dimensionFieldDef, { expr: 'datum', binSuffix: 'end' }) +
                          ')/2',
                      as: dimensionField
                  });
              }
              transform.push({
                  type: 'impute',
                  field: field$$1,
                  groupby: stackby,
                  key: dimensionField,
                  method: 'value',
                  value: 0
              });
          }
          // Stack
          transform.push({
              type: 'stack',
              groupby: this.getGroupbyFields().concat(facetby),
              field: field$$1,
              sort: sort,
              as: as,
              offset: offset
          });
          return transform;
      };
      return StackNode;
  }(DataFlowNode));

  var FACET_SCALE_PREFIX = 'scale_';
  /**
   * Clones the subtree and ignores output nodes except for the leafs, which are renamed.
   */
  function cloneSubtree(facet) {
      function clone(node) {
          if (!(node instanceof FacetNode)) {
              var copy_1 = node.clone();
              if (copy_1 instanceof OutputNode) {
                  var newName = FACET_SCALE_PREFIX + copy_1.getSource();
                  copy_1.setSource(newName);
                  facet.model.component.data.outputNodes[newName] = copy_1;
              }
              else if (copy_1 instanceof AggregateNode || copy_1 instanceof StackNode) {
                  copy_1.addDimensions(facet.fields);
              }
              flatten(node.children.map(clone)).forEach(function (n) { return n.parent = copy_1; });
              return [copy_1];
          }
          return flatten(node.children.map(clone));
      }
      return clone;
  }
  /**
   * Move facet nodes down to the next fork or output node. Also pull the main output with the facet node.
   * After moving down the facet node, make a copy of the subtree and make it a child of the main output.
   */
  function moveFacetDown(node) {
      if (node instanceof FacetNode) {
          if (node.numChildren() === 1 && !(node.children[0] instanceof OutputNode)) {
              // move down until we hit a fork or output node
              var child = node.children[0];
              if (child instanceof AggregateNode || child instanceof StackNode) {
                  child.addDimensions(node.fields);
              }
              child.swapWithParent();
              moveFacetDown(node);
          }
          else {
              // move main to facet
              moveMainDownToFacet(node.model.component.data.main);
              // replicate the subtree and place it before the facet's main node
              var copy = flatten(node.children.map(cloneSubtree(node)));
              copy.forEach(function (c) { return c.parent = node.model.component.data.main; });
          }
      }
      else {
          node.children.forEach(moveFacetDown);
      }
  }
  function moveMainDownToFacet(node) {
      if (node instanceof OutputNode && node.type === MAIN) {
          if (node.numChildren() === 1) {
              var child = node.children[0];
              if (!(child instanceof FacetNode)) {
                  child.swapWithParent();
                  moveMainDownToFacet(node);
              }
          }
      }
  }
  /**
   * Remove nodes that are not required starting from a root.
   */
  function removeUnnecessaryNodes(node) {
      // remove empty null filter nodes
      if (node instanceof FilterInvalidNode && every(vals(node.filter), function (f) { return f === null; })) {
          node.remove();
      }
      // remove output nodes that are not required
      if (node instanceof OutputNode && !node.isRequired()) {
          node.remove();
      }
      node.children.forEach(removeUnnecessaryNodes);
  }
  /**
   * Return all leaf nodes.
   */
  function getLeaves(roots) {
      var leaves = [];
      function append(node) {
          if (node.numChildren() === 0) {
              leaves.push(node);
          }
          else {
              node.children.forEach(append);
          }
      }
      roots.forEach(append);
      return leaves;
  }
  /**
   * Optimizes the dataflow of the passed in data component.
   */
  function optimizeDataflow(dataComponent) {
      var roots = vals(dataComponent.sources);
      roots.forEach(removeUnnecessaryNodes);
      // remove source nodes that don't have any children because they also don't have output nodes
      roots = roots.filter(function (r) { return r.numChildren() > 0; });
      getLeaves(roots).forEach(iterateFromLeaves(removeUnusedSubtrees));
      roots = roots.filter(function (r) { return r.numChildren() > 0; });
      getLeaves(roots).forEach(iterateFromLeaves(moveParseUp));
      getLeaves(roots).forEach(removeDuplicateTimeUnits);
      roots.forEach(moveFacetDown);
      keys(dataComponent.sources).forEach(function (s) {
          if (dataComponent.sources[s].numChildren() === 0) {
              delete dataComponent.sources[s];
          }
      });
  }

  function parseScaleDomain(model) {
      if (isUnitModel(model)) {
          parseUnitScaleDomain(model);
      }
      else {
          parseNonUnitScaleDomain(model);
      }
  }
  function parseUnitScaleDomain(model) {
      var scales = model.specifiedScales;
      var localScaleComponents = model.component.scales;
      keys(localScaleComponents).forEach(function (channel) {
          var specifiedScale = scales[channel];
          var specifiedDomain = specifiedScale ? specifiedScale.domain : undefined;
          var domains = parseDomainForChannel(model, channel);
          var localScaleCmpt = localScaleComponents[channel];
          localScaleCmpt.domains = domains;
          if (isSelectionDomain(specifiedDomain)) {
              // As scale parsing occurs before selection parsing, we use a temporary
              // signal here and append the scale.domain definition. This is replaced
              // with the correct domainRaw signal during scale assembly.
              // For more information, see isRawSelectionDomain in selection.ts.
              // FIXME: replace this with a special property in the scaleComponent
              localScaleCmpt.set('domainRaw', {
                  signal: SELECTION_DOMAIN + hash(specifiedDomain)
              }, true);
          }
          if (model.component.data.isFaceted) {
              // get resolve from closest facet parent as this decides whether we need to refer to cloned subtree or not
              var facetParent = model;
              while (!isFacetModel(facetParent) && facetParent.parent) {
                  facetParent = facetParent.parent;
              }
              var resolve = facetParent.component.resolve.scale[channel];
              if (resolve === 'shared') {
                  for (var _i = 0, domains_1 = domains; _i < domains_1.length; _i++) {
                      var domain = domains_1[_i];
                      // Replace the scale domain with data output from a cloned subtree after the facet.
                      if (isDataRefDomain(domain)) {
                          // use data from cloned subtree (which is the same as data but with a prefix added once)
                          domain.data = FACET_SCALE_PREFIX + domain.data.replace(FACET_SCALE_PREFIX, '');
                      }
                  }
              }
          }
      });
  }
  function parseNonUnitScaleDomain(model) {
      for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
          var child = _a[_i];
          parseScaleDomain(child);
      }
      var localScaleComponents = model.component.scales;
      keys(localScaleComponents).forEach(function (channel) {
          var domains;
          var domainRaw = null;
          for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
              var child = _a[_i];
              var childComponent = child.component.scales[channel];
              if (childComponent) {
                  if (domains === undefined) {
                      domains = childComponent.domains;
                  }
                  else {
                      domains = domains.concat(childComponent.domains);
                  }
                  var dr = childComponent.get('domainRaw');
                  if (domainRaw && dr && domainRaw.signal !== dr.signal) {
                      warn('The same selection must be used to override scale domains in a layered view.');
                  }
                  domainRaw = dr;
              }
          }
          localScaleComponents[channel].domains = domains;
          if (domainRaw) {
              localScaleComponents[channel].set('domainRaw', domainRaw, true);
          }
      });
  }
  /**
   * Remove unaggregated domain if it is not applicable
   * Add unaggregated domain if domain is not specified and config.scale.useUnaggregatedDomain is true.
   */
  function normalizeUnaggregatedDomain(domain, fieldDef, scaleType, scaleConfig) {
      if (domain === 'unaggregated') {
          var _a = canUseUnaggregatedDomain(fieldDef, scaleType), valid = _a.valid, reason = _a.reason;
          if (!valid) {
              warn(reason);
              return undefined;
          }
      }
      else if (domain === undefined && scaleConfig.useUnaggregatedDomain) {
          // Apply config if domain is not specified.
          var valid = canUseUnaggregatedDomain(fieldDef, scaleType).valid;
          if (valid) {
              return 'unaggregated';
          }
      }
      return domain;
  }
  function parseDomainForChannel(model, channel) {
      var scaleType = model.getScaleComponent(channel).get('type');
      var domain = normalizeUnaggregatedDomain(model.scaleDomain(channel), model.fieldDef(channel), scaleType, model.config.scale);
      if (domain !== model.scaleDomain(channel)) {
          model.specifiedScales[channel] = __assign({}, model.specifiedScales[channel], { domain: domain });
      }
      // If channel is either X or Y then union them with X2 & Y2 if they exist
      if (channel === 'x' && model.channelHasField('x2')) {
          if (model.channelHasField('x')) {
              return parseSingleChannelDomain(scaleType, domain, model, 'x').concat(parseSingleChannelDomain(scaleType, domain, model, 'x2'));
          }
          else {
              return parseSingleChannelDomain(scaleType, domain, model, 'x2');
          }
      }
      else if (channel === 'y' && model.channelHasField('y2')) {
          if (model.channelHasField('y')) {
              return parseSingleChannelDomain(scaleType, domain, model, 'y').concat(parseSingleChannelDomain(scaleType, domain, model, 'y2'));
          }
          else {
              return parseSingleChannelDomain(scaleType, domain, model, 'y2');
          }
      }
      return parseSingleChannelDomain(scaleType, domain, model, channel);
  }
  function parseSingleChannelDomain(scaleType, domain, model, channel) {
      var fieldDef = model.fieldDef(channel);
      if (domain && domain !== 'unaggregated' && !isSelectionDomain(domain)) { // explicit value
          if (isDateTime(domain[0])) {
              return domain.map(function (dt) {
                  return { signal: "{data: " + dateTimeExpr(dt, true) + "}" };
              });
          }
          return [domain];
      }
      var stack = model.stack;
      if (stack && channel === stack.fieldChannel) {
          if (stack.offset === 'normalize') {
              return [[0, 1]];
          }
          var data = model.requestDataName(MAIN);
          return [{
                  data: data,
                  field: model.vgField(channel, { suffix: 'start' })
              }, {
                  data: data,
                  field: model.vgField(channel, { suffix: 'end' })
              }];
      }
      var sort = isScaleChannel(channel) ? domainSort(model, channel, scaleType) : undefined;
      if (domain === 'unaggregated') {
          var data = model.requestDataName(MAIN);
          var field$$1 = fieldDef.field;
          return [{
                  data: data,
                  field: vgField({ field: field$$1, aggregate: 'min' })
              }, {
                  data: data,
                  field: vgField({ field: field$$1, aggregate: 'max' })
              }];
      }
      else if (fieldDef.bin) { // bin
          if (isBinScale(scaleType)) {
              var signal = model.getName(binToString(fieldDef.bin) + "_" + fieldDef.field + "_bins");
              return [{ signal: "sequence(" + signal + ".start, " + signal + ".stop + " + signal + ".step, " + signal + ".step)" }];
          }
          if (hasDiscreteDomain(scaleType)) {
              // ordinal bin scale takes domain from bin_range, ordered by bin start
              // This is useful for both axis-based scale (x/y) and legend-based scale (other channels).
              return [{
                      // If sort by aggregation of a specified sort field, we need to use RAW table,
                      // so we can aggregate values for the scale independently from the main aggregation.
                      data: isBoolean$1(sort) ? model.requestDataName(MAIN) : model.requestDataName(RAW),
                      // Use range if we added it and the scale does not support computing a range as a signal.
                      field: model.vgField(channel, binRequiresRange(fieldDef, channel) ? { binSuffix: 'range' } : {}),
                      // we have to use a sort object if sort = true to make the sort correct by bin start
                      sort: sort === true || !isSortField(sort) ? {
                          field: model.vgField(channel, {}),
                          op: 'min' // min or max doesn't matter since we sort by the start of the bin range
                      } : sort
                  }];
          }
          else { // continuous scales
              if (channel === 'x' || channel === 'y') {
                  if (isBinParams(fieldDef.bin) && fieldDef.bin.extent) {
                      return [fieldDef.bin.extent];
                  }
                  // X/Y position have to include start and end for non-ordinal scale
                  var data = model.requestDataName(MAIN);
                  return [{
                          data: data,
                          field: model.vgField(channel, {})
                      }, {
                          data: data,
                          field: model.vgField(channel, { binSuffix: 'end' })
                      }];
              }
              else {
                  // TODO: use bin_mid
                  return [{
                          data: model.requestDataName(MAIN),
                          field: model.vgField(channel, {})
                      }];
              }
          }
      }
      else if (sort) {
          return [{
                  // If sort by aggregation of a specified sort field, we need to use RAW table,
                  // so we can aggregate values for the scale independently from the main aggregation.
                  data: isBoolean$1(sort) ? model.requestDataName(MAIN) : model.requestDataName(RAW),
                  field: model.vgField(channel),
                  sort: sort
              }];
      }
      else {
          return [{
                  data: model.requestDataName(MAIN),
                  field: model.vgField(channel)
              }];
      }
  }
  function domainSort(model, channel, scaleType) {
      if (!hasDiscreteDomain(scaleType)) {
          return undefined;
      }
      var fieldDef = model.fieldDef(channel);
      var sort = fieldDef.sort;
      // if the sort is specified with array, use the derived sort index field
      if (isSortArray(sort)) {
          return {
              op: 'min',
              field: sortArrayIndexField(model, channel),
              order: 'ascending'
          };
      }
      // Sorted based on an aggregate calculation over a specified sort field (only for ordinal scale)
      if (isSortField(sort)) {
          // flatten nested fields
          return __assign({}, sort, (sort.field ? { field: replacePathInField(sort.field) } : {}));
      }
      if (sort === 'descending') {
          return {
              op: 'min',
              field: model.vgField(channel),
              order: 'descending'
          };
      }
      if (contains(['ascending', undefined /* default =ascending*/], sort)) {
          return true;
      }
      // sort == null
      return undefined;
  }
  /**
   * Determine if a scale can use unaggregated domain.
   * @return {Boolean} Returns true if all of the following conditons applies:
   * 1. `scale.domain` is `unaggregated`
   * 2. Aggregation function is not `count` or `sum`
   * 3. The scale is quantitative or time scale.
   */
  function canUseUnaggregatedDomain(fieldDef, scaleType) {
      if (!fieldDef.aggregate) {
          return {
              valid: false,
              reason: message.unaggregateDomainHasNoEffectForRawField(fieldDef)
          };
      }
      if (!SHARED_DOMAIN_OP_INDEX[fieldDef.aggregate]) {
          return {
              valid: false,
              reason: message.unaggregateDomainWithNonSharedDomainOp(fieldDef.aggregate)
          };
      }
      if (fieldDef.type === 'quantitative') {
          if (scaleType === 'log') {
              return {
                  valid: false,
                  reason: message.unaggregatedDomainWithLogScale(fieldDef)
              };
          }
      }
      return { valid: true };
  }
  /**
   * Converts an array of domains to a single Vega scale domain.
   */
  function mergeDomains(domains) {
      var uniqueDomains = unique(domains.map(function (domain) {
          // ignore sort property when computing the unique domains
          if (isDataRefDomain(domain)) {
              var _s = domain.sort, domainWithoutSort = __rest(domain, ["sort"]);
              return domainWithoutSort;
          }
          return domain;
      }), hash);
      var sorts = unique(domains.map(function (d) {
          if (isDataRefDomain(d)) {
              var s = d.sort;
              if (s !== undefined && !isBoolean$1(s)) {
                  if (s.op === 'count') {
                      // let's make sure that if op is count, we don't use a field
                      delete s.field;
                  }
                  if (s.order === 'ascending') {
                      // drop order: ascending as it is the default
                      delete s.order;
                  }
              }
              return s;
          }
          return undefined;
      }).filter(function (s) { return s !== undefined; }), hash);
      if (uniqueDomains.length === 1) {
          var domain = domains[0];
          if (isDataRefDomain(domain) && sorts.length > 0) {
              var sort_1 = sorts[0];
              if (sorts.length > 1) {
                  warn(message.MORE_THAN_ONE_SORT);
                  sort_1 = true;
              }
              return __assign({}, domain, { sort: sort_1 });
          }
          return domain;
      }
      // only keep simple sort properties that work with unioned domains
      var simpleSorts = unique(sorts.map(function (s) {
          if (s === true) {
              return s;
          }
          if (s.op === 'count') {
              return s;
          }
          warn(message.domainSortDropped(s));
          return true;
      }), hash);
      var sort = undefined;
      if (simpleSorts.length === 1) {
          sort = simpleSorts[0];
      }
      else if (simpleSorts.length > 1) {
          warn(message.MORE_THAN_ONE_SORT);
          sort = true;
      }
      var allData = unique(domains.map(function (d) {
          if (isDataRefDomain(d)) {
              return d.data;
          }
          return null;
      }), function (x) { return x; });
      if (allData.length === 1 && allData[0] !== null) {
          // create a union domain of different fields with a single data source
          var domain = __assign({ data: allData[0], fields: uniqueDomains.map(function (d) { return d.field; }) }, (sort ? { sort: sort } : {}));
          return domain;
      }
      return __assign({ fields: uniqueDomains }, (sort ? { sort: sort } : {}));
  }
  /**
   * Return a field if a scale single field.
   * Return `undefined` otherwise.
   *
   */
  function getFieldFromDomain(domain) {
      if (isDataRefDomain(domain) && isString(domain.field)) {
          return domain.field;
      }
      else if (isDataRefUnionedDomain(domain)) {
          var field$$1 = void 0;
          for (var _i = 0, _a = domain.fields; _i < _a.length; _i++) {
              var nonUnionDomain = _a[_i];
              if (isDataRefDomain(nonUnionDomain) && isString(nonUnionDomain.field)) {
                  if (!field$$1) {
                      field$$1 = nonUnionDomain.field;
                  }
                  else if (field$$1 !== nonUnionDomain.field) {
                      warn('Detected faceted independent scales that union domain of multiple fields from different data sources.  We will use the first field.  The result view size may be incorrect.');
                      return field$$1;
                  }
              }
          }
          warn('Detected faceted independent scales that union domain of identical fields from different source detected.  We will assume that this is the same field from a different fork of the same data source.  However, if this is not case, the result view size maybe incorrect.');
          return field$$1;
      }
      else if (isFieldRefUnionDomain(domain)) {
          warn('Detected faceted independent scales that union domain of multiple fields from the same data source.  We will use the first field.  The result view size may be incorrect.');
          var field$$1 = domain.fields[0];
          return isString(field$$1) ? field$$1 : undefined;
      }
      return undefined;
  }
  function assembleDomain(model, channel) {
      var scaleComponent = model.component.scales[channel];
      var domains = scaleComponent.domains.map(function (domain) {
          // Correct references to data as the original domain's data was determined
          // in parseScale, which happens before parseData. Thus the original data
          // reference can be incorrect.
          if (isDataRefDomain(domain)) {
              domain.data = model.lookupDataSource(domain.data);
          }
          return domain;
      });
      // domains is an array that has to be merged into a single vega domain
      return mergeDomains(domains);
  }

  function assembleScales(model) {
      if (isLayerModel(model) || isConcatModel(model) || isRepeatModel(model)) {
          // For concat / layer / repeat, include scales of children too
          return model.children.reduce(function (scales, child) {
              return scales.concat(assembleScales(child));
          }, assembleScalesForModel(model));
      }
      else {
          // For facet, child scales would not be included in the parent's scope.
          // For unit, there is no child.
          return assembleScalesForModel(model);
      }
  }
  function assembleScalesForModel(model) {
      return keys(model.component.scales).reduce(function (scales, channel) {
          var scaleComponent = model.component.scales[channel];
          if (scaleComponent.merged) {
              // Skipped merged scales
              return scales;
          }
          var scale = scaleComponent.combine();
          // need to separate const and non const object destruction
          var domainRaw = scale.domainRaw, range = scale.range;
          var name = scale.name, type = scale.type, _d = scale.domainRaw, _r = scale.range, otherScaleProps = __rest(scale, ["name", "type", "domainRaw", "range"]);
          range = assembleScaleRange(range, name, model, channel);
          // As scale parsing occurs before selection parsing, a temporary signal
          // is used for domainRaw. Here, we detect if this temporary signal
          // is set, and replace it with the correct domainRaw signal.
          // For more information, see isRawSelectionDomain in selection.ts.
          if (domainRaw && isRawSelectionDomain(domainRaw)) {
              domainRaw = selectionScaleDomain(model, domainRaw);
          }
          scales.push(__assign({ name: name,
              type: type, domain: assembleDomain(model, channel) }, (domainRaw ? { domainRaw: domainRaw } : {}), { range: range }, otherScaleProps));
          return scales;
      }, []);
  }
  function assembleScaleRange(scaleRange, scaleName, model, channel) {
      // add signals to x/y range
      if (channel === 'x' || channel === 'y') {
          if (isVgRangeStep(scaleRange)) {
              // For x/y range step, use a signal created in layout assemble instead of a constant range step.
              return {
                  step: { signal: scaleName + '_step' }
              };
          }
          else if (isArray(scaleRange) && scaleRange.length === 2) {
              var r0 = scaleRange[0];
              var r1 = scaleRange[1];
              if (r0 === 0 && isVgSignalRef(r1)) {
                  // Replace width signal just in case it is renamed.
                  return [0, { signal: model.getSizeName(r1.signal) }];
              }
              else if (isVgSignalRef(r0) && r1 === 0) {
                  // Replace height signal just in case it is renamed.
                  return [{ signal: model.getSizeName(r0.signal) }, 0];
              }
          }
      }
      return scaleRange;
  }

  var ScaleComponent = /** @class */ (function (_super) {
      __extends(ScaleComponent, _super);
      function ScaleComponent(name, typeWithExplicit) {
          var _this = _super.call(this, {}, // no initial explicit property
          { name: name } // name as initial implicit property
          ) || this;
          _this.merged = false;
          _this.domains = [];
          _this.setWithExplicit('type', typeWithExplicit);
          return _this;
      }
      return ScaleComponent;
  }(Split));

  var RANGE_PROPERTIES = ['range', 'rangeStep', 'scheme'];
  function parseScaleRange(model) {
      if (isUnitModel(model)) {
          parseUnitScaleRange(model);
      }
      else {
          parseNonUnitScaleProperty(model, 'range');
      }
  }
  function parseUnitScaleRange(model) {
      var localScaleComponents = model.component.scales;
      // use SCALE_CHANNELS instead of scales[channel] to ensure that x, y come first!
      SCALE_CHANNELS.forEach(function (channel) {
          var localScaleCmpt = localScaleComponents[channel];
          if (!localScaleCmpt) {
              return;
          }
          var mergedScaleCmpt = model.getScaleComponent(channel);
          var specifiedScale = model.specifiedScales[channel];
          var fieldDef = model.fieldDef(channel);
          // Read if there is a specified width/height
          var sizeType = channel === 'x' ? 'width' : channel === 'y' ? 'height' : undefined;
          var sizeSpecified = sizeType ? !!model.component.layoutSize.get(sizeType) : undefined;
          var scaleType = mergedScaleCmpt.get('type');
          // if autosize is fit, size cannot be data driven
          var rangeStep = contains(['point', 'band'], scaleType) || !!specifiedScale.rangeStep;
          if (sizeType && model.fit && !sizeSpecified && rangeStep) {
              warn(message.CANNOT_FIX_RANGE_STEP_WITH_FIT);
              sizeSpecified = true;
          }
          var xyRangeSteps = getXYRangeStep(model);
          var rangeWithExplicit = parseRangeForChannel(channel, scaleType, fieldDef.type, specifiedScale, model.config, localScaleCmpt.get('zero'), model.mark, sizeSpecified, model.getName(sizeType), xyRangeSteps);
          localScaleCmpt.setWithExplicit('range', rangeWithExplicit);
      });
  }
  function getXYRangeStep(model) {
      var xyRangeSteps = [];
      var xScale = model.getScaleComponent('x');
      var xRange = xScale && xScale.get('range');
      if (xRange && isVgRangeStep(xRange) && isNumber(xRange.step)) {
          xyRangeSteps.push(xRange.step);
      }
      var yScale = model.getScaleComponent('y');
      var yRange = yScale && yScale.get('range');
      if (yRange && isVgRangeStep(yRange) && isNumber(yRange.step)) {
          xyRangeSteps.push(yRange.step);
      }
      return xyRangeSteps;
  }
  /**
   * Return mixins that includes one of the range properties (range, rangeStep, scheme).
   */
  function parseRangeForChannel(channel, scaleType, type, specifiedScale, config, zero$$1, mark, sizeSpecified, sizeSignal, xyRangeSteps) {
      var noRangeStep = sizeSpecified || specifiedScale.rangeStep === null;
      // Check if any of the range properties is specified.
      // If so, check if it is compatible and make sure that we only output one of the properties
      for (var _i = 0, RANGE_PROPERTIES_1 = RANGE_PROPERTIES; _i < RANGE_PROPERTIES_1.length; _i++) {
          var property = RANGE_PROPERTIES_1[_i];
          if (specifiedScale[property] !== undefined) {
              var supportedByScaleType = scaleTypeSupportProperty(scaleType, property);
              var channelIncompatability = channelScalePropertyIncompatability(channel, property);
              if (!supportedByScaleType) {
                  warn(message.scalePropertyNotWorkWithScaleType(scaleType, property, channel));
              }
              else if (channelIncompatability) { // channel
                  warn(channelIncompatability);
              }
              else {
                  switch (property) {
                      case 'range':
                          return makeExplicit(specifiedScale[property]);
                      case 'scheme':
                          return makeExplicit(parseScheme(specifiedScale[property]));
                      case 'rangeStep':
                          var rangeStep = specifiedScale[property];
                          if (rangeStep !== null) {
                              if (!sizeSpecified) {
                                  return makeExplicit({ step: rangeStep });
                              }
                              else {
                                  // If top-level size is specified, we ignore specified rangeStep.
                                  warn(message.rangeStepDropped(channel));
                              }
                          }
                  }
              }
          }
      }
      return makeImplicit(defaultRange(channel, scaleType, type, config, zero$$1, mark, sizeSignal, xyRangeSteps, noRangeStep));
  }
  function parseScheme(scheme) {
      if (isExtendedScheme(scheme)) {
          var r = { scheme: scheme.name };
          if (scheme.count) {
              r.count = scheme.count;
          }
          if (scheme.extent) {
              r.extent = scheme.extent;
          }
          return r;
      }
      return { scheme: scheme };
  }
  function defaultRange(channel, scaleType, type, config, zero$$1, mark, sizeSignal, xyRangeSteps, noRangeStep) {
      switch (channel) {
          case X:
          case Y:
              if (contains(['point', 'band'], scaleType) && !noRangeStep) {
                  if (channel === X && mark === 'text') {
                      if (config.scale.textXRangeStep) {
                          return { step: config.scale.textXRangeStep };
                      }
                  }
                  else {
                      if (config.scale.rangeStep) {
                          return { step: config.scale.rangeStep };
                      }
                  }
              }
              // If range step is null, use zero to width or height.
              // Note that these range signals are temporary
              // as they can be merged and renamed.
              // (We do not have the right size signal here since parseLayoutSize() happens after parseScale().)
              // We will later replace these temporary names with
              // the final name in assembleScaleRange()
              if (channel === Y && hasContinuousDomain(scaleType)) {
                  // For y continuous scale, we have to start from the height as the bottom part has the max value.
                  return [{ signal: sizeSignal }, 0];
              }
              else {
                  return [0, { signal: sizeSignal }];
              }
          case SIZE:
              // TODO: support custom rangeMin, rangeMax
              var rangeMin = sizeRangeMin(mark, zero$$1, config);
              var rangeMax = sizeRangeMax(mark, xyRangeSteps, config);
              return [rangeMin, rangeMax];
          case SHAPE:
              return 'symbol';
          case COLOR:
          case FILL:
          case STROKE:
              if (scaleType === 'ordinal') {
                  // Only nominal data uses ordinal scale by default
                  return type === 'nominal' ? 'category' : 'ordinal';
              }
              return mark === 'rect' || mark === 'geoshape' ? 'heatmap' : 'ramp';
          case OPACITY:
              // TODO: support custom rangeMin, rangeMax
              return [config.scale.minOpacity, config.scale.maxOpacity];
      }
      /* istanbul ignore next: should never reach here */
      throw new Error("Scale range undefined for channel " + channel);
  }
  function sizeRangeMin(mark, zero$$1, config) {
      if (zero$$1) {
          return 0;
      }
      switch (mark) {
          case 'bar':
          case 'tick':
              return config.scale.minBandSize;
          case 'line':
          case 'trail':
          case 'rule':
              return config.scale.minStrokeWidth;
          case 'text':
              return config.scale.minFontSize;
          case 'point':
          case 'square':
          case 'circle':
              return config.scale.minSize;
      }
      /* istanbul ignore next: should never reach here */
      // sizeRangeMin not implemented for the mark
      throw new Error(message.incompatibleChannel('size', mark));
  }
  function sizeRangeMax(mark, xyRangeSteps, config) {
      var scaleConfig = config.scale;
      switch (mark) {
          case 'bar':
          case 'tick':
              if (config.scale.maxBandSize !== undefined) {
                  return config.scale.maxBandSize;
              }
              return minXYRangeStep(xyRangeSteps, config.scale) - 1;
          case 'line':
          case 'trail':
          case 'rule':
              return config.scale.maxStrokeWidth;
          case 'text':
              return config.scale.maxFontSize;
          case 'point':
          case 'square':
          case 'circle':
              if (config.scale.maxSize) {
                  return config.scale.maxSize;
              }
              // FIXME this case totally should be refactored
              var pointStep = minXYRangeStep(xyRangeSteps, scaleConfig);
              return (pointStep - 2) * (pointStep - 2);
      }
      /* istanbul ignore next: should never reach here */
      // sizeRangeMax not implemented for the mark
      throw new Error(message.incompatibleChannel('size', mark));
  }
  /**
   * @returns {number} Range step of x or y or minimum between the two if both are ordinal scale.
   */
  function minXYRangeStep(xyRangeSteps, scaleConfig) {
      if (xyRangeSteps.length > 0) {
          return Math.min.apply(null, xyRangeSteps);
      }
      if (scaleConfig.rangeStep) {
          return scaleConfig.rangeStep;
      }
      return 21; // FIXME: re-evaluate the default value here.
  }

  function parseScaleProperty(model, property) {
      if (isUnitModel(model)) {
          parseUnitScaleProperty(model, property);
      }
      else {
          parseNonUnitScaleProperty(model, property);
      }
  }
  function parseUnitScaleProperty(model, property) {
      var localScaleComponents = model.component.scales;
      keys(localScaleComponents).forEach(function (channel) {
          var specifiedScale = model.specifiedScales[channel];
          var localScaleCmpt = localScaleComponents[channel];
          var mergedScaleCmpt = model.getScaleComponent(channel);
          var fieldDef = model.fieldDef(channel);
          var config = model.config;
          var specifiedValue = specifiedScale[property];
          var sType = mergedScaleCmpt.get('type');
          var supportedByScaleType = scaleTypeSupportProperty(sType, property);
          var channelIncompatability = channelScalePropertyIncompatability(channel, property);
          if (specifiedValue !== undefined) {
              // If there is a specified value, check if it is compatible with scale type and channel
              if (!supportedByScaleType) {
                  warn(message.scalePropertyNotWorkWithScaleType(sType, property, channel));
              }
              else if (channelIncompatability) { // channel
                  warn(channelIncompatability);
              }
          }
          if (supportedByScaleType && channelIncompatability === undefined) {
              if (specifiedValue !== undefined) {
                  // copyKeyFromObject ensure type safety
                  localScaleCmpt.copyKeyFromObject(property, specifiedScale);
              }
              else {
                  var value = getDefaultValue(property, channel, fieldDef, mergedScaleCmpt.get('type'), mergedScaleCmpt.get('padding'), mergedScaleCmpt.get('paddingInner'), specifiedScale.domain, model.markDef, config);
                  if (value !== undefined) {
                      localScaleCmpt.set(property, value, false);
                  }
              }
          }
      });
  }
  // Note: This method is used in Voyager.
  function getDefaultValue(property, channel, fieldDef, scaleType, scalePadding, scalePaddingInner, specifiedDomain, markDef, config) {
      var scaleConfig = config.scale;
      // If we have default rule-base, determine default value first
      switch (property) {
          case 'nice':
              return nice(scaleType, channel, fieldDef);
          case 'padding':
              return padding(channel, scaleType, scaleConfig, fieldDef, markDef, config.bar);
          case 'paddingInner':
              return paddingInner(scalePadding, channel, scaleConfig);
          case 'paddingOuter':
              return paddingOuter(scalePadding, channel, scaleType, scalePaddingInner, scaleConfig);
          case 'reverse':
              return reverse(scaleType, fieldDef.sort);
          case 'zero':
              return zero$1(channel, fieldDef, specifiedDomain, markDef);
      }
      // Otherwise, use scale config
      return scaleConfig[property];
  }
  function parseNonUnitScaleProperty(model, property) {
      var localScaleComponents = model.component.scales;
      for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
          var child = _a[_i];
          if (property === 'range') {
              parseScaleRange(child);
          }
          else {
              parseScaleProperty(child, property);
          }
      }
      keys(localScaleComponents).forEach(function (channel) {
          var valueWithExplicit;
          for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
              var child = _a[_i];
              var childComponent = child.component.scales[channel];
              if (childComponent) {
                  var childValueWithExplicit = childComponent.getWithExplicit(property);
                  valueWithExplicit = mergeValuesWithExplicit(valueWithExplicit, childValueWithExplicit, property, 'scale', tieBreakByComparing(function (v1, v2) {
                      switch (property) {
                          case 'range':
                              // For range step, prefer larger step
                              if (v1.step && v2.step) {
                                  return v1.step - v2.step;
                              }
                              return 0;
                          // TODO: precedence rule for other properties
                      }
                      return 0;
                  }));
              }
          }
          localScaleComponents[channel].setWithExplicit(property, valueWithExplicit);
      });
  }
  function nice(scaleType, channel, fieldDef) {
      if (fieldDef.bin || contains([ScaleType.TIME, ScaleType.UTC], scaleType)) {
          return undefined;
      }
      return contains([X, Y], channel); // return true for quantitative X/Y unless binned
  }
  function padding(channel, scaleType, scaleConfig, fieldDef, markDef, barConfig) {
      if (contains([X, Y], channel)) {
          if (isContinuousToContinuous(scaleType)) {
              if (scaleConfig.continuousPadding !== undefined) {
                  return scaleConfig.continuousPadding;
              }
              var type = markDef.type, orient = markDef.orient;
              if (type === 'bar' && !fieldDef.bin) {
                  if ((orient === 'vertical' && channel === 'x') ||
                      (orient === 'horizontal' && channel === 'y')) {
                      return barConfig.continuousBandSize;
                  }
              }
          }
          if (scaleType === ScaleType.POINT) {
              return scaleConfig.pointPadding;
          }
      }
      return undefined;
  }
  function paddingInner(paddingValue, channel, scaleConfig) {
      if (paddingValue !== undefined) {
          // If user has already manually specified "padding", no need to add default paddingInner.
          return undefined;
      }
      if (contains([X, Y], channel)) {
          // Padding is only set for X and Y by default.
          // Basically it doesn't make sense to add padding for color and size.
          // paddingOuter would only be called if it's a band scale, just return the default for bandScale.
          return scaleConfig.bandPaddingInner;
      }
      return undefined;
  }
  function paddingOuter(paddingValue, channel, scaleType, paddingInnerValue, scaleConfig) {
      if (paddingValue !== undefined) {
          // If user has already manually specified "padding", no need to add default paddingOuter.
          return undefined;
      }
      if (contains([X, Y], channel)) {
          // Padding is only set for X and Y by default.
          // Basically it doesn't make sense to add padding for color and size.
          if (scaleType === ScaleType.BAND) {
              if (scaleConfig.bandPaddingOuter !== undefined) {
                  return scaleConfig.bandPaddingOuter;
              }
              /* By default, paddingOuter is paddingInner / 2. The reason is that
                  size (width/height) = step * (cardinality - paddingInner + 2 * paddingOuter).
                  and we want the width/height to be integer by default.
                  Note that step (by default) and cardinality are integers.) */
              return paddingInnerValue / 2;
          }
      }
      return undefined;
  }
  function reverse(scaleType, sort) {
      if (hasContinuousDomain(scaleType) && sort === 'descending') {
          // For continuous domain scales, Vega does not support domain sort.
          // Thus, we reverse range instead if sort is descending
          return true;
      }
      return undefined;
  }
  function zero$1(channel, fieldDef, specifiedScale, markDef) {
      // If users explicitly provide a domain range, we should not augment zero as that will be unexpected.
      var hasCustomDomain = !!specifiedScale && specifiedScale !== 'unaggregated';
      if (hasCustomDomain) {
          return false;
      }
      // If there is no custom domain, return true only for the following cases:
      // 1) using quantitative field with size
      // While this can be either ratio or interval fields, our assumption is that
      // ratio are more common.
      if (channel === 'size' && fieldDef.type === 'quantitative') {
          return true;
      }
      // 2) non-binned, quantitative x-scale or y-scale
      // (For binning, we should not include zero by default because binning are calculated without zero.)
      if (!fieldDef.bin && contains([X, Y], channel)) {
          var orient = markDef.orient, type = markDef.type;
          if (contains(['bar', 'area', 'line', 'trail'], type)) {
              if ((orient === 'horizontal' && channel === 'y') ||
                  (orient === 'vertical' && channel === 'x')) {
                  return false;
              }
          }
          return true;
      }
      return false;
  }

  /**
   * Determine if there is a specified scale type and if it is appropriate,
   * or determine default type if type is unspecified or inappropriate.
   */
  // NOTE: CompassQL uses this method.
  function scaleType(specifiedType, channel, fieldDef, mark, scaleConfig) {
      var defaultScaleType = defaultType$1(channel, fieldDef, mark, scaleConfig);
      if (!isScaleChannel(channel)) {
          // There is no scale for these channels
          return null;
      }
      if (specifiedType !== undefined) {
          // Check if explicitly specified scale type is supported by the channel
          if (!channelSupportScaleType(channel, specifiedType)) {
              warn(message.scaleTypeNotWorkWithChannel(channel, specifiedType, defaultScaleType));
              return defaultScaleType;
          }
          // Check if explicitly specified scale type is supported by the data type
          if (!scaleTypeSupportDataType(specifiedType, fieldDef.type, fieldDef.bin)) {
              warn(message.scaleTypeNotWorkWithFieldDef(specifiedType, defaultScaleType));
              return defaultScaleType;
          }
          return specifiedType;
      }
      return defaultScaleType;
  }
  /**
   * Determine appropriate default scale type.
   */
  // NOTE: Voyager uses this method.
  function defaultType$1(channel, fieldDef, mark, scaleConfig) {
      switch (fieldDef.type) {
          case 'nominal':
          case 'ordinal':
              if (isColorChannel(channel) || rangeType(channel) === 'discrete') {
                  if (channel === 'shape' && fieldDef.type === 'ordinal') {
                      warn(message.discreteChannelCannotEncode(channel, 'ordinal'));
                  }
                  return 'ordinal';
              }
              if (contains(['x', 'y'], channel)) {
                  if (contains(['rect', 'bar', 'rule'], mark)) {
                      // The rect/bar mark should fit into a band.
                      // For rule, using band scale to make rule align with axis ticks better https://github.com/vega/vega-lite/issues/3429
                      return 'band';
                  }
                  if (mark === 'bar') {
                      return 'band';
                  }
              }
              // Otherwise, use ordinal point scale so we can easily get center positions of the marks.
              return 'point';
          case 'temporal':
              if (isColorChannel(channel)) {
                  return 'sequential';
              }
              else if (rangeType(channel) === 'discrete') {
                  warn(message.discreteChannelCannotEncode(channel, 'temporal'));
                  // TODO: consider using quantize (equivalent to binning) once we have it
                  return 'ordinal';
              }
              return 'time';
          case 'quantitative':
              if (isColorChannel(channel)) {
                  if (fieldDef.bin) {
                      return 'bin-ordinal';
                  }
                  // Use `sequential` as the default color scale for continuous data
                  // since it supports both array range and scheme range.
                  return 'sequential';
              }
              else if (rangeType(channel) === 'discrete') {
                  warn(message.discreteChannelCannotEncode(channel, 'quantitative'));
                  // TODO: consider using quantize (equivalent to binning) once we have it
                  return 'ordinal';
              }
              // x and y use a linear scale because selections don't work with bin scales.
              // Binned scales apply discretization but pan/zoom apply transformations to a [min, max] extent domain.
              if (fieldDef.bin && channel !== 'x' && channel !== 'y') {
                  return 'bin-linear';
              }
              return 'linear';
          case 'latitude':
          case 'longitude':
          case 'geojson':
              return undefined;
      }
      /* istanbul ignore next: should never reach this */
      throw new Error(message.invalidFieldType(fieldDef.type));
  }

  function parseScale(model) {
      parseScaleCore(model);
      parseScaleDomain(model);
      for (var _i = 0, NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES_1 = NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES; _i < NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES_1.length; _i++) {
          var prop = NON_TYPE_DOMAIN_RANGE_VEGA_SCALE_PROPERTIES_1[_i];
          parseScaleProperty(model, prop);
      }
      // range depends on zero
      parseScaleRange(model);
  }
  function parseScaleCore(model) {
      if (isUnitModel(model)) {
          model.component.scales = parseUnitScaleCore(model);
      }
      else {
          model.component.scales = parseNonUnitScaleCore(model);
      }
  }
  /**
   * Parse scales for all channels of a model.
   */
  function parseUnitScaleCore(model) {
      var encoding = model.encoding, config = model.config, mark = model.mark;
      return SCALE_CHANNELS.reduce(function (scaleComponents, channel) {
          var fieldDef;
          var specifiedScale = undefined;
          var channelDef = encoding[channel];
          // Don't generate scale for shape of geoshape
          if (isFieldDef(channelDef) && mark === GEOSHAPE &&
              channel === SHAPE && channelDef.type === GEOJSON) {
              return scaleComponents;
          }
          if (isFieldDef(channelDef)) {
              fieldDef = channelDef;
              specifiedScale = channelDef.scale;
          }
          else if (hasConditionalFieldDef(channelDef)) {
              fieldDef = channelDef.condition;
              specifiedScale = channelDef.condition['scale']; // We use ['scale'] since we know that channel here has scale for sure
          }
          else if (channel === X) {
              fieldDef = getFieldDef(encoding.x2);
          }
          else if (channel === Y) {
              fieldDef = getFieldDef(encoding.y2);
          }
          if (fieldDef && specifiedScale !== null && specifiedScale !== false) {
              specifiedScale = specifiedScale || {};
              var specifiedScaleType = specifiedScale.type;
              var sType = scaleType(specifiedScale.type, channel, fieldDef, mark, config.scale);
              scaleComponents[channel] = new ScaleComponent(model.scaleName(channel + '', true), { value: sType, explicit: specifiedScaleType === sType });
          }
          return scaleComponents;
      }, {});
  }
  var scaleTypeTieBreaker = tieBreakByComparing(function (st1, st2) { return (scaleTypePrecedence(st1) - scaleTypePrecedence(st2)); });
  function parseNonUnitScaleCore(model) {
      var scaleComponents = model.component.scales = {};
      var scaleTypeWithExplicitIndex = {};
      var resolve = model.component.resolve;
      var _loop_1 = function (child) {
          parseScaleCore(child);
          // Instead of always merging right away -- check if it is compatible to merge first!
          keys(child.component.scales).forEach(function (channel) {
              // if resolve is undefined, set default first
              resolve.scale[channel] = resolve.scale[channel] || defaultScaleResolve(channel, model);
              if (resolve.scale[channel] === 'shared') {
                  var explicitScaleType = scaleTypeWithExplicitIndex[channel];
                  var childScaleType = child.component.scales[channel].getWithExplicit('type');
                  if (explicitScaleType) {
                      if (scaleCompatible(explicitScaleType.value, childScaleType.value)) {
                          // merge scale component if type are compatible
                          scaleTypeWithExplicitIndex[channel] = mergeValuesWithExplicit(explicitScaleType, childScaleType, 'type', 'scale', scaleTypeTieBreaker);
                      }
                      else {
                          // Otherwise, update conflicting channel to be independent
                          resolve.scale[channel] = 'independent';
                          // Remove from the index so they don't get merged
                          delete scaleTypeWithExplicitIndex[channel];
                      }
                  }
                  else {
                      scaleTypeWithExplicitIndex[channel] = childScaleType;
                  }
              }
          });
      };
      // Parse each child scale and determine if a particular channel can be merged.
      for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
          var child = _a[_i];
          _loop_1(child);
      }
      // Merge each channel listed in the index
      keys(scaleTypeWithExplicitIndex).forEach(function (channel) {
          // Create new merged scale component
          var name = model.scaleName(channel, true);
          var typeWithExplicit = scaleTypeWithExplicitIndex[channel];
          scaleComponents[channel] = new ScaleComponent(name, typeWithExplicit);
          // rename each child and mark them as merged
          for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
              var child = _a[_i];
              var childScale = child.component.scales[channel];
              if (childScale) {
                  child.renameScale(childScale.get('name'), name);
                  childScale.merged = true;
              }
          }
      });
      return scaleComponents;
  }

  var NameMap = /** @class */ (function () {
      function NameMap() {
          this.nameMap = {};
      }
      NameMap.prototype.rename = function (oldName, newName) {
          this.nameMap[oldName] = newName;
      };
      NameMap.prototype.has = function (name) {
          return this.nameMap[name] !== undefined;
      };
      NameMap.prototype.get = function (name) {
          // If the name appears in the _nameMap, we need to read its new name.
          // We have to loop over the dict just in case the new name also gets renamed.
          while (this.nameMap[name] && name !== this.nameMap[name]) {
              name = this.nameMap[name];
          }
          return name;
      };
      return NameMap;
  }());
  /*
    We use type guards instead of `instanceof` as `instanceof` makes
    different parts of the compiler depend on the actual implementation of
    the model classes, which in turn depend on different parts of the compiler.
    Thus, `instanceof` leads to circular dependency problems.

    On the other hand, type guards only make different parts of the compiler
    depend on the type of the model classes, but not the actual implementation.
  */
  function isUnitModel(model) {
      return model && model.type === 'unit';
  }
  function isFacetModel(model) {
      return model && model.type === 'facet';
  }
  function isRepeatModel(model) {
      return model && model.type === 'repeat';
  }
  function isConcatModel(model) {
      return model && model.type === 'concat';
  }
  function isLayerModel(model) {
      return model && model.type === 'layer';
  }
  var Model = /** @class */ (function () {
      function Model(spec, parent, parentGivenName, config, repeater, resolve) {
          var _this = this;
          this.children = [];
          /**
           * Corrects the data references in marks after assemble.
           */
          this.correctDataNames = function (mark) {
              // TODO: make this correct
              // for normal data references
              if (mark.from && mark.from.data) {
                  mark.from.data = _this.lookupDataSource(mark.from.data);
              }
              // for access to facet data
              if (mark.from && mark.from.facet && mark.from.facet.data) {
                  mark.from.facet.data = _this.lookupDataSource(mark.from.facet.data);
              }
              return mark;
          };
          this.parent = parent;
          this.config = config;
          this.repeater = repeater;
          // If name is not provided, always use parent's givenName to avoid name conflicts.
          this.name = spec.name || parentGivenName;
          this.title = isString(spec.title) ? { text: spec.title } : spec.title;
          // Shared name maps
          this.scaleNameMap = parent ? parent.scaleNameMap : new NameMap();
          this.projectionNameMap = parent ? parent.projectionNameMap : new NameMap();
          this.layoutSizeNameMap = parent ? parent.layoutSizeNameMap : new NameMap();
          this.data = spec.data;
          this.description = spec.description;
          this.transforms = normalizeTransform(spec.transform || []);
          this.component = {
              data: {
                  sources: parent ? parent.component.data.sources : {},
                  outputNodes: parent ? parent.component.data.outputNodes : {},
                  outputNodeRefCounts: parent ? parent.component.data.outputNodeRefCounts : {},
                  // data is faceted if the spec is a facet spec or the parent has faceted data and no data is defined
                  isFaceted: isFacetSpec(spec) || (parent && parent.component.data.isFaceted && !spec.data)
              },
              layoutSize: new Split(),
              layoutHeaders: { row: {}, column: {} },
              mark: null,
              resolve: __assign({ scale: {}, axis: {}, legend: {} }, (resolve || {})),
              selection: null,
              scales: null,
              projection: null,
              axes: {},
              legends: {},
          };
      }
      Object.defineProperty(Model.prototype, "width", {
          get: function () {
              return this.getSizeSignalRef('width');
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Model.prototype, "height", {
          get: function () {
              return this.getSizeSignalRef('height');
          },
          enumerable: true,
          configurable: true
      });
      Model.prototype.initSize = function (size) {
          var width = size.width, height = size.height;
          if (width) {
              this.component.layoutSize.set('width', width, true);
          }
          if (height) {
              this.component.layoutSize.set('height', height, true);
          }
      };
      Model.prototype.parse = function () {
          this.parseScale();
          this.parseLayoutSize(); // depends on scale
          this.renameTopLevelLayoutSize();
          this.parseSelection();
          this.parseProjection();
          this.parseData(); // (pathorder) depends on markDef; selection filters depend on parsed selections; depends on projection because some transforms require the finalized projection name.
          this.parseAxisAndHeader(); // depends on scale and layout size
          this.parseLegend(); // depends on scale, markDef
          this.parseMarkGroup(); // depends on data name, scale, layout size, axisGroup, and children's scale, axis, legend and mark.
      };
      Model.prototype.parseScale = function () {
          parseScale(this);
      };
      Model.prototype.parseProjection = function () {
          parseProjection(this);
      };
      /**
       * Rename top-level spec's size to be just width / height, ignoring model name.
       * This essentially merges the top-level spec's width/height signals with the width/height signals
       * to help us reduce redundant signals declaration.
       */
      Model.prototype.renameTopLevelLayoutSize = function () {
          if (this.getName('width') !== 'width') {
              this.renameLayoutSize(this.getName('width'), 'width');
          }
          if (this.getName('height') !== 'height') {
              this.renameLayoutSize(this.getName('height'), 'height');
          }
      };
      Model.prototype.parseLegend = function () {
          parseLegend(this);
      };
      Model.prototype.assembleGroupStyle = function () {
          if (this.type === 'unit' || this.type === 'layer') {
              return 'cell';
          }
          return undefined;
      };
      Model.prototype.assembleLayoutSize = function () {
          if (this.type === 'unit' || this.type === 'layer') {
              return {
                  width: this.getSizeSignalRef('width'),
                  height: this.getSizeSignalRef('height')
              };
          }
          return undefined;
      };
      Model.prototype.assembleHeaderMarks = function () {
          var layoutHeaders = this.component.layoutHeaders;
          var headerMarks = [];
          for (var _i = 0, HEADER_CHANNELS_1 = HEADER_CHANNELS; _i < HEADER_CHANNELS_1.length; _i++) {
              var channel = HEADER_CHANNELS_1[_i];
              if (layoutHeaders[channel].title) {
                  headerMarks.push(getTitleGroup(this, channel));
              }
          }
          for (var _a = 0, HEADER_CHANNELS_2 = HEADER_CHANNELS; _a < HEADER_CHANNELS_2.length; _a++) {
              var channel = HEADER_CHANNELS_2[_a];
              headerMarks = headerMarks.concat(getHeaderGroups(this, channel));
          }
          return headerMarks;
      };
      Model.prototype.assembleAxes = function () {
          return assembleAxes(this.component.axes, this.config);
      };
      Model.prototype.assembleLegends = function () {
          return assembleLegends(this);
      };
      Model.prototype.assembleProjections = function () {
          return assembleProjections(this);
      };
      Model.prototype.assembleTitle = function () {
          var title$$1 = __assign({}, extractTitleConfig(this.config.title).nonMark, this.title);
          if (title$$1.text) {
              if (!contains(['unit', 'layer'], this.type)) {
                  // As described in https://github.com/vega/vega-lite/issues/2875:
                  // Due to vega/vega#960 (comment), we only support title's anchor for unit and layered spec for now.
                  if (title$$1.anchor && title$$1.anchor !== 'start') {
                      warn(message.cannotSetTitleAnchor(this.type));
                  }
                  title$$1.anchor = 'start';
              }
              return keys(title$$1).length > 0 ? title$$1 : undefined;
          }
          return undefined;
      };
      /**
       * Assemble the mark group for this model.  We accept optional `signals` so that we can include concat top-level signals with the top-level model's local signals.
       */
      Model.prototype.assembleGroup = function (signals) {
          if (signals === void 0) { signals = []; }
          var group = {};
          signals = signals.concat(this.assembleSelectionSignals());
          if (signals.length > 0) {
              group.signals = signals;
          }
          var layout = this.assembleLayout();
          if (layout) {
              group.layout = layout;
          }
          group.marks = [].concat(this.assembleHeaderMarks(), this.assembleMarks());
          // Only include scales if this spec is top-level or if parent is facet.
          // (Otherwise, it will be merged with upper-level's scope.)
          var scales = (!this.parent || isFacetModel(this.parent)) ? assembleScales(this) : [];
          if (scales.length > 0) {
              group.scales = scales;
          }
          var axes = this.assembleAxes();
          if (axes.length > 0) {
              group.axes = axes;
          }
          var legends = this.assembleLegends();
          if (legends.length > 0) {
              group.legends = legends;
          }
          return group;
      };
      Model.prototype.hasDescendantWithFieldOnChannel = function (channel) {
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              if (isUnitModel(child)) {
                  if (child.channelHasField(channel)) {
                      return true;
                  }
              }
              else {
                  if (child.hasDescendantWithFieldOnChannel(channel)) {
                      return true;
                  }
              }
          }
          return false;
      };
      Model.prototype.getName = function (text) {
          return varName((this.name ? this.name + '_' : '') + text);
      };
      /**
       * Request a data source name for the given data source type and mark that data source as required. This method should be called in parse, so that all used data source can be correctly instantiated in assembleData().
       */
      Model.prototype.requestDataName = function (name) {
          var fullName = this.getName(name);
          // Increase ref count. This is critical because otherwise we won't create a data source.
          // We also increase the ref counts on OutputNode.getSource() calls.
          var refCounts = this.component.data.outputNodeRefCounts;
          refCounts[fullName] = (refCounts[fullName] || 0) + 1;
          return fullName;
      };
      Model.prototype.getSizeSignalRef = function (sizeType) {
          if (isFacetModel(this.parent)) {
              var channel = sizeType === 'width' ? 'x' : 'y';
              var scaleComponent = this.component.scales[channel];
              if (scaleComponent && !scaleComponent.merged) { // independent scale
                  var type = scaleComponent.get('type');
                  var range = scaleComponent.get('range');
                  if (hasDiscreteDomain(type) && isVgRangeStep(range)) {
                      var scaleName = scaleComponent.get('name');
                      var domain = assembleDomain(this, channel);
                      var field$$1 = getFieldFromDomain(domain);
                      if (field$$1) {
                          var fieldRef = vgField({ aggregate: 'distinct', field: field$$1 }, { expr: 'datum' });
                          return {
                              signal: sizeExpr(scaleName, scaleComponent, fieldRef)
                          };
                      }
                      else {
                          warn('Unknown field for ${channel}.  Cannot calculate view size.');
                          return null;
                      }
                  }
              }
          }
          return {
              signal: this.layoutSizeNameMap.get(this.getName(sizeType))
          };
      };
      /**
       * Lookup the name of the datasource for an output node. You probably want to call this in assemble.
       */
      Model.prototype.lookupDataSource = function (name) {
          var node = this.component.data.outputNodes[name];
          if (!node) {
              // Name not found in map so let's just return what we got.
              // This can happen if we already have the correct name.
              return name;
          }
          return node.getSource();
      };
      Model.prototype.getSizeName = function (oldSizeName) {
          return this.layoutSizeNameMap.get(oldSizeName);
      };
      Model.prototype.renameLayoutSize = function (oldName, newName) {
          this.layoutSizeNameMap.rename(oldName, newName);
      };
      Model.prototype.renameScale = function (oldName, newName) {
          this.scaleNameMap.rename(oldName, newName);
      };
      Model.prototype.renameProjection = function (oldName, newName) {
          this.projectionNameMap.rename(oldName, newName);
      };
      /**
       * @return scale name for a given channel after the scale has been parsed and named.
       */
      Model.prototype.scaleName = function (originalScaleName, parse) {
          if (parse) {
              // During the parse phase always return a value
              // No need to refer to rename map because a scale can't be renamed
              // before it has the original name.
              return this.getName(originalScaleName);
          }
          // If there is a scale for the channel, it should either
          // be in the scale component or exist in the name map
          if (
          // If there is a scale for the channel, there should be a local scale component for it
          (isChannel(originalScaleName) && isScaleChannel(originalScaleName) && this.component.scales[originalScaleName]) ||
              // in the scale name map (the scale get merged by its parent)
              this.scaleNameMap.has(this.getName(originalScaleName))) {
              return this.scaleNameMap.get(this.getName(originalScaleName));
          }
          return undefined;
      };
      /**
       * @return projection name after the projection has been parsed and named.
       */
      Model.prototype.projectionName = function (parse) {
          if (parse) {
              // During the parse phase always return a value
              // No need to refer to rename map because a projection can't be renamed
              // before it has the original name.
              return this.getName('projection');
          }
          if ((this.component.projection && !this.component.projection.merged) || this.projectionNameMap.has(this.getName('projection'))) {
              return this.projectionNameMap.get(this.getName('projection'));
          }
          return undefined;
      };
      /**
       * Traverse a model's hierarchy to get the scale component for a particular channel.
       */
      Model.prototype.getScaleComponent = function (channel) {
          /* istanbul ignore next: This is warning for debugging test */
          if (!this.component.scales) {
              throw new Error('getScaleComponent cannot be called before parseScale().  Make sure you have called parseScale or use parseUnitModelWithScale().');
          }
          var localScaleComponent = this.component.scales[channel];
          if (localScaleComponent && !localScaleComponent.merged) {
              return localScaleComponent;
          }
          return (this.parent ? this.parent.getScaleComponent(channel) : undefined);
      };
      /**
       * Traverse a model's hierarchy to get a particular selection component.
       */
      Model.prototype.getSelectionComponent = function (variableName, origName) {
          var sel = this.component.selection[variableName];
          if (!sel && this.parent) {
              sel = this.parent.getSelectionComponent(variableName, origName);
          }
          if (!sel) {
              throw new Error(message.selectionNotFound(origName));
          }
          return sel;
      };
      return Model;
  }());
  /** Abstract class for UnitModel and FacetModel.  Both of which can contain fieldDefs as a part of its own specification. */
  var ModelWithField = /** @class */ (function (_super) {
      __extends(ModelWithField, _super);
      function ModelWithField() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      /** Get "field" reference for vega */
      ModelWithField.prototype.vgField = function (channel, opt) {
          if (opt === void 0) { opt = {}; }
          var fieldDef = this.fieldDef(channel);
          if (!fieldDef) {
              return undefined;
          }
          return vgField(fieldDef, opt);
      };
      ModelWithField.prototype.reduceFieldDef = function (f, init, t) {
          return reduce(this.getMapping(), function (acc, cd, c) {
              var fieldDef = getFieldDef(cd);
              if (fieldDef) {
                  return f(acc, fieldDef, c);
              }
              return acc;
          }, init, t);
      };
      ModelWithField.prototype.forEachFieldDef = function (f, t) {
          forEach(this.getMapping(), function (cd, c) {
              var fieldDef = getFieldDef(cd);
              if (fieldDef) {
                  f(fieldDef, c);
              }
          }, t);
      };
      return ModelWithField;
  }(Model));

  var scaleBindings = {
      has: function (selCmpt) {
          return selCmpt.type === 'interval' && selCmpt.resolve === 'global' &&
              selCmpt.bind && selCmpt.bind === 'scales';
      },
      parse: function (model, selDef, selCmpt) {
          var bound = selCmpt.scales = [];
          selCmpt.project.forEach(function (p) {
              var channel = p.channel;
              var scale = model.getScaleComponent(channel);
              var scaleType = scale ? scale.get('type') : undefined;
              if (!scale || !hasContinuousDomain(scaleType) || isBinScale(scaleType)) {
                  warn(message.SCALE_BINDINGS_CONTINUOUS);
                  return;
              }
              scale.set('domainRaw', { signal: channelSignalName(selCmpt, channel, 'data') }, true);
              bound.push(channel);
              // Bind both x/y for diag plot of repeated views.
              if (model.repeater && model.repeater.row === model.repeater.column) {
                  var scale2 = model.getScaleComponent(channel === X ? Y : X);
                  scale2.set('domainRaw', { signal: channelSignalName(selCmpt, channel, 'data') }, true);
              }
          });
      },
      topLevelSignals: function (model, selCmpt, signals) {
          // Top-level signals are only needed when coordinating composed views.
          if (!model.parent) {
              return signals;
          }
          var channels = selCmpt.scales.filter(function (channel) {
              return !(signals.filter(function (s) { return s.name === channelSignalName(selCmpt, channel, 'data'); }).length);
          });
          return signals.concat(channels.map(function (channel) {
              return { name: channelSignalName(selCmpt, channel, 'data') };
          }));
      },
      signals: function (model, selCmpt, signals) {
          // Nested signals need only push to top-level signals when within composed views.
          if (model.parent) {
              selCmpt.scales.forEach(function (channel) {
                  var signal = signals.filter(function (s) { return s.name === channelSignalName(selCmpt, channel, 'data'); })[0];
                  signal.push = 'outer';
                  delete signal.value;
                  delete signal.update;
              });
          }
          return signals;
      }
  };
  function domain$1(model, channel) {
      var scale = $(model.scaleName(channel));
      return "domain(" + scale + ")";
  }

  var BRUSH = '_brush';
  var SCALE_TRIGGER = '_scale_trigger';
  var interval = {
      predicate: 'vlInterval',
      scaleDomain: 'vlIntervalDomain',
      signals: function (model, selCmpt) {
          var name = selCmpt.name;
          var hasScales = scaleBindings.has(selCmpt);
          var signals = [];
          var intervals = [];
          var tupleTriggers = [];
          var scaleTriggers = [];
          if (selCmpt.translate && !hasScales) {
              var filterExpr_1 = "!event.item || event.item.mark.name !== " + $(name + BRUSH);
              events(selCmpt, function (_, evt) {
                  var filters = evt.between[0].filter || (evt.between[0].filter = []);
                  if (filters.indexOf(filterExpr_1) < 0) {
                      filters.push(filterExpr_1);
                  }
              });
          }
          selCmpt.project.forEach(function (p) {
              var channel = p.channel;
              if (channel !== X && channel !== Y) {
                  warn('Interval selections only support x and y encoding channels.');
                  return;
              }
              var cs = channelSignals(model, selCmpt, channel);
              var dname = channelSignalName(selCmpt, channel, 'data');
              var vname = channelSignalName(selCmpt, channel, 'visual');
              var scaleStr = $(model.scaleName(channel));
              var scaleType = model.getScaleComponent(channel).get('type');
              var toNum = hasContinuousDomain(scaleType) ? '+' : '';
              signals.push.apply(signals, cs);
              tupleTriggers.push(dname);
              intervals.push("{encoding: " + $(channel) + ", " +
                  ("field: " + $(p.field) + ", extent: " + dname + "}"));
              scaleTriggers.push({
                  scaleName: model.scaleName(channel),
                  expr: "(!isArray(" + dname + ") || " +
                      ("(" + toNum + "invert(" + scaleStr + ", " + vname + ")[0] === " + toNum + dname + "[0] && ") +
                      (toNum + "invert(" + scaleStr + ", " + vname + ")[1] === " + toNum + dname + "[1]))")
              });
          });
          // Proxy scale reactions to ensure that an infinite loop doesn't occur
          // when an interval selection filter touches the scale.
          if (!hasScales) {
              signals.push({
                  name: name + SCALE_TRIGGER,
                  update: scaleTriggers.map(function (t) { return t.expr; }).join(' && ') +
                      (" ? " + (name + SCALE_TRIGGER) + " : {}")
              });
          }
          // Only add an interval to the store if it has valid data extents. Data extents
          // are set to null if pixel extents are equal to account for intervals over
          // ordinal/nominal domains which, when inverted, will still produce a valid datum.
          return signals.concat({
              name: name + TUPLE,
              on: [{
                      events: tupleTriggers.map(function (t) { return ({ signal: t }); }),
                      update: tupleTriggers.join(' && ') +
                          (" ? {unit: " + unitName(model) + ", intervals: [" + intervals.join(', ') + "]} : null")
                  }]
          });
      },
      modifyExpr: function (model, selCmpt) {
          var tpl = selCmpt.name + TUPLE;
          return tpl + ', ' +
              (selCmpt.resolve === 'global' ? 'true' : "{unit: " + unitName(model) + "}");
      },
      marks: function (model, selCmpt, marks) {
          var name = selCmpt.name;
          var _a = positionalProjections(selCmpt), xi = _a.xi, yi = _a.yi;
          var store = "data(" + $(selCmpt.name + STORE) + ")";
          // Do not add a brush if we're binding to scales.
          if (scaleBindings.has(selCmpt)) {
              return marks;
          }
          var update = {
              x: xi !== null ? { signal: name + "_x[0]" } : { value: 0 },
              y: yi !== null ? { signal: name + "_y[0]" } : { value: 0 },
              x2: xi !== null ? { signal: name + "_x[1]" } : { field: { group: 'width' } },
              y2: yi !== null ? { signal: name + "_y[1]" } : { field: { group: 'height' } }
          };
          // If the selection is resolved to global, only a single interval is in
          // the store. Wrap brush mark's encodings with a production rule to test
          // this based on the `unit` property. Hide the brush mark if it corresponds
          // to a unit different from the one in the store.
          if (selCmpt.resolve === 'global') {
              for (var _i = 0, _b = keys(update); _i < _b.length; _i++) {
                  var key$$1 = _b[_i];
                  update[key$$1] = [__assign({ test: store + ".length && " + store + "[0].unit === " + unitName(model) }, update[key$$1]), { value: 0 }];
              }
          }
          // Two brush marks ensure that fill colors and other aesthetic choices do
          // not interefere with the core marks, but that the brushed region can still
          // be interacted with (e.g., dragging it around).
          var _c = selCmpt.mark, fill = _c.fill, fillOpacity = _c.fillOpacity, stroke = __rest(_c, ["fill", "fillOpacity"]);
          var vgStroke = keys(stroke).reduce(function (def, k) {
              def[k] = [{
                      test: [
                          xi !== null && name + "_x[0] !== " + name + "_x[1]",
                          yi != null && name + "_y[0] !== " + name + "_y[1]",
                      ].filter(function (x) { return x; }).join(' && '),
                      value: stroke[k]
                  }, { value: null }];
              return def;
          }, {});
          return [{
                  name: name + BRUSH + '_bg',
                  type: 'rect',
                  clip: true,
                  encode: {
                      enter: {
                          fill: { value: fill },
                          fillOpacity: { value: fillOpacity }
                      },
                      update: update
                  }
              }].concat(marks, {
              name: name + BRUSH,
              type: 'rect',
              clip: true,
              encode: {
                  enter: {
                      fill: { value: 'transparent' }
                  },
                  update: __assign({}, update, vgStroke)
              }
          });
      }
  };
  /**
   * Returns the visual and data signals for an interval selection.
   */
  function channelSignals(model, selCmpt, channel) {
      var vname = channelSignalName(selCmpt, channel, 'visual');
      var dname = channelSignalName(selCmpt, channel, 'data');
      var hasScales = scaleBindings.has(selCmpt);
      var scaleName = model.scaleName(channel);
      var scaleStr = $(scaleName);
      var scale = model.getScaleComponent(channel);
      var scaleType = scale ? scale.get('type') : undefined;
      var size = model.getSizeSignalRef(channel === X ? 'width' : 'height').signal;
      var coord = channel + "(unit)";
      var on = events(selCmpt, function (def, evt) {
          return def.concat({ events: evt.between[0], update: "[" + coord + ", " + coord + "]" }, // Brush Start
          { events: evt, update: "[" + vname + "[0], clamp(" + coord + ", 0, " + size + ")]" } // Brush End
          );
      });
      // React to pan/zooms of continuous scales. Non-continuous scales
      // (bin-linear, band, point) cannot be pan/zoomed and any other changes
      // to their domains (e.g., filtering) should clear the brushes.
      on.push({
          events: { signal: selCmpt.name + SCALE_TRIGGER },
          update: hasContinuousDomain(scaleType) && !isBinScale(scaleType) ?
              "[scale(" + scaleStr + ", " + dname + "[0]), scale(" + scaleStr + ", " + dname + "[1])]" : "[0, 0]"
      });
      return hasScales ? [{ name: dname, on: [] }] : [{
              name: vname, value: [], on: on
          }, {
              name: dname,
              on: [{ events: { signal: vname }, update: vname + "[0] === " + vname + "[1] ? null : invert(" + scaleStr + ", " + vname + ")" }]
          }];
  }
  function events(selCmpt, cb) {
      return selCmpt.events.reduce(function (on, evt) {
          if (!evt.between) {
              warn(evt + " is not an ordered event stream for interval selections");
              return on;
          }
          return cb(on, evt);
      }, []);
  }

  var VORONOI = 'voronoi';
  var nearest = {
      has: function (selCmpt) {
          return selCmpt.type !== 'interval' && selCmpt.nearest;
      },
      marks: function (model, selCmpt, marks) {
          var _a = positionalProjections(selCmpt), x = _a.x, y = _a.y;
          var markType = model.mark;
          if (isPathMark(markType)) {
              warn(message.nearestNotSupportForContinuous(markType));
              return marks;
          }
          var cellDef = {
              name: model.getName(VORONOI),
              type: 'path',
              from: { data: model.getName('marks') },
              encode: {
                  enter: {
                      fill: { value: 'transparent' },
                      strokeWidth: { value: 0.35 },
                      stroke: { value: 'transparent' },
                      isVoronoi: { value: true }
                  }
              },
              transform: [{
                      type: 'voronoi',
                      x: { expr: (x || (!x && !y)) ? 'datum.datum.x || 0' : '0' },
                      y: { expr: (y || (!x && !y)) ? 'datum.datum.y || 0' : '0' },
                      size: [model.getSizeSignalRef('width'), model.getSizeSignalRef('height')]
                  }]
          };
          var index = 0;
          var exists = false;
          marks.forEach(function (mark, i) {
              var name = mark.name || '';
              if (name === model.component.mark[0].name) {
                  index = i;
              }
              else if (name.indexOf(VORONOI) >= 0) {
                  exists = true;
              }
          });
          if (!exists) {
              marks.splice(index + 1, 0, cellDef);
          }
          return marks;
      }
  };

  function signals(model, selCmpt) {
      var proj = selCmpt.project;
      var datum = nearest.has(selCmpt) ?
          '(item().isVoronoi ? datum.datum : datum)' : 'datum';
      var bins = [];
      var encodings = proj.map(function (p) { return $(p.channel); }).filter(function (e) { return e; }).join(', ');
      var fields = proj.map(function (p) { return $(p.field); }).join(', ');
      var values = proj.map(function (p) {
          var channel = p.channel;
          var fieldDef = model.fieldDef(channel);
          // Binned fields should capture extents, for a range test against the raw field.
          return (fieldDef && fieldDef.bin) ? (bins.push(p.field),
              "[" + accessPathWithDatum(model.vgField(channel, {}), datum) + ", " +
                  (accessPathWithDatum(model.vgField(channel, { binSuffix: 'end' }), datum) + "]")) :
              "" + accessPathWithDatum(p.field, datum);
      }).join(', ');
      // Only add a discrete selection to the store if a datum is present _and_
      // the interaction isn't occurring on a group mark. This guards against
      // polluting interactive state with invalid values in faceted displays
      // as the group marks are also data-driven. We force the update to account
      // for constant null states but varying toggles (e.g., shift-click in
      // whitespace followed by a click in whitespace; the store should only
      // be cleared on the second click).
      return [{
              name: selCmpt.name + TUPLE,
              value: {},
              on: [{
                      events: selCmpt.events,
                      update: "datum && item().mark.marktype !== 'group' ? " +
                          ("{unit: " + unitName(model) + ", encodings: [" + encodings + "], ") +
                          ("fields: [" + fields + "], values: [" + values + "]") +
                          (bins.length ? ', ' + bins.map(function (b) { return $('bin_' + b) + ": 1"; }).join(', ') : '') +
                          '} : null',
                      force: true
                  }]
          }];
  }
  var multi = {
      predicate: 'vlMulti',
      scaleDomain: 'vlMultiDomain',
      signals: signals,
      modifyExpr: function (model, selCmpt) {
          var tpl = selCmpt.name + TUPLE;
          return tpl + ', ' +
              (selCmpt.resolve === 'global' ? 'null' : "{unit: " + unitName(model) + "}");
      }
  };

  var single = {
      predicate: 'vlSingle',
      scaleDomain: 'vlSingleDomain',
      signals: signals,
      topLevelSignals: function (model, selCmpt, signals$$1) {
          var hasSignal = signals$$1.filter(function (s) { return s.name === selCmpt.name; });
          var data = "data(" + $(selCmpt.name + STORE) + ")";
          var values = data + "[0].values";
          return hasSignal.length ? signals$$1 : signals$$1.concat({
              name: selCmpt.name,
              update: data + ".length && {" +
                  selCmpt.project.map(function (p, i) { return p.field + ": " + values + "[" + i + "]"; }).join(', ') + '}'
          });
      },
      modifyExpr: function (model, selCmpt) {
          var tpl = selCmpt.name + TUPLE;
          return tpl + ', ' +
              (selCmpt.resolve === 'global' ? 'true' : "{unit: " + unitName(model) + "}");
      }
  };

  var inputBindings = {
      has: function (selCmpt) {
          return selCmpt.type === 'single' && selCmpt.resolve === 'global' &&
              selCmpt.bind && selCmpt.bind !== 'scales';
      },
      topLevelSignals: function (model, selCmpt, signals) {
          var name = selCmpt.name;
          var proj = selCmpt.project;
          var bind = selCmpt.bind;
          var datum = nearest.has(selCmpt) ?
              '(item().isVoronoi ? datum.datum : datum)' : 'datum';
          proj.forEach(function (p) {
              var sgname = varName(name + "_" + p.field);
              var hasSignal = signals.filter(function (s) { return s.name === sgname; });
              if (!hasSignal.length) {
                  signals.unshift({
                      name: sgname,
                      value: '',
                      on: [{
                              events: selCmpt.events,
                              update: "datum && item().mark.marktype !== 'group' ? " + accessPathWithDatum(p.field, datum) + " : null"
                          }],
                      bind: bind[p.field] || bind[p.channel] || bind
                  });
              }
          });
          return signals;
      },
      signals: function (model, selCmpt, signals) {
          var name = selCmpt.name;
          var proj = selCmpt.project;
          var signal = signals.filter(function (s) { return s.name === name + TUPLE; })[0];
          var fields = proj.map(function (p) { return $(p.field); }).join(', ');
          var values = proj.map(function (p) { return varName(name + "_" + p.field); });
          if (values.length) {
              signal.update = values.join(' && ') + " ? {fields: [" + fields + "], values: [" + values.join(', ') + "]} : null";
          }
          delete signal.value;
          delete signal.on;
          return signals;
      }
  };

  var project = {
      has: function (selDef) {
          var def = selDef;
          return def.fields !== undefined || def.encodings !== undefined;
      },
      parse: function (model, selDef, selCmpt) {
          var channels = {};
          var timeUnits = {};
          // TODO: find a possible channel mapping for these fields.
          (selDef.fields || []).forEach(function (field) { return channels[field] = null; });
          (selDef.encodings || []).forEach(function (channel) {
              var fieldDef = model.fieldDef(channel);
              if (fieldDef) {
                  if (fieldDef.timeUnit) {
                      var tuField = model.vgField(channel);
                      channels[tuField] = channel;
                      // Construct TimeUnitComponents which will be combined into a
                      // TimeUnitNode. This node may need to be inserted into the
                      // dataflow if the selection is used across views that do not
                      // have these time units defined.
                      timeUnits[tuField] = {
                          as: tuField,
                          field: fieldDef.field,
                          timeUnit: fieldDef.timeUnit
                      };
                  }
                  else {
                      channels[fieldDef.field] = channel;
                  }
              }
              else {
                  warn(message.cannotProjectOnChannelWithoutField(channel));
              }
          });
          var projection = selCmpt.project || (selCmpt.project = []);
          for (var field in channels) {
              if (channels.hasOwnProperty(field)) {
                  projection.push({ field: field, channel: channels[field] });
              }
          }
          var fields = selCmpt.fields || (selCmpt.fields = {});
          projection.filter(function (p) { return p.channel; }).forEach(function (p) { return fields[p.channel] = p.field; });
          if (keys(timeUnits).length) {
              selCmpt.timeUnit = new TimeUnitNode(null, timeUnits);
          }
      }
  };

  var TOGGLE = '_toggle';
  var toggle = {
      has: function (selCmpt) {
          return selCmpt.type === 'multi' && selCmpt.toggle;
      },
      signals: function (model, selCmpt, signals) {
          return signals.concat({
              name: selCmpt.name + TOGGLE,
              value: false,
              on: [{ events: selCmpt.events, update: selCmpt.toggle }]
          });
      },
      modifyExpr: function (model, selCmpt, expr) {
          var tpl = selCmpt.name + TUPLE;
          var signal = selCmpt.name + TOGGLE;
          return signal + " ? null : " + tpl + ", " +
              (selCmpt.resolve === 'global' ?
                  signal + " ? null : true, " :
                  signal + " ? null : {unit: " + unitName(model) + "}, ") +
              (signal + " ? " + tpl + " : null");
      }
  };

  var ANCHOR = '_translate_anchor';
  var DELTA = '_translate_delta';
  var translate = {
      has: function (selCmpt) {
          return selCmpt.type === 'interval' && selCmpt.translate;
      },
      signals: function (model, selCmpt, signals) {
          var name = selCmpt.name;
          var hasScales = scaleBindings.has(selCmpt);
          var anchor = name + ANCHOR;
          var _a = positionalProjections(selCmpt), x = _a.x, y = _a.y;
          var events = parseSelector(selCmpt.translate, 'scope');
          if (!hasScales) {
              events = events.map(function (e) { return (e.between[0].markname = name + BRUSH, e); });
          }
          signals.push({
              name: anchor,
              value: {},
              on: [{
                      events: events.map(function (e) { return e.between[0]; }),
                      update: '{x: x(unit), y: y(unit)' +
                          (x !== null ? ', extent_x: ' + (hasScales ? domain$1(model, X) :
                              "slice(" + channelSignalName(selCmpt, 'x', 'visual') + ")") : '') +
                          (y !== null ? ', extent_y: ' + (hasScales ? domain$1(model, Y) :
                              "slice(" + channelSignalName(selCmpt, 'y', 'visual') + ")") : '') + '}'
                  }]
          }, {
              name: name + DELTA,
              value: {},
              on: [{
                      events: events,
                      update: "{x: " + anchor + ".x - x(unit), y: " + anchor + ".y - y(unit)}"
                  }]
          });
          if (x !== null) {
              onDelta(model, selCmpt, X, 'width', signals);
          }
          if (y !== null) {
              onDelta(model, selCmpt, Y, 'height', signals);
          }
          return signals;
      }
  };
  function onDelta(model, selCmpt, channel, size, signals) {
      var name = selCmpt.name;
      var hasScales = scaleBindings.has(selCmpt);
      var signal = signals.filter(function (s) {
          return s.name === channelSignalName(selCmpt, channel, hasScales ? 'data' : 'visual');
      })[0];
      var anchor = name + ANCHOR;
      var delta = name + DELTA;
      var sizeSg = model.getSizeSignalRef(size).signal;
      var scaleCmpt = model.getScaleComponent(channel);
      var scaleType = scaleCmpt.get('type');
      var sign = hasScales && channel === X ? '-' : ''; // Invert delta when panning x-scales.
      var extent = anchor + ".extent_" + channel;
      var offset = "" + sign + delta + "." + channel + " / " + (hasScales ? "" + sizeSg : "span(" + extent + ")");
      var panFn = !hasScales ? 'panLinear' :
          scaleType === 'log' ? 'panLog' :
              scaleType === 'pow' ? 'panPow' : 'panLinear';
      var update = panFn + "(" + extent + ", " + offset +
          (hasScales && scaleType === 'pow' ? ", " + (scaleCmpt.get('exponent') || 1) : '') + ')';
      signal.on.push({
          events: { signal: delta },
          update: hasScales ? update : "clampRange(" + update + ", 0, " + sizeSg + ")"
      });
  }

  var ANCHOR$1 = '_zoom_anchor';
  var DELTA$1 = '_zoom_delta';
  var zoom$1 = {
      has: function (selCmpt) {
          return selCmpt.type === 'interval' && selCmpt.zoom;
      },
      signals: function (model, selCmpt, signals) {
          var name = selCmpt.name;
          var hasScales = scaleBindings.has(selCmpt);
          var delta = name + DELTA$1;
          var _a = positionalProjections(selCmpt), x = _a.x, y = _a.y;
          var sx = $(model.scaleName(X));
          var sy = $(model.scaleName(Y));
          var events = parseSelector(selCmpt.zoom, 'scope');
          if (!hasScales) {
              events = events.map(function (e) { return (e.markname = name + BRUSH, e); });
          }
          signals.push({
              name: name + ANCHOR$1,
              on: [{
                      events: events,
                      update: !hasScales ? "{x: x(unit), y: y(unit)}" :
                          '{' + [
                              (sx ? "x: invert(" + sx + ", x(unit))" : ''),
                              (sy ? "y: invert(" + sy + ", y(unit))" : '')
                          ].filter(function (expr) { return !!expr; }).join(', ') + '}'
                  }]
          }, {
              name: delta,
              on: [{
                      events: events,
                      force: true,
                      update: 'pow(1.001, event.deltaY * pow(16, event.deltaMode))'
                  }]
          });
          if (x !== null) {
              onDelta$1(model, selCmpt, 'x', 'width', signals);
          }
          if (y !== null) {
              onDelta$1(model, selCmpt, 'y', 'height', signals);
          }
          return signals;
      }
  };
  function onDelta$1(model, selCmpt, channel, size, signals) {
      var name = selCmpt.name;
      var hasScales = scaleBindings.has(selCmpt);
      var signal = signals.filter(function (s) {
          return s.name === channelSignalName(selCmpt, channel, hasScales ? 'data' : 'visual');
      })[0];
      var sizeSg = model.getSizeSignalRef(size).signal;
      var scaleCmpt = model.getScaleComponent(channel);
      var scaleType = scaleCmpt.get('type');
      var base = hasScales ? domain$1(model, channel) : signal.name;
      var delta = name + DELTA$1;
      var anchor = "" + name + ANCHOR$1 + "." + channel;
      var zoomFn = !hasScales ? 'zoomLinear' :
          scaleType === 'log' ? 'zoomLog' :
              scaleType === 'pow' ? 'zoomPow' : 'zoomLinear';
      var update = zoomFn + "(" + base + ", " + anchor + ", " + delta +
          (hasScales && scaleType === 'pow' ? ", " + (scaleCmpt.get('exponent') || 1) : '') + ')';
      signal.on.push({
          events: { signal: delta },
          update: hasScales ? update : "clampRange(" + update + ", 0, " + sizeSg + ")"
      });
  }

  var compilers = { project: project, toggle: toggle, scales: scaleBindings,
      translate: translate, zoom: zoom$1, inputs: inputBindings, nearest: nearest };
  function forEachTransform(selCmpt, cb) {
      for (var t in compilers) {
          if (compilers[t].has(selCmpt)) {
              cb(compilers[t]);
          }
      }
  }

  var STORE = '_store';
  var TUPLE = '_tuple';
  var MODIFY = '_modify';
  var SELECTION_DOMAIN = '_selection_domain_';
  function parseUnitSelection(model, selDefs) {
      var selCmpts = {};
      var selectionConfig = model.config.selection;
      var _loop_1 = function (name_1) {
          if (!selDefs.hasOwnProperty(name_1)) {
              return "continue";
          }
          var selDef = selDefs[name_1];
          var cfg = selectionConfig[selDef.type];
          // Set default values from config if a property hasn't been specified,
          // or if it is true. E.g., "translate": true should use the default
          // event handlers for translate. However, true may be a valid value for
          // a property (e.g., "nearest": true).
          for (var key$$1 in cfg) {
              // A selection should contain either `encodings` or `fields`, only use
              // default values for these two values if neither of them is specified.
              if ((key$$1 === 'encodings' && selDef.fields) || (key$$1 === 'fields' && selDef.encodings)) {
                  continue;
              }
              if (key$$1 === 'mark') {
                  selDef[key$$1] = __assign({}, cfg[key$$1], selDef[key$$1]);
              }
              if (selDef[key$$1] === undefined || selDef[key$$1] === true) {
                  selDef[key$$1] = cfg[key$$1] || selDef[key$$1];
              }
          }
          name_1 = varName(name_1);
          var selCmpt = selCmpts[name_1] = __assign({}, selDef, { name: name_1, events: isString(selDef.on) ? parseSelector(selDef.on, 'scope') : selDef.on });
          forEachTransform(selCmpt, function (txCompiler) {
              if (txCompiler.parse) {
                  txCompiler.parse(model, selDef, selCmpt);
              }
          });
      };
      for (var name_1 in selDefs) {
          _loop_1(name_1);
      }
      return selCmpts;
  }
  function assembleUnitSelectionSignals(model, signals$$1) {
      forEachSelection(model, function (selCmpt, selCompiler) {
          var name = selCmpt.name;
          var modifyExpr = selCompiler.modifyExpr(model, selCmpt);
          signals$$1.push.apply(signals$$1, selCompiler.signals(model, selCmpt));
          forEachTransform(selCmpt, function (txCompiler) {
              if (txCompiler.signals) {
                  signals$$1 = txCompiler.signals(model, selCmpt, signals$$1);
              }
              if (txCompiler.modifyExpr) {
                  modifyExpr = txCompiler.modifyExpr(model, selCmpt, modifyExpr);
              }
          });
          signals$$1.push({
              name: name + MODIFY,
              on: [{
                      events: { signal: name + TUPLE },
                      update: "modify(" + $(selCmpt.name + STORE) + ", " + modifyExpr + ")"
                  }]
          });
      });
      var facetModel = getFacetModel(model);
      if (signals$$1.length && facetModel) {
          var name_2 = $(facetModel.getName('cell'));
          signals$$1.unshift({
              name: 'facet',
              value: {},
              on: [{
                      events: parseSelector('mousemove', 'scope'),
                      update: "isTuple(facet) ? facet : group(" + name_2 + ").datum"
                  }]
          });
      }
      return signals$$1;
  }
  function assembleTopLevelSignals(model, signals$$1) {
      var needsUnit = false;
      forEachSelection(model, function (selCmpt, selCompiler) {
          if (selCompiler.topLevelSignals) {
              signals$$1 = selCompiler.topLevelSignals(model, selCmpt, signals$$1);
          }
          forEachTransform(selCmpt, function (txCompiler) {
              if (txCompiler.topLevelSignals) {
                  signals$$1 = txCompiler.topLevelSignals(model, selCmpt, signals$$1);
              }
          });
          needsUnit = true;
      });
      if (needsUnit) {
          var hasUnit = signals$$1.filter(function (s) { return s.name === 'unit'; });
          if (!(hasUnit.length)) {
              signals$$1.unshift({
                  name: 'unit',
                  value: {},
                  on: [{ events: 'mousemove', update: 'isTuple(group()) ? group() : unit' }]
              });
          }
      }
      return signals$$1;
  }
  function assembleUnitSelectionData(model, data) {
      forEachSelection(model, function (selCmpt) {
          var contains$$1 = data.filter(function (d) { return d.name === selCmpt.name + STORE; });
          if (!contains$$1.length) {
              data.push({ name: selCmpt.name + STORE });
          }
      });
      return data;
  }
  function assembleUnitSelectionMarks(model, marks) {
      forEachSelection(model, function (selCmpt, selCompiler) {
          marks = selCompiler.marks ? selCompiler.marks(model, selCmpt, marks) : marks;
          forEachTransform(selCmpt, function (txCompiler) {
              if (txCompiler.marks) {
                  marks = txCompiler.marks(model, selCmpt, marks);
              }
          });
      });
      return marks;
  }
  function assembleLayerSelectionMarks(model, marks) {
      model.children.forEach(function (child) {
          if (isUnitModel(child)) {
              marks = assembleUnitSelectionMarks(child, marks);
          }
      });
      return marks;
  }
  function selectionPredicate(model, selections, dfnode) {
      var stores = [];
      function expr(name) {
          var vname = varName(name);
          var selCmpt = model.getSelectionComponent(vname, name);
          var store = $(vname + STORE);
          if (selCmpt.timeUnit) {
              var child = dfnode || model.component.data.raw;
              var tunode = selCmpt.timeUnit.clone();
              if (child.parent) {
                  tunode.insertAsParentOf(child);
              }
              else {
                  child.parent = tunode;
              }
          }
          if (selCmpt.empty !== 'none') {
              stores.push(store);
          }
          return compiler(selCmpt.type).predicate + ("(" + store + ", datum") +
              (selCmpt.resolve === 'global' ? ')' : ", " + $(selCmpt.resolve) + ")");
      }
      var predicateStr = logicalExpr(selections, expr);
      return (stores.length
          ? '!(' + stores.map(function (s) { return "length(data(" + s + "))"; }).join(' || ') + ') || '
          : '') + ("(" + predicateStr + ")");
  }
  // Selections are parsed _after_ scales. If a scale domain is set to
  // use a selection, the SELECTION_DOMAIN constant is used as the
  // domainRaw.signal during scale.parse and then replaced with the necessary
  // selection expression function during scale.assemble. To not pollute the
  // type signatures to account for this setup, the selection domain definition
  // is coerced to a string and appended to SELECTION_DOMAIN.
  function isRawSelectionDomain(domainRaw) {
      return domainRaw.signal.indexOf(SELECTION_DOMAIN) >= 0;
  }
  function selectionScaleDomain(model, domainRaw) {
      var selDomain = JSON.parse(domainRaw.signal.replace(SELECTION_DOMAIN, ''));
      var name = varName(selDomain.selection);
      var selCmpt = model.component.selection && model.component.selection[name];
      if (selCmpt) {
          warn('Use "bind": "scales" to setup a binding for scales and selections within the same view.');
      }
      else {
          selCmpt = model.getSelectionComponent(name, selDomain.selection);
          if (!selDomain.encoding && !selDomain.field) {
              selDomain.field = selCmpt.project[0].field;
              if (selCmpt.project.length > 1) {
                  warn('A "field" or "encoding" must be specified when using a selection as a scale domain. ' +
                      ("Using \"field\": " + $(selDomain.field) + "."));
              }
          }
          return {
              signal: compiler(selCmpt.type).scaleDomain +
                  ("(" + $(name + STORE) + ", " + $(selDomain.encoding || null) + ", ") +
                  $(selDomain.field || null) +
                  (selCmpt.resolve === 'global' ? ')' : ", " + $(selCmpt.resolve) + ")")
          };
      }
      return { signal: 'null' };
  }
  // Utility functions
  function forEachSelection(model, cb) {
      var selections = model.component.selection;
      for (var name_3 in selections) {
          if (selections.hasOwnProperty(name_3)) {
              var sel = selections[name_3];
              cb(sel, compiler(sel.type));
          }
      }
  }
  function compiler(type) {
      switch (type) {
          case 'single':
              return single;
          case 'multi':
              return multi;
          case 'interval':
              return interval;
      }
      return null;
  }
  function getFacetModel(model) {
      var parent = model.parent;
      while (parent) {
          if (isFacetModel(parent)) {
              break;
          }
          parent = parent.parent;
      }
      return parent;
  }
  function unitName(model) {
      var name = $(model.name);
      var facet = getFacetModel(model);
      if (facet) {
          name += (facet.facet.row ? " + '_' + (" + accessPathWithDatum(facet.vgField('row'), 'facet') + ")" : '')
              + (facet.facet.column ? " + '_' + (" + accessPathWithDatum(facet.vgField('column'), 'facet') + ")" : '');
      }
      return name;
  }
  function requiresSelectionId(model) {
      var identifier = false;
      forEachSelection(model, function (selCmpt) {
          identifier = identifier || selCmpt.project.some(function (proj) { return proj.field === SELECTION_ID; });
      });
      return identifier;
  }
  function channelSignalName(selCmpt, channel, range) {
      var sgNames = selCmpt._signalNames || (selCmpt._signalNames = {});
      if (sgNames[channel] && sgNames[channel][range]) {
          return sgNames[channel][range];
      }
      sgNames[channel] = sgNames[channel] || {};
      var basename = varName(selCmpt.name + '_' + (range === 'visual' ? channel : selCmpt.fields[channel]));
      var name = basename;
      var counter = 1;
      while (sgNames[name]) {
          name = basename + "_" + counter++;
      }
      return (sgNames[name] = sgNames[channel][range] = name);
  }
  function positionalProjections(selCmpt) {
      var x = null;
      var xi = null;
      var y = null;
      var yi = null;
      selCmpt.project.forEach(function (p, i) {
          if (p.channel === X) {
              x = p;
              xi = i;
          }
          else if (p.channel === Y) {
              y = p;
              yi = i;
          }
      });
      return { x: x, xi: xi, y: y, yi: yi };
  }

  function isSelectionPredicate(predicate) {
      return predicate && predicate['selection'];
  }
  function isFieldEqualPredicate(predicate) {
      return predicate && !!predicate.field && predicate.equal !== undefined;
  }
  function isFieldLTPredicate(predicate) {
      return predicate && !!predicate.field && predicate.lt !== undefined;
  }
  function isFieldLTEPredicate(predicate) {
      return predicate && !!predicate.field && predicate.lte !== undefined;
  }
  function isFieldGTPredicate(predicate) {
      return predicate && !!predicate.field && predicate.gt !== undefined;
  }
  function isFieldGTEPredicate(predicate) {
      return predicate && !!predicate.field && predicate.gte !== undefined;
  }
  function isFieldRangePredicate(predicate) {
      if (predicate && predicate.field) {
          if (isArray(predicate.range) && predicate.range.length === 2) {
              return true;
          }
      }
      return false;
  }
  function isFieldOneOfPredicate(predicate) {
      return predicate && !!predicate.field && (isArray(predicate.oneOf) ||
          isArray(predicate.in) // backward compatibility
      );
  }
  function isFieldPredicate(predicate) {
      return isFieldOneOfPredicate(predicate) || isFieldEqualPredicate(predicate) || isFieldRangePredicate(predicate) || isFieldLTPredicate(predicate) || isFieldGTPredicate(predicate) || isFieldLTEPredicate(predicate) || isFieldGTEPredicate(predicate);
  }
  /**
   * Converts a predicate into an expression.
   */
  // model is only used for selection filters.
  function expression(model, filterOp, node) {
      return logicalExpr(filterOp, function (predicate) {
          if (isString(predicate)) {
              return predicate;
          }
          else if (isSelectionPredicate(predicate)) {
              return selectionPredicate(model, predicate.selection, node);
          }
          else { // Filter Object
              return fieldFilterExpression(predicate);
          }
      });
  }
  // This method is used by Voyager.  Do not change its behavior without changing Voyager.
  function fieldFilterExpression(predicate, useInRange) {
      if (useInRange === void 0) { useInRange = true; }
      var fieldExpr$$1 = predicate.timeUnit ?
          // For timeUnit, cast into integer with time() so we can use ===, inrange, indexOf to compare values directly.
          // TODO: We calculate timeUnit on the fly here. Consider if we would like to consolidate this with timeUnit pipeline
          // TODO: support utc
          ('time(' + fieldExpr(predicate.timeUnit, predicate.field) + ')') :
          vgField(predicate, { expr: 'datum' });
      if (isFieldEqualPredicate(predicate)) {
          return fieldExpr$$1 + '===' + valueExpr(predicate.equal, predicate.timeUnit);
      }
      else if (isFieldLTPredicate(predicate)) {
          var upper = predicate.lt;
          return fieldExpr$$1 + "<" + valueExpr(upper, predicate.timeUnit);
      }
      else if (isFieldGTPredicate(predicate)) {
          var lower = predicate.gt;
          return fieldExpr$$1 + ">" + valueExpr(lower, predicate.timeUnit);
      }
      else if (isFieldLTEPredicate(predicate)) {
          var upper = predicate.lte;
          return fieldExpr$$1 + "<=" + valueExpr(upper, predicate.timeUnit);
      }
      else if (isFieldGTEPredicate(predicate)) {
          var lower = predicate.gte;
          return fieldExpr$$1 + ">=" + valueExpr(lower, predicate.timeUnit);
      }
      else if (isFieldOneOfPredicate(predicate)) {
          // "oneOf" was formerly "in" -- so we need to add backward compatibility
          var oneOf = predicate.oneOf || predicate['in'];
          return 'indexof([' +
              oneOf.map(function (v) { return valueExpr(v, predicate.timeUnit); }).join(',') +
              '], ' + fieldExpr$$1 + ') !== -1';
      }
      else if (isFieldRangePredicate(predicate)) {
          var lower = predicate.range[0];
          var upper = predicate.range[1];
          if (lower !== null && upper !== null && useInRange) {
              return 'inrange(' + fieldExpr$$1 + ', [' +
                  valueExpr(lower, predicate.timeUnit) + ', ' +
                  valueExpr(upper, predicate.timeUnit) + '])';
          }
          var exprs = [];
          if (lower !== null) {
              exprs.push(fieldExpr$$1 + " >= " + valueExpr(lower, predicate.timeUnit));
          }
          if (upper !== null) {
              exprs.push(fieldExpr$$1 + " <= " + valueExpr(upper, predicate.timeUnit));
          }
          return exprs.length > 0 ? exprs.join(' && ') : 'true';
      }
      /* istanbul ignore next: it should never reach here */
      throw new Error("Invalid field predicate: " + JSON.stringify(predicate));
  }
  function valueExpr(v, timeUnit) {
      if (isDateTime(v)) {
          var expr = dateTimeExpr(v, true);
          return 'time(' + expr + ')';
      }
      if (isLocalSingleTimeUnit(timeUnit)) {
          var datetime = {};
          datetime[timeUnit] = v;
          var expr = dateTimeExpr(datetime, true);
          return 'time(' + expr + ')';
      }
      else if (isUtcSingleTimeUnit(timeUnit)) {
          return valueExpr(v, getLocalTimeUnit(timeUnit));
      }
      return JSON.stringify(v);
  }
  function normalizePredicate(f) {
      if (isFieldPredicate(f) && f.timeUnit) {
          return __assign({}, f, { timeUnit: normalizeTimeUnit(f.timeUnit) });
      }
      return f;
  }

  function isFilter(t) {
      return t['filter'] !== undefined;
  }
  function isLookup(t) {
      return t['lookup'] !== undefined;
  }
  function isWindow(t) {
      return t['window'] !== undefined;
  }
  function isCalculate(t) {
      return t['calculate'] !== undefined;
  }
  function isBin(t) {
      return !!t['bin'];
  }
  function isTimeUnit$1(t) {
      return t['timeUnit'] !== undefined;
  }
  function isAggregate$1(t) {
      return t['aggregate'] !== undefined;
  }
  function isStack(t) {
      return t['stack'] !== undefined;
  }
  function normalizeTransform(transform) {
      return transform.map(function (t) {
          if (isFilter(t)) {
              return {
                  filter: normalizeLogicalOperand(t.filter, normalizePredicate)
              };
          }
          return t;
      });
  }

  var transform = /*#__PURE__*/Object.freeze({
    isFilter: isFilter,
    isLookup: isLookup,
    isWindow: isWindow,
    isCalculate: isCalculate,
    isBin: isBin,
    isTimeUnit: isTimeUnit$1,
    isAggregate: isAggregate$1,
    isStack: isStack,
    normalizeTransform: normalizeTransform
  });

  function rangeFormula(model, fieldDef, channel, config) {
      if (binRequiresRange(fieldDef, channel)) {
          // read format from axis or legend, if there is no format then use config.numberFormat
          var guide = isUnitModel(model) ? (model.axis(channel) || model.legend(channel) || {}) : {};
          var startField = vgField(fieldDef, { expr: 'datum', });
          var endField = vgField(fieldDef, { expr: 'datum', binSuffix: 'end' });
          return {
              formulaAs: vgField(fieldDef, { binSuffix: 'range' }),
              formula: binFormatExpression(startField, endField, guide.format, config)
          };
      }
      return {};
  }
  function binKey(bin, field) {
      return binToString(bin) + "_" + field;
  }
  function getSignalsFromModel(model, key) {
      return {
          signal: model.getName(key + "_bins"),
          extentSignal: model.getName(key + "_extent")
      };
  }
  function isBinTransform(t) {
      return 'as' in t;
  }
  function createBinComponent(t, model) {
      var as;
      if (isBinTransform(t)) {
          as = [t.as, t.as + "_end"];
      }
      else {
          as = [vgField(t, {}), vgField(t, { binSuffix: 'end' })];
      }
      var bin = normalizeBin(t.bin, undefined) || {};
      var key = binKey(bin, t.field);
      var _a = getSignalsFromModel(model, key), signal = _a.signal, extentSignal = _a.extentSignal;
      var binComponent = __assign({ bin: bin, field: t.field, as: as }, signal ? { signal: signal } : {}, extentSignal ? { extentSignal: extentSignal } : {});
      return { key: key, binComponent: binComponent };
  }
  var BinNode = /** @class */ (function (_super) {
      __extends(BinNode, _super);
      function BinNode(parent, bins) {
          var _this = _super.call(this, parent) || this;
          _this.bins = bins;
          return _this;
      }
      BinNode.prototype.clone = function () {
          return new BinNode(null, duplicate(this.bins));
      };
      BinNode.makeFromEncoding = function (parent, model) {
          var bins = model.reduceFieldDef(function (binComponentIndex, fieldDef, channel) {
              if (fieldDef.bin) {
                  var _a = createBinComponent(fieldDef, model), key = _a.key, binComponent = _a.binComponent;
                  binComponentIndex[key] = __assign({}, binComponent, binComponentIndex[key], rangeFormula(model, fieldDef, channel, model.config));
              }
              return binComponentIndex;
          }, {});
          if (keys(bins).length === 0) {
              return null;
          }
          return new BinNode(parent, bins);
      };
      /**
       * Creates a bin node from BinTransform.
       * The optional parameter should provide
       */
      BinNode.makeFromTransform = function (parent, t, model) {
          var _a = createBinComponent(t, model), key = _a.key, binComponent = _a.binComponent;
          return new BinNode(parent, (_b = {},
              _b[key] = binComponent,
              _b));
          var _b;
      };
      BinNode.prototype.merge = function (other) {
          this.bins = __assign({}, this.bins, other.bins);
          other.remove();
      };
      BinNode.prototype.producedFields = function () {
          var out = {};
          vals(this.bins).forEach(function (c) {
              c.as.forEach(function (f) { return out[f] = true; });
          });
          return out;
      };
      BinNode.prototype.dependentFields = function () {
          var out = {};
          vals(this.bins).forEach(function (c) {
              out[c.field] = true;
          });
          return out;
      };
      BinNode.prototype.assemble = function () {
          return flatten(vals(this.bins).map(function (bin) {
              var transform = [];
              var binTrans = __assign({ type: 'bin', field: bin.field, as: bin.as, signal: bin.signal }, bin.bin);
              if (!bin.bin.extent && bin.extentSignal) {
                  transform.push({
                      type: 'extent',
                      field: bin.field,
                      signal: bin.extentSignal
                  });
                  binTrans.extent = { signal: bin.extentSignal };
              }
              transform.push(binTrans);
              if (bin.formula) {
                  transform.push({
                      type: 'formula',
                      expr: bin.formula,
                      as: bin.formulaAs
                  });
              }
              return transform;
          }));
      };
      return BinNode;
  }(DataFlowNode));

  var FilterNode = /** @class */ (function (_super) {
      __extends(FilterNode, _super);
      function FilterNode(parent, model, filter) {
          var _this = _super.call(this, parent) || this;
          _this.model = model;
          _this.filter = filter;
          _this.expr = expression(_this.model, _this.filter, _this);
          return _this;
      }
      FilterNode.prototype.clone = function () {
          return new FilterNode(null, this.model, duplicate(this.filter));
      };
      FilterNode.prototype.assemble = function () {
          return {
              type: 'filter',
              expr: this.expr
          };
      };
      return FilterNode;
  }(DataFlowNode));

  var GeoJSONNode = /** @class */ (function (_super) {
      __extends(GeoJSONNode, _super);
      function GeoJSONNode(parent, fields, geojson, signal) {
          var _this = _super.call(this, parent) || this;
          _this.fields = fields;
          _this.geojson = geojson;
          _this.signal = signal;
          return _this;
      }
      GeoJSONNode.prototype.clone = function () {
          return new GeoJSONNode(null, duplicate(this.fields), this.geojson, this.signal);
      };
      GeoJSONNode.parseAll = function (parent, model) {
          var geoJsonCounter = 0;
          [[LONGITUDE, LATITUDE], [LONGITUDE2, LATITUDE2]].forEach(function (coordinates) {
              var pair = coordinates.map(function (channel) { return model.channelHasField(channel) ? model.fieldDef(channel).field : undefined; });
              if (pair[0] || pair[1]) {
                  parent = new GeoJSONNode(parent, pair, null, model.getName("geojson_" + geoJsonCounter++));
              }
          });
          if (model.channelHasField(SHAPE)) {
              var fieldDef = model.fieldDef(SHAPE);
              if (fieldDef.type === GEOJSON) {
                  parent = new GeoJSONNode(parent, null, fieldDef.field, model.getName("geojson_" + geoJsonCounter++));
              }
          }
          return parent;
      };
      GeoJSONNode.prototype.assemble = function () {
          return __assign({ type: 'geojson' }, (this.fields ? { fields: this.fields } : {}), (this.geojson ? { geojson: this.geojson } : {}), { signal: this.signal });
      };
      return GeoJSONNode;
  }(DataFlowNode));

  var GeoPointNode = /** @class */ (function (_super) {
      __extends(GeoPointNode, _super);
      function GeoPointNode(parent, projection, fields, as) {
          var _this = _super.call(this, parent) || this;
          _this.projection = projection;
          _this.fields = fields;
          _this.as = as;
          return _this;
      }
      GeoPointNode.prototype.clone = function () {
          return new GeoPointNode(null, this.projection, duplicate(this.fields), duplicate(this.as));
      };
      GeoPointNode.parseAll = function (parent, model) {
          if (!model.projectionName()) {
              return parent;
          }
          [[LONGITUDE, LATITUDE], [LONGITUDE2, LATITUDE2]].forEach(function (coordinates) {
              var pair = coordinates.map(function (channel) { return model.channelHasField(channel) ? model.fieldDef(channel).field : undefined; });
              var suffix = coordinates[0] === LONGITUDE2 ? '2' : '';
              if (pair[0] || pair[1]) {
                  parent = new GeoPointNode(parent, model.projectionName(), pair, [model.getName('x' + suffix), model.getName('y' + suffix)]);
              }
          });
          return parent;
      };
      GeoPointNode.prototype.assemble = function () {
          return {
              type: 'geopoint',
              projection: this.projection,
              fields: this.fields,
              as: this.as
          };
      };
      return GeoPointNode;
  }(DataFlowNode));

  var IdentifierNode = /** @class */ (function (_super) {
      __extends(IdentifierNode, _super);
      function IdentifierNode(parent) {
          return _super.call(this, parent) || this;
      }
      IdentifierNode.prototype.clone = function () {
          return new IdentifierNode(null);
      };
      IdentifierNode.prototype.producedFields = function () {
          return _a = {}, _a[SELECTION_ID] = true, _a;
          var _a;
      };
      IdentifierNode.prototype.assemble = function () {
          return { type: 'identifier', as: SELECTION_ID };
      };
      return IdentifierNode;
  }(DataFlowNode));

  /**
   * Class to track interesting properties (see https://15721.courses.cs.cmu.edu/spring2016/papers/graefe-ieee1995.pdf)
   * about how fields have been parsed or whether they have been derived in a transforms. We use this to not parse the
   * same field again (or differently).
   */
  var AncestorParse = /** @class */ (function (_super) {
      __extends(AncestorParse, _super);
      function AncestorParse(explicit, implicit, parseNothing) {
          if (explicit === void 0) { explicit = {}; }
          if (implicit === void 0) { implicit = {}; }
          if (parseNothing === void 0) { parseNothing = false; }
          var _this = _super.call(this, explicit, implicit) || this;
          _this.explicit = explicit;
          _this.implicit = implicit;
          _this.parseNothing = parseNothing;
          return _this;
      }
      AncestorParse.prototype.clone = function () {
          var clone = _super.prototype.clone.call(this);
          clone.parseNothing = this.parseNothing;
          return clone;
      };
      return AncestorParse;
  }(Split));

  var LookupNode = /** @class */ (function (_super) {
      __extends(LookupNode, _super);
      function LookupNode(parent, transform, secondary) {
          var _this = _super.call(this, parent) || this;
          _this.transform = transform;
          _this.secondary = secondary;
          return _this;
      }
      LookupNode.make = function (parent, model, transform, counter) {
          var sources = model.component.data.sources;
          var s = new SourceNode(transform.from.data);
          var fromSource = sources[s.hash()];
          if (!fromSource) {
              sources[s.hash()] = s;
              fromSource = s;
          }
          var fromOutputName = model.getName("lookup_" + counter);
          var fromOutputNode = new OutputNode(fromSource, fromOutputName, 'lookup', model.component.data.outputNodeRefCounts);
          model.component.data.outputNodes[fromOutputName] = fromOutputNode;
          return new LookupNode(parent, transform, fromOutputNode.getSource());
      };
      LookupNode.prototype.producedFields = function () {
          return toSet(this.transform.from.fields || ((this.transform.as instanceof Array) ? this.transform.as : [this.transform.as]));
      };
      LookupNode.prototype.assemble = function () {
          var foreign;
          if (this.transform.from.fields) {
              // lookup a few fields and add create a flat output
              foreign = __assign({ values: this.transform.from.fields }, this.transform.as ? { as: ((this.transform.as instanceof Array) ? this.transform.as : [this.transform.as]) } : {});
          }
          else {
              // lookup full record and nest it
              var asName = this.transform.as;
              if (!isString(asName)) {
                  warn(message.NO_FIELDS_NEEDS_AS);
                  asName = '_lookup';
              }
              foreign = {
                  as: [asName]
              };
          }
          return __assign({ type: 'lookup', from: this.secondary, key: this.transform.from.key, fields: [this.transform.lookup] }, foreign, (this.transform.default ? { default: this.transform.default } : {}));
      };
      return LookupNode;
  }(DataFlowNode));

  /**
   * A class for the window transform nodes
   */
  var WindowTransformNode = /** @class */ (function (_super) {
      __extends(WindowTransformNode, _super);
      function WindowTransformNode(parent, transform) {
          var _this = _super.call(this, parent) || this;
          _this.transform = transform;
          return _this;
      }
      WindowTransformNode.prototype.clone = function () {
          return new WindowTransformNode(this.parent, duplicate(this.transform));
      };
      WindowTransformNode.prototype.producedFields = function () {
          var _this = this;
          var out = {};
          this.transform.window.forEach(function (windowFieldDef) {
              out[_this.getDefaultName(windowFieldDef)] = true;
          });
          return out;
      };
      WindowTransformNode.prototype.getDefaultName = function (windowFieldDef) {
          return windowFieldDef.as || vgField(windowFieldDef);
      };
      WindowTransformNode.prototype.assemble = function () {
          var fields = [];
          var ops = [];
          var as = [];
          var params = [];
          for (var _i = 0, _a = this.transform.window; _i < _a.length; _i++) {
              var window_1 = _a[_i];
              ops.push(window_1.op);
              as.push(this.getDefaultName(window_1));
              params.push(window_1.param === undefined ? null : window_1.param);
              fields.push(window_1.field === undefined ? null : window_1.field);
          }
          var frame = this.transform.frame;
          var groupby = this.transform.groupby;
          var sortFields = [];
          var sortOrder = [];
          if (this.transform.sort !== undefined) {
              for (var _b = 0, _c = this.transform.sort; _b < _c.length; _b++) {
                  var sortField = _c[_b];
                  sortFields.push(sortField.field);
                  sortOrder.push(sortField.order === undefined ? null : sortField.order);
              }
          }
          var sort = {
              field: sortFields,
              order: sortOrder,
          };
          var ignorePeers = this.transform.ignorePeers;
          var result = {
              type: 'window',
              params: params,
              as: as,
              ops: ops,
              fields: fields,
              sort: sort,
          };
          if (ignorePeers !== undefined) {
              result.ignorePeers = ignorePeers;
          }
          if (groupby !== undefined) {
              result.groupby = groupby;
          }
          if (frame !== undefined) {
              result.frame = frame;
          }
          return result;
      };
      return WindowTransformNode;
  }(DataFlowNode));

  function parseRoot(model, sources) {
      if (model.data || !model.parent) {
          // if the model defines a data source or is the root, create a source node
          var source = new SourceNode(model.data);
          var hash$$1 = source.hash();
          if (hash$$1 in sources) {
              // use a reference if we already have a source
              return sources[hash$$1];
          }
          else {
              // otherwise add a new one
              sources[hash$$1] = source;
              return source;
          }
      }
      else {
          // If we don't have a source defined (overriding parent's data), use the parent's facet root or main.
          return model.parent.component.data.facetRoot ? model.parent.component.data.facetRoot : model.parent.component.data.main;
      }
  }
  /**
   * Parses a transforms array into a chain of connected dataflow nodes.
   */
  function parseTransformArray(head, model, ancestorParse) {
      var lookupCounter = 0;
      model.transforms.forEach(function (t) {
          if (isCalculate(t)) {
              head = new CalculateNode(head, t);
              ancestorParse.set(t.as, 'derived', false);
          }
          else if (isFilter(t)) {
              head = ParseNode.makeImplicitFromFilterTransform(head, t, ancestorParse) || head;
              head = new FilterNode(head, model, t.filter);
          }
          else if (isBin(t)) {
              head = BinNode.makeFromTransform(head, t, model);
              ancestorParse.set(t.as, 'number', false);
          }
          else if (isTimeUnit$1(t)) {
              head = TimeUnitNode.makeFromTransform(head, t);
              ancestorParse.set(t.as, 'date', false);
          }
          else if (isAggregate$1(t)) {
              var agg = head = AggregateNode.makeFromTransform(head, t);
              if (requiresSelectionId(model)) {
                  head = new IdentifierNode(head);
              }
              for (var _i = 0, _a = keys(agg.producedFields()); _i < _a.length; _i++) {
                  var field = _a[_i];
                  ancestorParse.set(field, 'derived', false);
              }
          }
          else if (isLookup(t)) {
              var lookup = head = LookupNode.make(head, model, t, lookupCounter++);
              for (var _b = 0, _c = keys(lookup.producedFields()); _b < _c.length; _b++) {
                  var field = _c[_b];
                  ancestorParse.set(field, 'derived', false);
              }
          }
          else if (isWindow(t)) {
              var window_1 = head = new WindowTransformNode(head, t);
              for (var _d = 0, _e = keys(window_1.producedFields()); _d < _e.length; _d++) {
                  var field = _e[_d];
                  ancestorParse.set(field, 'derived', false);
              }
          }
          else if (isStack(t)) {
              var stack = head = StackNode.makeFromTransform(head, t);
              for (var _f = 0, _g = keys(stack.producedFields()); _f < _g.length; _f++) {
                  var field = _g[_f];
                  ancestorParse.set(field, 'derived', false);
              }
          }
          else {
              warn(message.invalidTransformIgnored(t));
              return;
          }
      });
      return head;
  }
  /*
  Description of the dataflow (http://asciiflow.com/):
       +--------+
       | Source |
       +---+----+
           |
           v
       FormatParse
       (explicit)
           |
           v
       Transforms
  (Filter, Calculate, Binning, TimeUnit, Aggregate, Window, ...)
           |
           v
       FormatParse
       (implicit)
           |
           v
   Binning (in `encoding`)
           |
           v
   Timeunit (in `encoding`)
           |
           v
  Formula From Sort Array
           |
           v
        +--+--+
        | Raw |
        +-----+
           |
           v
    Aggregate (in `encoding`)
           |
           v
    Stack (in `encoding`)
           |
           v
    Invalid Filter
           |
           v
     +----------+
     |   Main   |
     +----------+
           |
           v
       +-------+
       | Facet |----> "column", "column-layout", and "row"
       +-------+
           |
           v
    ...Child data...
  */
  function parseData(model) {
      var head = parseRoot(model, model.component.data.sources);
      var _a = model.component.data, outputNodes = _a.outputNodes, outputNodeRefCounts = _a.outputNodeRefCounts;
      var ancestorParse = model.parent ? model.parent.component.data.ancestorParse.clone() : new AncestorParse();
      // format.parse: null means disable parsing
      if (model.data && model.data.format && model.data.format.parse === null) {
          ancestorParse.parseNothing = true;
      }
      head = ParseNode.makeExplicit(head, model, ancestorParse) || head;
      // Default discrete selections require an identifier transform to
      // uniquely identify data points as the _id field is volatile. Add
      // this transform at the head of our pipeline such that the identifier
      // field is available for all subsequent datasets. Additional identifier
      // transforms will be necessary when new tuples are constructed
      // (e.g., post-aggregation).
      if (requiresSelectionId(model) && (isUnitModel(model) || isLayerModel(model))) {
          head = new IdentifierNode(head);
      }
      // HACK: This is equivalent for merging bin extent for union scale.
      // FIXME(https://github.com/vega/vega-lite/issues/2270): Correctly merge extent / bin node for shared bin scale
      var parentIsLayer = model.parent && isLayerModel(model.parent);
      if (isUnitModel(model) || isFacetModel(model)) {
          if (parentIsLayer) {
              head = BinNode.makeFromEncoding(head, model) || head;
          }
      }
      if (model.transforms.length > 0) {
          head = parseTransformArray(head, model, ancestorParse);
      }
      head = ParseNode.makeImplicitFromEncoding(head, model, ancestorParse) || head;
      if (isUnitModel(model)) {
          head = GeoJSONNode.parseAll(head, model);
          head = GeoPointNode.parseAll(head, model);
      }
      if (isUnitModel(model) || isFacetModel(model)) {
          if (!parentIsLayer) {
              head = BinNode.makeFromEncoding(head, model) || head;
          }
          head = TimeUnitNode.makeFromEncoding(head, model) || head;
          head = CalculateNode.parseAllForSortIndex(head, model);
      }
      // add an output node pre aggregation
      var rawName = model.getName(RAW);
      var raw = new OutputNode(head, rawName, RAW, outputNodeRefCounts);
      outputNodes[rawName] = raw;
      head = raw;
      if (isUnitModel(model)) {
          var agg = AggregateNode.makeFromEncoding(head, model);
          if (agg) {
              head = agg;
              if (requiresSelectionId(model)) {
                  head = new IdentifierNode(head);
              }
          }
          head = StackNode.makeFromEncoding(head, model) || head;
      }
      if (isUnitModel(model)) {
          head = FilterInvalidNode.make(head, model) || head;
      }
      // output node for marks
      var mainName = model.getName(MAIN);
      var main = new OutputNode(head, mainName, MAIN, outputNodeRefCounts);
      outputNodes[mainName] = main;
      head = main;
      // add facet marker
      var facetRoot = null;
      if (isFacetModel(model)) {
          var facetName = model.getName('facet');
          facetRoot = new FacetNode(head, model, facetName, main.getSource());
          outputNodes[facetName] = facetRoot;
          head = facetRoot;
      }
      return __assign({}, model.component.data, { outputNodes: outputNodes,
          outputNodeRefCounts: outputNodeRefCounts,
          raw: raw,
          main: main,
          facetRoot: facetRoot,
          ancestorParse: ancestorParse });
  }

  var BaseConcatModel = /** @class */ (function (_super) {
      __extends(BaseConcatModel, _super);
      function BaseConcatModel(spec, parent, parentGivenName, config, repeater, resolve) {
          return _super.call(this, spec, parent, parentGivenName, config, repeater, resolve) || this;
      }
      BaseConcatModel.prototype.parseData = function () {
          this.component.data = parseData(this);
          this.children.forEach(function (child) {
              child.parseData();
          });
      };
      BaseConcatModel.prototype.parseSelection = function () {
          var _this = this;
          // Merge selections up the hierarchy so that they may be referenced
          // across unit specs. Persist their definitions within each child
          // to assemble signals which remain within output Vega unit groups.
          this.component.selection = {};
          var _loop_1 = function (child) {
              child.parseSelection();
              keys(child.component.selection).forEach(function (key) {
                  _this.component.selection[key] = child.component.selection[key];
              });
          };
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              _loop_1(child);
          }
      };
      BaseConcatModel.prototype.parseMarkGroup = function () {
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              child.parseMarkGroup();
          }
      };
      BaseConcatModel.prototype.parseAxisAndHeader = function () {
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              child.parseAxisAndHeader();
          }
          // TODO(#2415): support shared axes
      };
      BaseConcatModel.prototype.assembleSelectionTopLevelSignals = function (signals) {
          return this.children.reduce(function (sg, child) { return child.assembleSelectionTopLevelSignals(sg); }, signals);
      };
      BaseConcatModel.prototype.assembleSelectionSignals = function () {
          this.children.forEach(function (child) { return child.assembleSelectionSignals(); });
          return [];
      };
      BaseConcatModel.prototype.assembleLayoutSignals = function () {
          return this.children.reduce(function (signals, child) {
              return signals.concat(child.assembleLayoutSignals());
          }, assembleLayoutSignals(this));
      };
      BaseConcatModel.prototype.assembleSelectionData = function (data) {
          return this.children.reduce(function (db, child) { return child.assembleSelectionData(db); }, data);
      };
      BaseConcatModel.prototype.assembleMarks = function () {
          // only children have marks
          return this.children.map(function (child) {
              var title = child.assembleTitle();
              var style = child.assembleGroupStyle();
              var layoutSizeEncodeEntry = child.assembleLayoutSize();
              return __assign({ type: 'group', name: child.getName('group') }, (title ? { title: title } : {}), (style ? { style: style } : {}), (layoutSizeEncodeEntry ? {
                  encode: {
                      update: layoutSizeEncodeEntry
                  }
              } : {}), child.assembleGroup());
          });
      };
      return BaseConcatModel;
  }(Model));

  function parseLayerLayoutSize(model) {
      parseChildrenLayoutSize(model);
      var layoutSizeCmpt = model.component.layoutSize;
      layoutSizeCmpt.setWithExplicit('width', parseNonUnitLayoutSizeForChannel(model, 'width'));
      layoutSizeCmpt.setWithExplicit('height', parseNonUnitLayoutSizeForChannel(model, 'height'));
  }
  var parseRepeatLayoutSize = parseLayerLayoutSize;
  function parseConcatLayoutSize(model) {
      parseChildrenLayoutSize(model);
      var layoutSizeCmpt = model.component.layoutSize;
      var sizeTypeToMerge = model.isVConcat ? 'width' : 'height';
      layoutSizeCmpt.setWithExplicit(sizeTypeToMerge, parseNonUnitLayoutSizeForChannel(model, sizeTypeToMerge));
  }
  function parseChildrenLayoutSize(model) {
      for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
          var child = _a[_i];
          child.parseLayoutSize();
      }
  }
  function parseNonUnitLayoutSizeForChannel(model, sizeType) {
      var channel = sizeType === 'width' ? 'x' : 'y';
      var resolve = model.component.resolve;
      var mergedSize;
      // Try to merge layout size
      for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
          var child = _a[_i];
          var childSize = child.component.layoutSize.getWithExplicit(sizeType);
          var scaleResolve = resolve.scale[channel];
          if (scaleResolve === 'independent' && childSize.value === 'range-step') {
              // Do not merge independent scales with range-step as their size depends
              // on the scale domains, which can be different between scales.
              mergedSize = undefined;
              break;
          }
          if (mergedSize) {
              if (scaleResolve === 'independent' && mergedSize.value !== childSize.value) {
                  // For independent scale, only merge if all the sizes are the same.
                  // If the values are different, abandon the merge!
                  mergedSize = undefined;
                  break;
              }
              mergedSize = mergeValuesWithExplicit(mergedSize, childSize, sizeType, '');
          }
          else {
              mergedSize = childSize;
          }
      }
      if (mergedSize) {
          // If merged, rename size and set size of all children.
          for (var _b = 0, _c = model.children; _b < _c.length; _b++) {
              var child = _c[_b];
              model.renameLayoutSize(child.getName(sizeType), model.getName(sizeType));
              child.component.layoutSize.set(sizeType, 'merged', false);
          }
          return mergedSize;
      }
      else {
          // Otherwise, there is no merged size.
          return {
              explicit: false,
              value: undefined
          };
      }
  }
  function parseUnitLayoutSize(model) {
      var layoutSizeComponent = model.component.layoutSize;
      if (!layoutSizeComponent.explicit.width) {
          var width = defaultUnitSize(model, 'width');
          layoutSizeComponent.set('width', width, false);
      }
      if (!layoutSizeComponent.explicit.height) {
          var height = defaultUnitSize(model, 'height');
          layoutSizeComponent.set('height', height, false);
      }
  }
  function defaultUnitSize(model, sizeType) {
      var channel = sizeType === 'width' ? 'x' : 'y';
      var config = model.config;
      var scaleComponent = model.getScaleComponent(channel);
      if (scaleComponent) {
          var scaleType = scaleComponent.get('type');
          var range = scaleComponent.get('range');
          if (hasDiscreteDomain(scaleType) && isVgRangeStep(range)) {
              // For discrete domain with range.step, use dynamic width/height
              return 'range-step';
          }
          else {
              return config.view[sizeType];
          }
      }
      else if (model.hasProjection) {
          return config.view[sizeType];
      }
      else {
          // No scale - set default size
          if (sizeType === 'width' && model.mark === 'text') {
              // width for text mark without x-field is a bit wider than typical range step
              return config.scale.textXRangeStep;
          }
          // Set width/height equal to rangeStep config or if rangeStep is null, use value from default scale config.
          return config.scale.rangeStep || defaultScaleConfig.rangeStep;
      }
  }

  var ConcatModel = /** @class */ (function (_super) {
      __extends(ConcatModel, _super);
      function ConcatModel(spec, parent, parentGivenName, repeater, config) {
          var _this = _super.call(this, spec, parent, parentGivenName, config, repeater, spec.resolve) || this;
          _this.type = 'concat';
          if (spec.resolve && spec.resolve.axis && (spec.resolve.axis.x === 'shared' || spec.resolve.axis.y === 'shared')) {
              warn(message.CONCAT_CANNOT_SHARE_AXIS);
          }
          _this.isVConcat = isVConcatSpec(spec);
          _this.children = (isVConcatSpec(spec) ? spec.vconcat : spec.hconcat).map(function (child, i) {
              return buildModel(child, _this, _this.getName('concat_' + i), undefined, repeater, config, false);
          });
          return _this;
      }
      ConcatModel.prototype.parseLayoutSize = function () {
          parseConcatLayoutSize(this);
      };
      ConcatModel.prototype.parseAxisGroup = function () {
          return null;
      };
      ConcatModel.prototype.assembleLayout = function () {
          // TODO: allow customization
          return __assign({ padding: { row: 10, column: 10 }, offset: 10 }, (this.isVConcat ? { columns: 1 } : {}), { bounds: 'full', 
              // Use align each so it can work with multiple plots with different size
              align: 'each' });
      };
      return ConcatModel;
  }(BaseConcatModel));

  function makeWalkTree(data) {
      // to name datasources
      var datasetIndex = 0;
      /**
       * Recursively walk down the tree.
       */
      function walkTree(node, dataSource) {
          if (node instanceof SourceNode) {
              // If the source is a named data source or a data source with values, we need
              // to put it in a different data source. Otherwise, Vega may override the data.
              if (!isUrlData(node.data)) {
                  data.push(dataSource);
                  var newData = {
                      name: null,
                      source: dataSource.name,
                      transform: []
                  };
                  dataSource = newData;
              }
          }
          if (node instanceof ParseNode) {
              if (node.parent instanceof SourceNode && !dataSource.source) {
                  // If node's parent is a root source and the data source does not refer to another data source, use normal format parse
                  dataSource.format = __assign({}, dataSource.format || {}, { parse: node.assembleFormatParse() });
                  // add calculates for all nested fields
                  dataSource.transform = dataSource.transform.concat(node.assembleTransforms(true));
              }
              else {
                  // Otherwise use Vega expression to parse
                  dataSource.transform = dataSource.transform.concat(node.assembleTransforms());
              }
          }
          if (node instanceof FacetNode) {
              if (!dataSource.name) {
                  dataSource.name = "data_" + datasetIndex++;
              }
              if (!dataSource.source || dataSource.transform.length > 0) {
                  data.push(dataSource);
                  node.data = dataSource.name;
              }
              else {
                  node.data = dataSource.source;
              }
              node.assemble().forEach(function (d) { return data.push(d); });
              // break here because the rest of the tree has to be taken care of by the facet.
              return;
          }
          if (node instanceof FilterNode ||
              node instanceof CalculateNode ||
              node instanceof GeoPointNode ||
              node instanceof GeoJSONNode ||
              node instanceof AggregateNode ||
              node instanceof LookupNode ||
              node instanceof WindowTransformNode ||
              node instanceof IdentifierNode) {
              dataSource.transform.push(node.assemble());
          }
          if (node instanceof FilterInvalidNode ||
              node instanceof BinNode ||
              node instanceof TimeUnitNode ||
              node instanceof StackNode) {
              dataSource.transform = dataSource.transform.concat(node.assemble());
          }
          if (node instanceof AggregateNode) {
              if (!dataSource.name) {
                  dataSource.name = "data_" + datasetIndex++;
              }
          }
          if (node instanceof OutputNode) {
              if (dataSource.source && dataSource.transform.length === 0) {
                  node.setSource(dataSource.source);
              }
              else if (node.parent instanceof OutputNode) {
                  // Note that an output node may be required but we still do not assemble a
                  // separate data source for it.
                  node.setSource(dataSource.name);
              }
              else {
                  if (!dataSource.name) {
                      dataSource.name = "data_" + datasetIndex++;
                  }
                  // Here we set the name of the datasource we generated. From now on
                  // other assemblers can use it.
                  node.setSource(dataSource.name);
                  // if this node has more than one child, we will add a datasource automatically
                  if (node.numChildren() === 1) {
                      data.push(dataSource);
                      var newData = {
                          name: null,
                          source: dataSource.name,
                          transform: []
                      };
                      dataSource = newData;
                  }
              }
          }
          switch (node.numChildren()) {
              case 0:
                  // done
                  if (node instanceof OutputNode && (!dataSource.source || dataSource.transform.length > 0)) {
                      // do not push empty datasources that are simply references
                      data.push(dataSource);
                  }
                  break;
              case 1:
                  walkTree(node.children[0], dataSource);
                  break;
              default:
                  if (!dataSource.name) {
                      dataSource.name = "data_" + datasetIndex++;
                  }
                  var source_1 = dataSource.name;
                  if (!dataSource.source || dataSource.transform.length > 0) {
                      data.push(dataSource);
                  }
                  else {
                      source_1 = dataSource.source;
                  }
                  node.children.forEach(function (child) {
                      var newData = {
                          name: null,
                          source: source_1,
                          transform: []
                      };
                      walkTree(child, newData);
                  });
                  break;
          }
      }
      return walkTree;
  }
  /**
   * Assemble data sources that are derived from faceted data.
   */
  function assembleFacetData(root) {
      var data = [];
      var walkTree = makeWalkTree(data);
      root.children.forEach(function (child) { return walkTree(child, {
          source: root.name,
          name: null,
          transform: []
      }); });
      return data;
  }
  /**
   * Create Vega Data array from a given compiled model and append all of them to the given array
   *
   * @param  model
   * @param  data array
   * @return modified data array
   */
  function assembleRootData(dataComponent, datasets) {
      var roots = vals(dataComponent.sources);
      var data = [];
      // roots.forEach(debug);
      var walkTree = makeWalkTree(data);
      var sourceIndex = 0;
      roots.forEach(function (root) {
          // assign a name if the source does not have a name yet
          if (!root.hasName()) {
              root.dataName = "source_" + sourceIndex++;
          }
          var newData = root.assemble();
          walkTree(root, newData);
      });
      // remove empty transform arrays for cleaner output
      data.forEach(function (d) {
          if (d.transform.length === 0) {
              delete d.transform;
          }
      });
      // move sources without transforms (the ones that are potentially used in lookups) to the beginning
      var whereTo = 0;
      for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if ((d.transform || []).length === 0 && !d.source) {
              data.splice(whereTo++, 0, data.splice(i, 1)[0]);
          }
      }
      // now fix the from references in lookup transforms
      for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
          var d = data_1[_i];
          for (var _a = 0, _b = d.transform || []; _a < _b.length; _a++) {
              var t = _b[_a];
              if (t.type === 'lookup') {
                  t.from = dataComponent.outputNodes[t.from].getSource();
              }
          }
      }
      // inline values for datasets that are in the datastore
      for (var _c = 0, data_2 = data; _c < data_2.length; _c++) {
          var d = data_2[_c];
          if (d.name in datasets) {
              d.values = datasets[d.name];
          }
      }
      return data;
  }

  function replaceRepeaterInFacet(facet, repeater) {
      return replaceRepeater(facet, repeater);
  }
  function replaceRepeaterInEncoding(encoding, repeater) {
      return replaceRepeater(encoding, repeater);
  }
  /**
   * Replaces repeated value and returns if the repeated value is valid.
   */
  function replaceRepeat(o, repeater) {
      if (isRepeatRef(o.field)) {
          if (o.field.repeat in repeater) {
              // any needed to calm down ts compiler
              return __assign({}, o, { field: repeater[o.field.repeat] });
          }
          else {
              warn(message.noSuchRepeatedValue(o.field.repeat));
              return undefined;
          }
      }
      return o;
  }
  /**
   * Replace repeater values in a field def with the concrete field name.
   */
  function replaceRepeaterInFieldDef(fieldDef, repeater) {
      fieldDef = replaceRepeat(fieldDef, repeater);
      if (fieldDef === undefined) {
          // the field def should be ignored
          return undefined;
      }
      if (fieldDef.sort && isSortField(fieldDef.sort)) {
          var sort = replaceRepeat(fieldDef.sort, repeater);
          fieldDef = __assign({}, fieldDef, (sort ? { sort: sort } : {}));
      }
      return fieldDef;
  }
  function replaceRepeaterInChannelDef(channelDef, repeater) {
      if (isFieldDef(channelDef)) {
          var fd = replaceRepeaterInFieldDef(channelDef, repeater);
          if (fd) {
              return fd;
          }
          else if (isConditionalDef(channelDef)) {
              return { condition: channelDef.condition };
          }
      }
      else {
          if (hasConditionalFieldDef(channelDef)) {
              var fd = replaceRepeaterInFieldDef(channelDef.condition, repeater);
              if (fd) {
                  return __assign({}, channelDef, { condition: fd });
              }
              else {
                  var condition = channelDef.condition, channelDefWithoutCondition = __rest(channelDef, ["condition"]);
                  return channelDefWithoutCondition;
              }
          }
          return channelDef;
      }
      return undefined;
  }
  function replaceRepeater(mapping, repeater) {
      var out = {};
      for (var channel in mapping) {
          if (mapping.hasOwnProperty(channel)) {
              var channelDef = mapping[channel];
              if (isArray(channelDef)) {
                  // array cannot have condition
                  out[channel] = channelDef.map(function (cd) { return replaceRepeaterInChannelDef(cd, repeater); })
                      .filter(function (cd) { return cd; });
              }
              else {
                  var cd = replaceRepeaterInChannelDef(channelDef, repeater);
                  if (cd) {
                      out[channel] = cd;
                  }
              }
          }
      }
      return out;
  }

  var FacetModel = /** @class */ (function (_super) {
      __extends(FacetModel, _super);
      function FacetModel(spec, parent, parentGivenName, repeater, config) {
          var _this = _super.call(this, spec, parent, parentGivenName, config, repeater, spec.resolve) || this;
          _this.type = 'facet';
          _this.child = buildModel(spec.spec, _this, _this.getName('child'), undefined, repeater, config, false);
          _this.children = [_this.child];
          var facet = replaceRepeaterInFacet(spec.facet, repeater);
          _this.facet = _this.initFacet(facet);
          return _this;
      }
      FacetModel.prototype.initFacet = function (facet) {
          // clone to prevent side effect to the original spec
          return reduce(facet, function (normalizedFacet, fieldDef, channel) {
              if (!contains([ROW, COLUMN], channel)) {
                  // Drop unsupported channel
                  warn(message.incompatibleChannel(channel, 'facet'));
                  return normalizedFacet;
              }
              if (fieldDef.field === undefined) {
                  warn(message.emptyFieldDef(fieldDef, channel));
                  return normalizedFacet;
              }
              // Convert type to full, lowercase type, or augment the fieldDef with a default type if missing.
              normalizedFacet[channel] = normalize(fieldDef, channel);
              return normalizedFacet;
          }, {});
      };
      FacetModel.prototype.channelHasField = function (channel) {
          return !!this.facet[channel];
      };
      FacetModel.prototype.fieldDef = function (channel) {
          return this.facet[channel];
      };
      FacetModel.prototype.parseData = function () {
          this.component.data = parseData(this);
          this.child.parseData();
      };
      FacetModel.prototype.parseLayoutSize = function () {
          parseChildrenLayoutSize(this);
      };
      FacetModel.prototype.parseSelection = function () {
          // As a facet has a single child, the selection components are the same.
          // The child maintains its selections to assemble signals, which remain
          // within its unit.
          this.child.parseSelection();
          this.component.selection = this.child.component.selection;
      };
      FacetModel.prototype.parseMarkGroup = function () {
          this.child.parseMarkGroup();
      };
      FacetModel.prototype.parseAxisAndHeader = function () {
          this.child.parseAxisAndHeader();
          this.parseHeader('column');
          this.parseHeader('row');
          this.mergeChildAxis('x');
          this.mergeChildAxis('y');
      };
      FacetModel.prototype.parseHeader = function (channel) {
          if (this.channelHasField(channel)) {
              var fieldDef = this.facet[channel];
              var header = fieldDef.header || {};
              var title$$1 = fieldDef.title !== undefined ? fieldDef.title :
                  header.title !== undefined ? header.title : title(fieldDef, this.config);
              if (this.child.component.layoutHeaders[channel].title) {
                  // merge title with child to produce "Title / Subtitle / Sub-subtitle"
                  title$$1 += ' / ' + this.child.component.layoutHeaders[channel].title;
                  this.child.component.layoutHeaders[channel].title = null;
              }
              this.component.layoutHeaders[channel] = {
                  title: title$$1,
                  facetFieldDef: fieldDef,
                  // TODO: support adding label to footer as well
                  header: [this.makeHeaderComponent(channel, true)]
              };
          }
      };
      FacetModel.prototype.makeHeaderComponent = function (channel, labels) {
          var sizeType = channel === 'row' ? 'height' : 'width';
          return {
              labels: labels,
              sizeSignal: this.child.component.layoutSize.get(sizeType) ? this.child.getSizeSignalRef(sizeType) : undefined,
              axes: []
          };
      };
      FacetModel.prototype.mergeChildAxis = function (channel) {
          var child = this.child;
          if (child.component.axes[channel]) {
              var _a = this.component, layoutHeaders = _a.layoutHeaders, resolve = _a.resolve;
              resolve.axis[channel] = parseGuideResolve(resolve, channel);
              if (resolve.axis[channel] === 'shared') {
                  // For shared axis, move the axes to facet's header or footer
                  var headerChannel = channel === 'x' ? 'column' : 'row';
                  var layoutHeader = layoutHeaders[headerChannel];
                  for (var _i = 0, _b = child.component.axes[channel]; _i < _b.length; _i++) {
                      var axisComponent = _b[_i];
                      var headerType = getHeaderType(axisComponent.get('orient'));
                      layoutHeader[headerType] = layoutHeader[headerType] ||
                          [this.makeHeaderComponent(headerChannel, false)];
                      var mainAxis = assembleAxis(axisComponent, 'main', this.config, { header: true });
                      // LayoutHeader no longer keep track of property precedence, thus let's combine.
                      layoutHeader[headerType][0].axes.push(mainAxis);
                      axisComponent.mainExtracted = true;
                  }
              }
          }
      };
      FacetModel.prototype.assembleSelectionTopLevelSignals = function (signals) {
          return this.child.assembleSelectionTopLevelSignals(signals);
      };
      FacetModel.prototype.assembleSelectionSignals = function () {
          this.child.assembleSelectionSignals();
          return [];
      };
      FacetModel.prototype.assembleSelectionData = function (data) {
          return this.child.assembleSelectionData(data);
      };
      FacetModel.prototype.getLayoutBandMixins = function (headerType) {
          var bandMixins = {};
          var bandType = headerType === 'header' ? 'headerBand' : 'footerBand';
          for (var _i = 0, _a = ['row', 'column']; _i < _a.length; _i++) {
              var channel = _a[_i];
              var layoutHeaderComponent = this.component.layoutHeaders[channel];
              var headerComponent = layoutHeaderComponent[headerType];
              if (headerComponent && headerComponent[0]) {
                  var sizeType = channel === 'row' ? 'height' : 'width';
                  if (!this.child.component.layoutSize.get(sizeType)) {
                      // If facet child does not have size signal, then apply headerBand
                      bandMixins[bandType] = bandMixins[bandType] || {};
                      bandMixins[bandType][channel] = 0.5;
                  }
              }
          }
          return bandMixins;
      };
      FacetModel.prototype.assembleLayout = function () {
          var columns = this.channelHasField('column') ? this.columnDistinctSignal() : 1;
          // TODO: determine default align based on shared / independent scales
          return __assign({ padding: { row: 10, column: 10 } }, this.getLayoutBandMixins('header'), this.getLayoutBandMixins('footer'), { 
              // TODO: support offset for rowHeader/rowFooter/rowTitle/columnHeader/columnFooter/columnTitle
              offset: 10, columns: columns, bounds: 'full', align: 'all' });
      };
      FacetModel.prototype.assembleLayoutSignals = function () {
          // FIXME(https://github.com/vega/vega-lite/issues/1193): this can be incorrect if we have independent scales.
          return this.child.assembleLayoutSignals();
      };
      FacetModel.prototype.columnDistinctSignal = function () {
          if (this.parent && (this.parent instanceof FacetModel)) {
              // For nested facet, we will add columns to group mark instead
              // See discussion in https://github.com/vega/vega/issues/952
              // and https://github.com/vega/vega-view/releases/tag/v1.2.6
              return undefined;
          }
          else {
              // In facetNode.assemble(), the name is always this.getName('column') + '_layout'.
              var facetLayoutDataName = this.getName('column_domain');
              return { signal: "length(data('" + facetLayoutDataName + "'))" };
          }
      };
      FacetModel.prototype.assembleGroup = function (signals) {
          if (this.parent && (this.parent instanceof FacetModel)) {
              // Provide number of columns for layout.
              // See discussion in https://github.com/vega/vega/issues/952
              // and https://github.com/vega/vega-view/releases/tag/v1.2.6
              return __assign({}, (this.channelHasField('column') ? {
                  encode: {
                      update: {
                          // TODO(https://github.com/vega/vega-lite/issues/2759):
                          // Correct the signal for facet of concat of facet_column
                          columns: { field: vgField(this.facet.column, { prefix: 'distinct' }) }
                      }
                  }
              } : {}), _super.prototype.assembleGroup.call(this, signals));
          }
          return _super.prototype.assembleGroup.call(this, signals);
      };
      /**
       * Aggregate cardinality for calculating size
       */
      FacetModel.prototype.getCardinalityAggregateForChild = function () {
          var fields = [];
          var ops = [];
          if (this.child instanceof FacetModel) {
              if (this.child.channelHasField('column')) {
                  fields.push(vgField(this.child.facet.column));
                  ops.push('distinct');
              }
          }
          else {
              for (var _i = 0, _a = ['x', 'y']; _i < _a.length; _i++) {
                  var channel = _a[_i];
                  var childScaleComponent = this.child.component.scales[channel];
                  if (childScaleComponent && !childScaleComponent.merged) {
                      var type = childScaleComponent.get('type');
                      var range = childScaleComponent.get('range');
                      if (hasDiscreteDomain(type) && isVgRangeStep(range)) {
                          var domain = assembleDomain(this.child, channel);
                          var field = getFieldFromDomain(domain);
                          if (field) {
                              fields.push(field);
                              ops.push('distinct');
                          }
                          else {
                              warn('Unknown field for ${channel}.  Cannot calculate view size.');
                          }
                      }
                  }
              }
          }
          return fields.length ? { fields: fields, ops: ops } : undefined;
      };
      FacetModel.prototype.assembleMarks = function () {
          var _a = this, child = _a.child, facet = _a.facet;
          var facetRoot = this.component.data.facetRoot;
          var data = assembleFacetData(facetRoot);
          // If we facet by two dimensions, we need to add a cross operator to the aggregation
          // so that we create all groups
          var hasRow = this.channelHasField(ROW);
          var hasColumn = this.channelHasField(COLUMN);
          var layoutSizeEncodeEntry = child.assembleLayoutSize();
          var aggregateMixins = {};
          if (hasRow && hasColumn) {
              aggregateMixins.aggregate = { cross: true };
          }
          var cardinalityAggregateForChild = this.getCardinalityAggregateForChild();
          if (cardinalityAggregateForChild) {
              aggregateMixins.aggregate = __assign({}, aggregateMixins.aggregate, cardinalityAggregateForChild);
          }
          var title$$1 = child.assembleTitle();
          var style = child.assembleGroupStyle();
          var markGroup = __assign({ name: this.getName('cell'), type: 'group' }, (title$$1 ? { title: title$$1 } : {}), (style ? { style: style } : {}), { from: {
                  facet: __assign({ name: facetRoot.name, data: facetRoot.data, groupby: [].concat(hasRow ? [this.vgField(ROW)] : [], hasColumn ? [this.vgField(COLUMN)] : []) }, aggregateMixins)
              }, sort: {
                  field: [].concat(hasRow ? [this.vgField(ROW, { expr: 'datum', })] : [], hasColumn ? [this.vgField(COLUMN, { expr: 'datum' })] : []),
                  order: [].concat(hasRow ? [(facet.row.sort) || 'ascending'] : [], hasColumn ? [(facet.column.sort) || 'ascending'] : [])
              } }, (data.length > 0 ? { data: data } : {}), (layoutSizeEncodeEntry ? { encode: { update: layoutSizeEncodeEntry } } : {}), child.assembleGroup());
          return [markGroup];
      };
      FacetModel.prototype.getMapping = function () {
          return this.facet;
      };
      return FacetModel;
  }(ModelWithField));

  function isFalseOrNull(v) {
      return v === false || v === null;
  }
  var AxisComponent = /** @class */ (function (_super) {
      __extends(AxisComponent, _super);
      function AxisComponent(explicit, implicit, mainExtracted) {
          if (explicit === void 0) { explicit = {}; }
          if (implicit === void 0) { implicit = {}; }
          if (mainExtracted === void 0) { mainExtracted = false; }
          var _this = _super.call(this) || this;
          _this.explicit = explicit;
          _this.implicit = implicit;
          _this.mainExtracted = mainExtracted;
          return _this;
      }
      AxisComponent.prototype.clone = function () {
          return new AxisComponent(duplicate(this.explicit), duplicate(this.implicit), this.mainExtracted);
      };
      AxisComponent.prototype.hasAxisPart = function (part) {
          // FIXME(https://github.com/vega/vega-lite/issues/2552) this method can be wrong if users use a Vega theme.
          if (part === 'axis') { // always has the axis container part
              return true;
          }
          if (part === 'grid' || part === 'title') {
              return !!this.get(part);
          }
          // Other parts are enabled by default, so they should not be false or null.
          return !isFalseOrNull(this.get(part));
      };
      return AxisComponent;
  }(Split));

  function getAxisConfig(property, config, channel, orient, scaleType) {
      if (orient === void 0) { orient = ''; }
      // configTypes to loop, starting from higher precedence
      var configTypes = (scaleType === 'band' ? ['axisBand'] : []).concat([
          channel === 'x' ? 'axisX' : 'axisY',
          'axis' + orient.substr(0, 1).toUpperCase() + orient.substr(1),
          'axis'
      ]);
      for (var _i = 0, configTypes_1 = configTypes; _i < configTypes_1.length; _i++) {
          var configType = configTypes_1[_i];
          if (config[configType] && config[configType][property] !== undefined) {
              return config[configType][property];
          }
      }
      return undefined;
  }

  function labels$1(model, channel, specifiedLabelsSpec, orient) {
      var fieldDef = model.fieldDef(channel) ||
          (channel === 'x' ? model.fieldDef('x2') :
              channel === 'y' ? model.fieldDef('y2') :
                  undefined);
      var axis = model.axis(channel);
      var config = model.config;
      var labelsSpec = {};
      // Text
      if (isTimeFieldDef(fieldDef)) {
          var isUTCScale = model.getScaleComponent(channel).get('type') === ScaleType.UTC;
          var expr = timeFormatExpression('datum.value', fieldDef.timeUnit, axis.format, config.axis.shortTimeLabels, config.timeFormat, isUTCScale);
          if (expr) {
              labelsSpec.text = { signal: expr };
          }
      }
      // Label Angle
      var angle = getAxisConfig('labelAngle', model.config, channel, orient, model.getScaleComponent(channel).get('type'));
      if (angle === undefined) {
          angle = labelAngle(axis, channel, fieldDef);
          if (angle) {
              labelsSpec.angle = { value: angle };
          }
      }
      if (angle !== undefined) {
          var align = labelAlign$1(angle, orient);
          if (align) {
              labelsSpec.align = { value: align };
          }
          labelsSpec.baseline = labelBaseline$1(angle, orient);
      }
      labelsSpec = __assign({}, labelsSpec, specifiedLabelsSpec);
      return keys(labelsSpec).length === 0 ? undefined : labelsSpec;
  }
  function labelBaseline$1(angle, orient) {
      if (orient === 'top' || orient === 'bottom') {
          if (angle <= 45 || 315 <= angle) {
              return { value: orient === 'top' ? 'bottom' : 'top' };
          }
          else if (135 <= angle && angle <= 225) {
              return { value: orient === 'top' ? 'top' : 'bottom' };
          }
          else {
              return { value: 'middle' };
          }
      }
      else {
          if ((angle <= 45 || 315 <= angle) || (135 <= angle && angle <= 225)) {
              return { value: 'middle' };
          }
          else if (45 <= angle && angle <= 135) {
              return { value: orient === 'left' ? 'top' : 'bottom' };
          }
          else {
              return { value: orient === 'left' ? 'bottom' : 'top' };
          }
      }
  }
  function labelAngle(axis, channel, fieldDef) {
      if (axis.labelAngle !== undefined) {
          // Make angle within [0,360)
          return ((axis.labelAngle % 360) + 360) % 360;
      }
      else {
          if (channel === X && contains([NOMINAL, ORDINAL], fieldDef.type)) {
              return 270;
          }
      }
      return undefined;
  }
  function labelAlign$1(angle, orient) {
      angle = ((angle % 360) + 360) % 360;
      if (orient === 'top' || orient === 'bottom') {
          if (angle % 180 === 0) {
              return 'center';
          }
          else if (0 < angle && angle < 180) {
              return orient === 'top' ? 'right' : 'left';
          }
          else {
              return orient === 'top' ? 'left' : 'right';
          }
      }
      else {
          if ((angle + 90) % 180 === 0) {
              return 'center';
          }
          else if (90 <= angle && angle < 270) {
              return orient === 'left' ? 'left' : 'right';
          }
          else {
              return orient === 'left' ? 'right' : 'left';
          }
      }
  }

  // TODO: we need to refactor this method after we take care of config refactoring
  /**
   * Default rules for whether to show a grid should be shown for a channel.
   * If `grid` is unspecified, the default value is `true` for ordinal scales that are not binned
   */
  function grid(scaleType, fieldDef) {
      return !hasDiscreteDomain(scaleType) && !fieldDef.bin;
  }
  function gridScale(model, channel) {
      var gridChannel = channel === 'x' ? 'y' : 'x';
      if (model.getScaleComponent(gridChannel)) {
          return model.scaleName(gridChannel);
      }
      return undefined;
  }
  function labelFlush(fieldDef, channel, specifiedAxis) {
      if (specifiedAxis.labelFlush !== undefined) {
          return specifiedAxis.labelFlush;
      }
      if (channel === 'x' && contains(['quantitative', 'temporal'], fieldDef.type)) {
          return true;
      }
      return undefined;
  }
  function labelOverlap(fieldDef, specifiedAxis, channel, scaleType) {
      if (specifiedAxis.labelOverlap !== undefined) {
          return specifiedAxis.labelOverlap;
      }
      // do not prevent overlap for nominal data because there is no way to infer what the missing labels are
      if (fieldDef.type !== 'nominal') {
          if (scaleType === 'log') {
              return 'greedy';
          }
          return true;
      }
      return undefined;
  }
  function orient(channel) {
      switch (channel) {
          case X:
              return 'bottom';
          case Y:
              return 'left';
      }
      /* istanbul ignore next: This should never happen. */
      throw new Error(message.INVALID_CHANNEL_FOR_AXIS);
  }
  function tickCount(channel, fieldDef, scaleType, size) {
      if (!hasDiscreteDomain(scaleType) && scaleType !== 'log' && !contains(['month', 'hours', 'day', 'quarter'], fieldDef.timeUnit)) {
          if (fieldDef.bin) {
              // for binned data, we don't want more ticks than maxbins
              return { signal: "ceil(" + size.signal + "/20)" };
          }
          return { signal: "ceil(" + size.signal + "/40)" };
      }
      return undefined;
  }
  function values$1(specifiedAxis, model, fieldDef, channel) {
      var vals$$1 = specifiedAxis.values;
      if (specifiedAxis.values && isDateTime(vals$$1[0])) {
          return vals$$1.map(function (dt) {
              // normalize = true as end user won't put 0 = January
              return { signal: dateTimeExpr(dt, true) };
          });
      }
      if (!vals$$1 && fieldDef.bin && fieldDef.type === QUANTITATIVE) {
          var domain = model.scaleDomain(channel);
          if (domain && domain !== 'unaggregated' && !isSelectionDomain(domain)) { // explicit value
              return vals$$1;
          }
          var signal = model.getName(binToString(fieldDef.bin) + "_" + fieldDef.field + "_bins");
          return { signal: "sequence(" + signal + ".start, " + signal + ".stop + " + signal + ".step, " + signal + ".step)" };
      }
      return vals$$1;
  }

  function parseUnitAxis(model) {
      return POSITION_SCALE_CHANNELS.reduce(function (axis, channel) {
          if (model.component.scales[channel] && model.axis(channel)) {
              axis[channel] = [parseAxis(channel, model)];
          }
          return axis;
      }, {});
  }
  var OPPOSITE_ORIENT = {
      bottom: 'top',
      top: 'bottom',
      left: 'right',
      right: 'left'
  };
  function parseLayerAxis(model) {
      var _a = model.component, axes = _a.axes, resolve = _a.resolve;
      var axisCount = { top: 0, bottom: 0, right: 0, left: 0 };
      for (var _i = 0, _b = model.children; _i < _b.length; _i++) {
          var child = _b[_i];
          child.parseAxisAndHeader();
          for (var _c = 0, _d = keys(child.component.axes); _c < _d.length; _c++) {
              var channel = _d[_c];
              resolve.axis[channel] = parseGuideResolve(model.component.resolve, channel);
              if (resolve.axis[channel] === 'shared') {
                  // If the resolve says shared (and has not been overridden)
                  // We will try to merge and see if there is a conflict
                  axes[channel] = mergeAxisComponents(axes[channel], child.component.axes[channel]);
                  if (!axes[channel]) {
                      // If merge returns nothing, there is a conflict so we cannot make the axis shared.
                      // Thus, mark axis as independent and remove the axis component.
                      resolve.axis[channel] = 'independent';
                      delete axes[channel];
                  }
              }
          }
      }
      // Move axes to layer's axis component and merge shared axes
      for (var _e = 0, _f = [X, Y]; _e < _f.length; _e++) {
          var channel = _f[_e];
          for (var _g = 0, _h = model.children; _g < _h.length; _g++) {
              var child = _h[_g];
              if (!child.component.axes[channel]) {
                  // skip if the child does not have a particular axis
                  continue;
              }
              if (resolve.axis[channel] === 'independent') {
                  // If axes are independent, concat the axisComponent array.
                  axes[channel] = (axes[channel] || []).concat(child.component.axes[channel]);
                  // Automatically adjust orient
                  for (var _j = 0, _k = child.component.axes[channel]; _j < _k.length; _j++) {
                      var axisComponent = _k[_j];
                      var _l = axisComponent.getWithExplicit('orient'), orient$$1 = _l.value, explicit = _l.explicit;
                      if (axisCount[orient$$1] > 0 && !explicit) {
                          // Change axis orient if the number do not match
                          var oppositeOrient = OPPOSITE_ORIENT[orient$$1];
                          if (axisCount[orient$$1] > axisCount[oppositeOrient]) {
                              axisComponent.set('orient', oppositeOrient, false);
                          }
                      }
                      axisCount[orient$$1]++;
                  }
              }
              // After merging, make sure to remove axes from child
              delete child.component.axes[channel];
          }
      }
  }
  function mergeAxisComponents(mergedAxisCmpts, childAxisCmpts) {
      if (mergedAxisCmpts) {
          // FIXME: this is a bit wrong once we support multiple axes
          if (mergedAxisCmpts.length !== childAxisCmpts.length) {
              return undefined; // Cannot merge axis component with different number of axes.
          }
          var length_1 = mergedAxisCmpts.length;
          for (var i = 0; i < length_1; i++) {
              var merged = mergedAxisCmpts[i];
              var child = childAxisCmpts[i];
              if ((!!merged) !== (!!child)) {
                  return undefined;
              }
              else if (merged && child) {
                  var mergedOrient = merged.getWithExplicit('orient');
                  var childOrient = child.getWithExplicit('orient');
                  if (mergedOrient.explicit && childOrient.explicit && mergedOrient.value !== childOrient.value) {
                      // TODO: throw warning if resolve is explicit (We don't have info about explicit/implicit resolve yet.)
                      // Cannot merge due to inconsistent orient
                      return undefined;
                  }
                  else {
                      mergedAxisCmpts[i] = mergeAxisComponent(merged, child);
                  }
              }
          }
      }
      else {
          // For first one, return a copy of the child
          return childAxisCmpts.map(function (axisComponent) { return axisComponent.clone(); });
      }
      return mergedAxisCmpts;
  }
  function mergeAxisComponent(merged, child) {
      var _loop_1 = function (prop) {
          var mergedValueWithExplicit = mergeValuesWithExplicit(merged.getWithExplicit(prop), child.getWithExplicit(prop), prop, 'axis', 
          // Tie breaker function
          function (v1, v2) {
              switch (prop) {
                  case 'title':
                      return mergeTitleComponent(v1, v2);
                  case 'gridScale':
                      return {
                          explicit: v1.explicit,
                          value: v1.value || v2.value
                      };
              }
              return defaultTieBreaker(v1, v2, prop, 'axis');
          });
          merged.setWithExplicit(prop, mergedValueWithExplicit);
      };
      for (var _i = 0, VG_AXIS_PROPERTIES_1 = VG_AXIS_PROPERTIES; _i < VG_AXIS_PROPERTIES_1.length; _i++) {
          var prop = VG_AXIS_PROPERTIES_1[_i];
          _loop_1(prop);
      }
      return merged;
  }
  function getFieldDefTitle(model, channel) {
      var channel2 = channel === 'x' ? 'x2' : 'y2';
      var fieldDef = model.fieldDef(channel);
      var fieldDef2 = model.fieldDef(channel2);
      var title1 = fieldDef ? fieldDef.title : undefined;
      var title2 = fieldDef2 ? fieldDef2.title : undefined;
      if (title1 && title2) {
          return mergeTitle(title1, title2);
      }
      else if (title1) {
          return title1;
      }
      else if (title2) {
          return title2;
      }
      else if (title1 !== undefined) { // falsy value to disable config
          return title1;
      }
      else if (title2 !== undefined) { // falsy value to disable config
          return title2;
      }
      return undefined;
  }
  function parseAxis(channel, model) {
      var axis = model.axis(channel);
      var axisComponent = new AxisComponent();
      // 1.2. Add properties
      VG_AXIS_PROPERTIES.forEach(function (property) {
          var value = getProperty$1(property, axis, channel, model);
          if (value !== undefined) {
              var explicit = 
              // specified axis.values is already respected, but may get transformed.
              property === 'values' ? !!axis.values :
                  // both VL axis.encoding and axis.labelAngle affect VG axis.encode
                  property === 'encode' ? !!axis.encoding || !!axis.labelAngle :
                      // title can be explicit if fieldDef.title is set
                      property === 'title' && value === getFieldDefTitle(model, channel) ? true :
                          // Otherwise, things are explicit if the returned value matches the specified property
                          value === axis[property];
              var configValue = getAxisConfig(property, model.config, channel, axisComponent.get('orient'), model.getScaleComponent(channel).get('type'));
              // only set property if it is explicitly set or has no config value (otherwise we will accidentally override config)
              if (explicit || configValue === undefined) {
                  // Do not apply implicit rule if there is a config value
                  axisComponent.set(property, value, explicit);
              }
              else if (property === 'grid' && configValue) {
                  // Grid is an exception because we need to set grid = true to generate another grid axis
                  axisComponent.set(property, configValue, false);
              }
          }
      });
      // 2) Add guide encode definition groups
      var axisEncoding = axis.encoding || {};
      var axisEncode = AXIS_PARTS.reduce(function (e, part) {
          if (!axisComponent.hasAxisPart(part)) {
              // No need to create encode for a disabled part.
              return e;
          }
          var axisEncodingPart = guideEncodeEntry(axisEncoding[part] || {}, model);
          var value = part === 'labels' ?
              labels$1(model, channel, axisEncodingPart, axisComponent.get('orient')) :
              axisEncodingPart;
          if (value !== undefined && keys(value).length > 0) {
              e[part] = { update: value };
          }
          return e;
      }, {});
      // FIXME: By having encode as one property, we won't have fine grained encode merging.
      if (keys(axisEncode).length > 0) {
          axisComponent.set('encode', axisEncode, !!axis.encoding || axis.labelAngle !== undefined);
      }
      return axisComponent;
  }
  function getProperty$1(property, specifiedAxis, channel, model) {
      var fieldDef = model.fieldDef(channel);
      switch (property) {
          case 'scale':
              return model.scaleName(channel);
          case 'gridScale':
              return gridScale(model, channel);
          case 'format':
              // We don't include temporal field here as we apply format in encode block
              return numberFormat(fieldDef, specifiedAxis.format, model.config);
          case 'grid': {
              var scaleType = model.getScaleComponent(channel).get('type');
              return getSpecifiedOrDefaultValue(specifiedAxis.grid, grid(scaleType, fieldDef));
          }
          case 'labelFlush':
              return labelFlush(fieldDef, channel, specifiedAxis);
          case 'labelOverlap': {
              var scaleType = model.getScaleComponent(channel).get('type');
              return labelOverlap(fieldDef, specifiedAxis, channel, scaleType);
          }
          case 'orient':
              return getSpecifiedOrDefaultValue(specifiedAxis.orient, orient(channel));
          case 'tickCount': {
              var scaleType = model.getScaleComponent(channel).get('type');
              var sizeType = channel === 'x' ? 'width' : channel === 'y' ? 'height' : undefined;
              var size = sizeType ? model.getSizeSignalRef(sizeType)
                  : undefined;
              return getSpecifiedOrDefaultValue(specifiedAxis.tickCount, tickCount(channel, fieldDef, scaleType, size));
          }
          case 'title':
              var channel2 = channel === 'x' ? 'x2' : 'y2';
              var fieldDef2 = model.fieldDef(channel2);
              // Keep undefined so we use default if title is unspecified.
              // For other falsy value, keep them so we will hide the title.
              var fieldDefTitle = getFieldDefTitle(model, channel);
              var specifiedTitle = fieldDefTitle !== undefined ? fieldDefTitle :
                  specifiedAxis.title === undefined ? undefined : specifiedAxis.title;
              return getSpecifiedOrDefaultValue(specifiedTitle, 
              // If title not specified, store base parts of fieldDef (and fieldDef2 if exists)
              mergeTitleFieldDefs([toFieldDefBase(fieldDef)], fieldDef2 ? [toFieldDefBase(fieldDef2)] : []));
          case 'values':
              return values$1(specifiedAxis, model, fieldDef, channel);
      }
      // Otherwise, return specified property.
      return isAxisProperty(property) ? specifiedAxis[property] : undefined;
  }

  function normalizeMarkDef(mark, encoding, config) {
      var markDef = isMarkDef(mark) ? __assign({}, mark) : { type: mark };
      // set orient, which can be overridden by rules as sometimes the specified orient is invalid.
      var specifiedOrient = markDef.orient || getMarkConfig('orient', markDef, config);
      markDef.orient = orient$1(markDef.type, encoding, specifiedOrient);
      if (specifiedOrient !== undefined && specifiedOrient !== markDef.orient) {
          warn(message.orientOverridden(markDef.orient, specifiedOrient));
      }
      // set opacity and filled if not specified in mark config
      var specifiedOpacity = markDef.opacity !== undefined ? markDef.opacity : getMarkConfig('opacity', markDef, config);
      if (specifiedOpacity === undefined) {
          markDef.opacity = defaultOpacity(markDef.type, encoding);
      }
      var specifiedFilled = markDef.filled;
      if (specifiedFilled === undefined) {
          markDef.filled = filled(markDef, config);
      }
      return markDef;
  }
  function defaultOpacity(mark, encoding) {
      if (contains([POINT, TICK, CIRCLE, SQUARE], mark)) {
          // point-based marks
          if (!isAggregate(encoding)) {
              return 0.7;
          }
      }
      return undefined;
  }
  function filled(markDef, config) {
      var filledConfig = getMarkConfig('filled', markDef, config);
      var mark = markDef.type;
      return filledConfig !== undefined ? filledConfig : mark !== POINT && mark !== LINE && mark !== RULE;
  }
  function orient$1(mark, encoding, specifiedOrient) {
      switch (mark) {
          case POINT:
          case CIRCLE:
          case SQUARE:
          case TEXT$1:
          case RECT:
              // orient is meaningless for these marks.
              return undefined;
      }
      var yIsRange = encoding.y2;
      var xIsRange = encoding.x2;
      switch (mark) {
          case BAR:
              if (yIsRange || xIsRange) {
                  // Ranged bar does not always have clear orientation, so we allow overriding
                  if (specifiedOrient) {
                      return specifiedOrient;
                  }
                  // If y is range and x is non-range, non-bin Q, y is likely a prebinned field
                  var xDef = encoding.x;
                  if (!xIsRange && isFieldDef(xDef) && xDef.type === QUANTITATIVE && !xDef.bin) {
                      return 'horizontal';
                  }
                  // If x is range and y is non-range, non-bin Q, x is likely a prebinned field
                  var yDef = encoding.y;
                  if (!yIsRange && isFieldDef(yDef) && yDef.type === QUANTITATIVE && !yDef.bin) {
                      return 'vertical';
                  }
              }
          /* tslint:disable */
          case RULE: // intentionally fall through
              // return undefined for line segment rule and bar with both axis ranged
              if (xIsRange && yIsRange) {
                  return undefined;
              }
          case AREA: // intentionally fall through
              // If there are range for both x and y, y (vertical) has higher precedence.
              if (yIsRange) {
                  return 'vertical';
              }
              else if (xIsRange) {
                  return 'horizontal';
              }
              else if (mark === RULE) {
                  if (encoding.x && !encoding.y) {
                      return 'vertical';
                  }
                  else if (encoding.y && !encoding.x) {
                      return 'horizontal';
                  }
              }
          case LINE: // intentional fall through
          case TICK: // Tick is opposite to bar, line, area and never have ranged mark.
              /* tslint:enable */
              var xIsContinuous = isFieldDef(encoding.x) && isContinuous(encoding.x);
              var yIsContinuous = isFieldDef(encoding.y) && isContinuous(encoding.y);
              if (xIsContinuous && !yIsContinuous) {
                  return mark !== 'tick' ? 'horizontal' : 'vertical';
              }
              else if (!xIsContinuous && yIsContinuous) {
                  return mark !== 'tick' ? 'vertical' : 'horizontal';
              }
              else if (xIsContinuous && yIsContinuous) {
                  var xDef = encoding.x; // we can cast here since they are surely fieldDef
                  var yDef = encoding.y;
                  var xIsTemporal = xDef.type === TEMPORAL;
                  var yIsTemporal = yDef.type === TEMPORAL;
                  // temporal without timeUnit is considered continuous, but better serves as dimension
                  if (xIsTemporal && !yIsTemporal) {
                      return mark !== 'tick' ? 'vertical' : 'horizontal';
                  }
                  else if (!xIsTemporal && yIsTemporal) {
                      return mark !== 'tick' ? 'horizontal' : 'vertical';
                  }
                  if (!xDef.aggregate && yDef.aggregate) {
                      return mark !== 'tick' ? 'vertical' : 'horizontal';
                  }
                  else if (xDef.aggregate && !yDef.aggregate) {
                      return mark !== 'tick' ? 'horizontal' : 'vertical';
                  }
                  if (specifiedOrient) {
                      // When ambiguous, use user specified one.
                      return specifiedOrient;
                  }
                  if (!(mark === LINE && encoding.order)) {
                      // Except for connected scatterplot, we should log warning for unclear orientation of QxQ plots.
                      warn(message.unclearOrientContinuous(mark));
                  }
                  return 'vertical';
              }
              else {
                  // For Discrete x Discrete case, return undefined.
                  warn(message.unclearOrientDiscreteOrEmpty(mark));
                  return undefined;
              }
      }
      return 'vertical';
  }

  var area = {
      vgMark: 'area',
      encodeEntry: function (model) {
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'include' }), pointPosition('x', model, 'zeroOrMin'), pointPosition('y', model, 'zeroOrMin'), pointPosition2(model, 'zeroOrMin', model.markDef.orient === 'horizontal' ? 'x2' : 'y2'), defined(model));
      }
  };

  var bar = {
      vgMark: 'rect',
      encodeEntry: function (model) {
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }), x(model), y(model));
      }
  };
  function x(model) {
      var config = model.config, encoding = model.encoding, markDef = model.markDef, width = model.width;
      var orient = markDef.orient;
      var sizeDef = encoding.size;
      var xDef = encoding.x;
      var x2Def = encoding.x2;
      var xScaleName = model.scaleName(X);
      var xScale = model.getScaleComponent(X);
      // x, x2, and width -- we must specify two of these in all conditions
      if (orient === 'horizontal' || x2Def) {
          return __assign({}, pointPosition('x', model, 'zeroOrMin'), pointPosition2(model, 'zeroOrMin', 'x2'));
      }
      else { // vertical
          if (isFieldDef(xDef)) {
              var xScaleType = xScale.get('type');
              if (xDef.bin && !sizeDef && !hasDiscreteDomain(xScaleType)) {
                  return binnedPosition(xDef, 'x', model.scaleName('x'), markDef.binSpacing === undefined ? config.bar.binSpacing : markDef.binSpacing, xScale.get('reverse'));
              }
              else {
                  if (xScaleType === ScaleType.BAND) {
                      return bandPosition(xDef, 'x', model);
                  }
              }
          }
          // sized bin, normal point-ordinal axis, quantitative x-axis, or no x
          return centeredBandPosition('x', model, __assign({}, mid(width)), defaultSizeRef(markDef, xScaleName, xScale, config));
      }
  }
  function y(model) {
      var config = model.config, encoding = model.encoding, height = model.height, markDef = model.markDef;
      var orient = markDef.orient;
      var sizeDef = encoding.size;
      var yDef = encoding.y;
      var y2Def = encoding.y2;
      var yScaleName = model.scaleName(Y);
      var yScale = model.getScaleComponent(Y);
      // y, y2 & height -- we must specify two of these in all conditions
      if (orient === 'vertical' || y2Def) {
          return __assign({}, pointPosition('y', model, 'zeroOrMin'), pointPosition2(model, 'zeroOrMin', 'y2'));
      }
      else {
          if (isFieldDef(yDef)) {
              var yScaleType = yScale.get('type');
              if (yDef.bin && !sizeDef && !hasDiscreteDomain(yScaleType)) {
                  return binnedPosition(yDef, 'y', model.scaleName('y'), markDef.binSpacing === undefined ? config.bar.binSpacing : markDef.binSpacing, yScale.get('reverse'));
              }
              else if (yScaleType === ScaleType.BAND) {
                  return bandPosition(yDef, 'y', model);
              }
          }
          return centeredBandPosition('y', model, mid(height), defaultSizeRef(markDef, yScaleName, yScale, config));
      }
  }
  function defaultSizeRef(markDef, scaleName, scale, config) {
      if (markDef.size !== undefined) {
          return { value: markDef.size };
      }
      else if (config.bar.discreteBandSize) {
          return { value: config.bar.discreteBandSize };
      }
      else if (scale) {
          var scaleType = scale.get('type');
          if (scaleType === ScaleType.POINT) {
              var scaleRange = scale.get('range');
              if (isVgRangeStep(scaleRange) && isNumber(scaleRange.step)) {
                  return { value: scaleRange.step - 1 };
              }
              warn(message.BAR_WITH_POINT_SCALE_AND_RANGESTEP_NULL);
          }
          else if (scaleType === ScaleType.BAND) {
              return bandRef(scaleName);
          }
          else { // non-ordinal scale
              return { value: config.bar.continuousBandSize };
          }
      }
      else if (config.scale.rangeStep && config.scale.rangeStep !== null) {
          return { value: config.scale.rangeStep - 1 };
      }
      return { value: 20 };
  }

  var geoshape = {
      vgMark: 'shape',
      encodeEntry: function (model) {
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }));
      },
      postEncodingTransform: function (model) {
          var encoding = model.encoding;
          var shapeDef = encoding.shape;
          var transform = __assign({ type: 'geoshape', projection: model.projectionName() }, (shapeDef && isFieldDef(shapeDef) && shapeDef.type === GEOJSON ? { field: vgField(shapeDef, { expr: 'datum' }) } : {}));
          return [transform];
      }
  };

  var line = {
      vgMark: 'line',
      encodeEntry: function (model) {
          var width = model.width, height = model.height;
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }), pointPosition('x', model, mid(width)), pointPosition('y', model, mid(height)), nonPosition('size', model, {
              vgChannel: 'strokeWidth' // VL's line size is strokeWidth
          }), defined(model));
      }
  };
  var trail = {
      vgMark: 'trail',
      encodeEntry: function (model) {
          var width = model.width, height = model.height;
          return __assign({}, baseEncodeEntry(model, { size: 'include', orient: 'ignore' }), pointPosition('x', model, mid(width)), pointPosition('y', model, mid(height)), nonPosition('size', model), defined(model));
      }
  };

  function encodeEntry(model, fixedShape) {
      var config = model.config, width = model.width, height = model.height;
      return __assign({}, baseEncodeEntry(model, { size: 'include', orient: 'ignore' }), pointPosition('x', model, mid(width)), pointPosition('y', model, mid(height)), nonPosition('size', model), shapeMixins(model, config, fixedShape));
  }
  function shapeMixins(model, config, fixedShape) {
      if (fixedShape) {
          return { shape: { value: fixedShape } };
      }
      return nonPosition('shape', model, { defaultValue: getMarkConfig('shape', model.markDef, config) });
  }
  var point = {
      vgMark: 'symbol',
      encodeEntry: function (model) {
          return encodeEntry(model);
      }
  };
  var circle = {
      vgMark: 'symbol',
      encodeEntry: function (model) {
          return encodeEntry(model, 'circle');
      }
  };
  var square = {
      vgMark: 'symbol',
      encodeEntry: function (model) {
          return encodeEntry(model, 'square');
      }
  };

  var rect = {
      vgMark: 'rect',
      encodeEntry: function (model) {
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }), x$1(model), y$1(model));
      }
  };
  function x$1(model) {
      var xDef = model.encoding.x;
      var x2Def = model.encoding.x2;
      var xScale = model.getScaleComponent(X);
      var xScaleType = xScale ? xScale.get('type') : undefined;
      if (isFieldDef(xDef) && xDef.bin && !x2Def) {
          return binnedPosition(xDef, 'x', model.scaleName('x'), 0, xScale.get('reverse'));
      }
      else if (isFieldDef(xDef) && xScale && hasDiscreteDomain(xScaleType)) {
          /* istanbul ignore else */
          if (xScaleType === ScaleType.BAND) {
              return bandPosition(xDef, 'x', model);
          }
          else {
              // We don't support rect mark with point/ordinal scale
              throw new Error(message.scaleTypeNotWorkWithMark(RECT, xScaleType));
          }
      }
      else { // continuous scale or no scale
          return __assign({}, pointPosition('x', model, 'zeroOrMax'), pointPosition2(model, 'zeroOrMin', 'x2'));
      }
  }
  function y$1(model) {
      var yDef = model.encoding.y;
      var y2Def = model.encoding.y2;
      var yScale = model.getScaleComponent(Y);
      var yScaleType = yScale ? yScale.get('type') : undefined;
      if (isFieldDef(yDef) && yDef.bin && !y2Def) {
          return binnedPosition(yDef, 'y', model.scaleName('y'), 0, yScale.get('reverse'));
      }
      else if (isFieldDef(yDef) && yScale && hasDiscreteDomain(yScaleType)) {
          /* istanbul ignore else */
          if (yScaleType === ScaleType.BAND) {
              return bandPosition(yDef, 'y', model);
          }
          else {
              // We don't support rect mark with point/ordinal scale
              throw new Error(message.scaleTypeNotWorkWithMark(RECT, yScaleType));
          }
      }
      else { // continuous scale or no scale
          return __assign({}, pointPosition('y', model, 'zeroOrMax'), pointPosition2(model, 'zeroOrMin', 'y2'));
      }
  }

  var rule = {
      vgMark: 'rule',
      encodeEntry: function (model) {
          var _config = model.config, markDef = model.markDef, width = model.width, height = model.height;
          var orient = markDef.orient;
          if (!model.encoding.x && !model.encoding.y && !model.encoding.latitude && !model.encoding.longitude) {
              // Show nothing if we have none of x, y, lat, and long.
              return {};
          }
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }), pointPosition('x', model, orient === 'horizontal' ? 'zeroOrMin' : mid(width)), pointPosition('y', model, orient === 'vertical' ? 'zeroOrMin' : mid(height)), (orient !== 'vertical' ? pointPosition2(model, 'zeroOrMax', 'x2') : {}), (orient !== 'horizontal' ? pointPosition2(model, 'zeroOrMax', 'y2') : {}), nonPosition('size', model, {
              vgChannel: 'strokeWidth',
              defaultValue: markDef.size
          }));
      }
  };

  var text$3 = {
      vgMark: 'text',
      encodeEntry: function (model) {
          var config = model.config, encoding = model.encoding, width = model.width, height = model.height, markDef = model.markDef;
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }), pointPosition('x', model, mid(width)), pointPosition('y', model, mid(height)), text$2(model), nonPosition('size', model, __assign({}, (markDef.size ? { defaultValue: markDef.size } : {}), { vgChannel: 'fontSize' // VL's text size is fontSize
           })), valueIfDefined('align', align(model.markDef, encoding, config)));
      }
  };
  function align(markDef, encoding, config) {
      var a = markDef.align || getMarkConfig('align', markDef, config);
      if (a === undefined) {
          return 'center';
      }
      // If there is a config, Vega-parser will process this already.
      return undefined;
  }

  var tick = {
      vgMark: 'rect',
      encodeEntry: function (model) {
          var config = model.config, markDef = model.markDef, width = model.width, height = model.height;
          var orient = markDef.orient;
          var vgSizeChannel = orient === 'horizontal' ? 'width' : 'height';
          var vgThicknessChannel = orient === 'horizontal' ? 'height' : 'width';
          return __assign({}, baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }), pointPosition('x', model, mid(width), 'xc'), pointPosition('y', model, mid(height), 'yc'), nonPosition('size', model, {
              defaultValue: defaultSize(model),
              vgChannel: vgSizeChannel
          }), (_a = {}, _a[vgThicknessChannel] = { value: markDef.thickness || config.tick.thickness }, _a));
          var _a;
      }
  };
  function defaultSize(model) {
      var config = model.config, markDef = model.markDef;
      var orient = markDef.orient;
      var scale = model.getScaleComponent(orient === 'horizontal' ? 'x' : 'y');
      if (markDef.size !== undefined) {
          return markDef.size;
      }
      else if (config.tick.bandSize !== undefined) {
          return config.tick.bandSize;
      }
      else {
          var scaleRange = scale ? scale.get('range') : undefined;
          var rangeStep = scaleRange && isVgRangeStep(scaleRange) ?
              scaleRange.step :
              config.scale.rangeStep;
          if (typeof rangeStep !== 'number') {
              // FIXME consolidate this log
              throw new Error('Function does not handle non-numeric rangeStep');
          }
          return rangeStep / 1.5;
      }
  }

  var markCompiler = {
      area: area,
      bar: bar,
      circle: circle,
      geoshape: geoshape,
      line: line,
      point: point,
      rect: rect,
      rule: rule,
      square: square,
      text: text$3,
      tick: tick,
      trail: trail
  };
  function parseMarkGroup(model) {
      if (contains([LINE, AREA, TRAIL], model.mark)) {
          return parsePathMark(model);
      }
      else {
          return getMarkGroups(model);
      }
  }
  var FACETED_PATH_PREFIX = 'faceted_path_';
  function parsePathMark(model) {
      var details = pathGroupingFields(model.mark, model.encoding);
      var pathMarks = getMarkGroups(model, {
          // If has subfacet for line/area group, need to use faceted data from below.
          fromPrefix: (details.length > 0 ? FACETED_PATH_PREFIX : '')
      });
      if (details.length > 0) { // have level of details - need to facet line into subgroups
          // TODO: for non-stacked plot, map order to zindex. (Maybe rename order for layer to zindex?)
          return [{
                  name: model.getName('pathgroup'),
                  type: 'group',
                  from: {
                      facet: {
                          name: FACETED_PATH_PREFIX + model.requestDataName(MAIN),
                          data: model.requestDataName(MAIN),
                          groupby: details,
                      }
                  },
                  encode: {
                      update: {
                          width: { field: { group: 'width' } },
                          height: { field: { group: 'height' } }
                      }
                  },
                  marks: pathMarks
              }];
      }
      else {
          return pathMarks;
      }
  }
  function getSort(model) {
      var encoding = model.encoding, stack = model.stack, mark = model.mark, markDef = model.markDef;
      var order = encoding.order;
      if (!isArray(order) && isValueDef(order)) {
          return undefined;
      }
      else if ((isArray(order) || isFieldDef(order)) && !stack) {
          // Sort by the order field if it is specified and the field is not stacked. (For stacked field, order specify stack order.)
          return sortParams(order, { expr: 'datum' });
      }
      else if (isPathMark(mark)) {
          // For both line and area, we sort values based on dimension by default
          var dimensionChannelDef = encoding[markDef.orient === 'horizontal' ? 'y' : 'x'];
          if (isFieldDef(dimensionChannelDef)) {
              var s = dimensionChannelDef.sort;
              var sortField = isSortField(s) ?
                  vgField({
                      // FIXME: this op might not already exist?
                      // FIXME: what if dimensionChannel (x or y) contains custom domain?
                      aggregate: isAggregate(model.encoding) ? s.op : undefined,
                      field: s.field
                  }, { expr: 'datum' }) :
                  vgField(dimensionChannelDef, {
                      // For stack with imputation, we only have bin_mid
                      binSuffix: model.stack && model.stack.impute ? 'mid' : undefined,
                      expr: 'datum'
                  });
              return {
                  field: sortField,
                  order: 'descending'
              };
          }
          return undefined;
      }
      return undefined;
  }
  function getMarkGroups(model, opt) {
      if (opt === void 0) { opt = { fromPrefix: '' }; }
      var mark = model.mark;
      var clip = model.markDef.clip !== undefined ?
          !!model.markDef.clip : scaleClip(model);
      var style = getStyles(model.markDef);
      var key$$1 = model.encoding.key;
      var sort = getSort(model);
      var postEncodingTransform = markCompiler[mark].postEncodingTransform ? markCompiler[mark].postEncodingTransform(model) : null;
      return [__assign({ name: model.getName('marks'), type: markCompiler[mark].vgMark }, (clip ? { clip: true } : {}), (style ? { style: style } : {}), (key$$1 ? { key: { field: key$$1.field } } : {}), (sort ? { sort: sort } : {}), { from: { data: opt.fromPrefix + model.requestDataName(MAIN) }, encode: {
                  update: markCompiler[mark].encodeEntry(model)
              } }, (postEncodingTransform ? {
              transform: postEncodingTransform
          } : {}))];
  }
  /**
   * Returns list of path grouping fields
   * that the model's spec contains.
   */
  function pathGroupingFields(mark, encoding) {
      return keys(encoding).reduce(function (details, channel) {
          switch (channel) {
              // x, y, x2, y2, lat, long, lat1, long2, order, tooltip, href, cursor should not cause lines to group
              case 'x':
              case 'y':
              case 'order':
              case 'tooltip':
              case 'href':
              case 'x2':
              case 'y2':
              case 'latitude':
              case 'longitude':
              case 'latitude2':
              case 'longitude2':
              // TODO: case 'cursor':
              // text, shape, shouldn't be a part of line/trail/area
              case 'text':
              case 'shape':
                  return details;
              case 'detail':
              case 'key':
                  var channelDef = encoding[channel];
                  if (channelDef) {
                      (isArray(channelDef) ? channelDef : [channelDef]).forEach(function (fieldDef) {
                          if (!fieldDef.aggregate) {
                              details.push(vgField(fieldDef, {}));
                          }
                      });
                  }
                  return details;
              case 'size':
                  if (mark === 'trail') {
                      // For trail, size should not group trail lines.
                      return details;
                  }
              // For line, it should group lines.
              /* tslint:disable */
              // intentional fall through
              case 'color':
              case 'fill':
              case 'stroke':
              case 'opacity':
                  // TODO strokeDashOffset:
                  /* tslint:enable */
                  var fieldDef = getFieldDef(encoding[channel]);
                  if (fieldDef && !fieldDef.aggregate) {
                      details.push(vgField(fieldDef, {}));
                  }
                  return details;
              default:
                  throw new Error("Bug: Channel " + channel + " unimplemented for line mark");
          }
      }, []);
  }
  /**
   * If scales are bound to interval selections, we want to automatically clip
   * marks to account for panning/zooming interactions. We identify bound scales
   * by the domainRaw property, which gets added during scale parsing.
   */
  function scaleClip(model) {
      var xScale = model.getScaleComponent('x');
      var yScale = model.getScaleComponent('y');
      return (xScale && xScale.get('domainRaw')) ||
          (yScale && yScale.get('domainRaw')) ? true : false;
  }

  /**
   * Internal model of Vega-Lite specification for the compiler.
   */
  var UnitModel = /** @class */ (function (_super) {
      __extends(UnitModel, _super);
      function UnitModel(spec, parent, parentGivenName, parentGivenSize, repeater, config, fit) {
          if (parentGivenSize === void 0) { parentGivenSize = {}; }
          var _this = _super.call(this, spec, parent, parentGivenName, config, repeater, undefined) || this;
          _this.fit = fit;
          _this.type = 'unit';
          _this.specifiedScales = {};
          _this.specifiedAxes = {};
          _this.specifiedLegends = {};
          _this.specifiedProjection = {};
          _this.selection = {};
          _this.children = [];
          _this.initSize(__assign({}, parentGivenSize, (spec.width ? { width: spec.width } : {}), (spec.height ? { height: spec.height } : {})));
          var mark = isMarkDef(spec.mark) ? spec.mark.type : spec.mark;
          var encoding = _this.encoding = normalizeEncoding(replaceRepeaterInEncoding(spec.encoding || {}, repeater), mark);
          _this.markDef = normalizeMarkDef(spec.mark, encoding, config);
          // calculate stack properties
          _this.stack = stack(mark, encoding, _this.config.stack);
          _this.specifiedScales = _this.initScales(mark, encoding);
          _this.specifiedAxes = _this.initAxes(encoding);
          _this.specifiedLegends = _this.initLegend(encoding);
          _this.specifiedProjection = spec.projection;
          // Selections will be initialized upon parse.
          _this.selection = spec.selection;
          return _this;
      }
      Object.defineProperty(UnitModel.prototype, "hasProjection", {
          get: function () {
              var encoding = this.encoding;
              var isGeoShapeMark = this.mark === GEOSHAPE;
              var hasGeoPosition = encoding && GEOPOSITION_CHANNELS.some(function (channel) { return isFieldDef(encoding[channel]); });
              return isGeoShapeMark || hasGeoPosition;
          },
          enumerable: true,
          configurable: true
      });
      /**
       * Return specified Vega-lite scale domain for a particular channel
       * @param channel
       */
      UnitModel.prototype.scaleDomain = function (channel) {
          var scale = this.specifiedScales[channel];
          return scale ? scale.domain : undefined;
      };
      UnitModel.prototype.axis = function (channel) {
          return this.specifiedAxes[channel];
      };
      UnitModel.prototype.legend = function (channel) {
          return this.specifiedLegends[channel];
      };
      UnitModel.prototype.initScales = function (mark, encoding) {
          return SCALE_CHANNELS.reduce(function (scales, channel) {
              var fieldDef;
              var specifiedScale;
              var channelDef = encoding[channel];
              if (isFieldDef(channelDef)) {
                  fieldDef = channelDef;
                  specifiedScale = channelDef.scale;
              }
              else if (hasConditionalFieldDef(channelDef)) {
                  fieldDef = channelDef.condition;
                  specifiedScale = channelDef.condition['scale'];
              }
              else if (channel === 'x') {
                  fieldDef = getFieldDef(encoding.x2);
              }
              else if (channel === 'y') {
                  fieldDef = getFieldDef(encoding.y2);
              }
              if (fieldDef) {
                  scales[channel] = specifiedScale || {};
              }
              return scales;
          }, {});
      };
      UnitModel.prototype.initAxes = function (encoding) {
          return [X, Y].reduce(function (_axis, channel) {
              // Position Axis
              // TODO: handle ConditionFieldDef
              var channelDef = encoding[channel];
              if (isFieldDef(channelDef) ||
                  (channel === X && isFieldDef(encoding.x2)) ||
                  (channel === Y && isFieldDef(encoding.y2))) {
                  var axisSpec = isFieldDef(channelDef) ? channelDef.axis : null;
                  // We no longer support false in the schema, but we keep false here for backward compatibility.
                  if (axisSpec !== null && axisSpec !== false) {
                      _axis[channel] = __assign({}, axisSpec);
                  }
              }
              return _axis;
          }, {});
      };
      UnitModel.prototype.initLegend = function (encoding) {
          return NONPOSITION_SCALE_CHANNELS.reduce(function (_legend, channel) {
              var channelDef = encoding[channel];
              if (channelDef) {
                  var legend = isFieldDef(channelDef) ? channelDef.legend :
                      (hasConditionalFieldDef(channelDef)) ? channelDef.condition['legend'] : null;
                  if (legend !== null && legend !== false) {
                      _legend[channel] = __assign({}, legend);
                  }
              }
              return _legend;
          }, {});
      };
      UnitModel.prototype.parseData = function () {
          this.component.data = parseData(this);
      };
      UnitModel.prototype.parseLayoutSize = function () {
          parseUnitLayoutSize(this);
      };
      UnitModel.prototype.parseSelection = function () {
          this.component.selection = parseUnitSelection(this, this.selection);
      };
      UnitModel.prototype.parseMarkGroup = function () {
          this.component.mark = parseMarkGroup(this);
      };
      UnitModel.prototype.parseAxisAndHeader = function () {
          this.component.axes = parseUnitAxis(this);
      };
      UnitModel.prototype.assembleSelectionTopLevelSignals = function (signals) {
          return assembleTopLevelSignals(this, signals);
      };
      UnitModel.prototype.assembleSelectionSignals = function () {
          return assembleUnitSelectionSignals(this, []);
      };
      UnitModel.prototype.assembleSelectionData = function (data) {
          return assembleUnitSelectionData(this, data);
      };
      UnitModel.prototype.assembleLayout = function () {
          return null;
      };
      UnitModel.prototype.assembleLayoutSignals = function () {
          return assembleLayoutSignals(this);
      };
      UnitModel.prototype.assembleMarks = function () {
          var marks = this.component.mark || [];
          // If this unit is part of a layer, selections should augment
          // all in concert rather than each unit individually. This
          // ensures correct interleaving of clipping and brushed marks.
          if (!this.parent || !isLayerModel(this.parent)) {
              marks = assembleUnitSelectionMarks(this, marks);
          }
          return marks.map(this.correctDataNames);
      };
      UnitModel.prototype.assembleLayoutSize = function () {
          return {
              width: this.getSizeSignalRef('width'),
              height: this.getSizeSignalRef('height')
          };
      };
      UnitModel.prototype.getMapping = function () {
          return this.encoding;
      };
      UnitModel.prototype.toSpec = function (excludeConfig, excludeData) {
          var encoding = duplicate(this.encoding);
          var spec;
          spec = {
              mark: this.markDef,
              encoding: encoding
          };
          if (!excludeConfig) {
              spec.config = duplicate(this.config);
          }
          if (!excludeData) {
              spec.data = duplicate(this.data);
          }
          // remove defaults
          return spec;
      };
      Object.defineProperty(UnitModel.prototype, "mark", {
          get: function () {
              return this.markDef.type;
          },
          enumerable: true,
          configurable: true
      });
      UnitModel.prototype.channelHasField = function (channel) {
          return channelHasField(this.encoding, channel);
      };
      UnitModel.prototype.fieldDef = function (channel) {
          var channelDef = this.encoding[channel];
          return getFieldDef(channelDef);
      };
      return UnitModel;
  }(ModelWithField));

  var LayerModel = /** @class */ (function (_super) {
      __extends(LayerModel, _super);
      function LayerModel(spec, parent, parentGivenName, parentGivenSize, repeater, config, fit) {
          var _this = _super.call(this, spec, parent, parentGivenName, config, repeater, spec.resolve) || this;
          _this.type = 'layer';
          var layoutSize = __assign({}, parentGivenSize, (spec.width ? { width: spec.width } : {}), (spec.height ? { height: spec.height } : {}));
          _this.initSize(layoutSize);
          _this.children = spec.layer.map(function (layer, i) {
              if (isLayerSpec(layer)) {
                  return new LayerModel(layer, _this, _this.getName('layer_' + i), layoutSize, repeater, config, fit);
              }
              if (isUnitSpec(layer)) {
                  return new UnitModel(layer, _this, _this.getName('layer_' + i), layoutSize, repeater, config, fit);
              }
              throw new Error(message.INVALID_SPEC);
          });
          return _this;
      }
      LayerModel.prototype.parseData = function () {
          this.component.data = parseData(this);
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              child.parseData();
          }
      };
      LayerModel.prototype.parseLayoutSize = function () {
          parseLayerLayoutSize(this);
      };
      LayerModel.prototype.parseSelection = function () {
          var _this = this;
          // Merge selections up the hierarchy so that they may be referenced
          // across unit specs. Persist their definitions within each child
          // to assemble signals which remain within output Vega unit groups.
          this.component.selection = {};
          var _loop_1 = function (child) {
              child.parseSelection();
              keys(child.component.selection).forEach(function (key) {
                  _this.component.selection[key] = child.component.selection[key];
              });
          };
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              _loop_1(child);
          }
      };
      LayerModel.prototype.parseMarkGroup = function () {
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              child.parseMarkGroup();
          }
      };
      LayerModel.prototype.parseAxisAndHeader = function () {
          parseLayerAxis(this);
      };
      LayerModel.prototype.assembleSelectionTopLevelSignals = function (signals) {
          return this.children.reduce(function (sg, child) { return child.assembleSelectionTopLevelSignals(sg); }, signals);
      };
      // TODO: Support same named selections across children.
      LayerModel.prototype.assembleSelectionSignals = function () {
          return this.children.reduce(function (signals, child) {
              return signals.concat(child.assembleSelectionSignals());
          }, []);
      };
      LayerModel.prototype.assembleLayoutSignals = function () {
          return this.children.reduce(function (signals, child) {
              return signals.concat(child.assembleLayoutSignals());
          }, assembleLayoutSignals(this));
      };
      LayerModel.prototype.assembleSelectionData = function (data) {
          return this.children.reduce(function (db, child) { return child.assembleSelectionData(db); }, data);
      };
      LayerModel.prototype.assembleTitle = function () {
          var title = _super.prototype.assembleTitle.call(this);
          if (title) {
              return title;
          }
          // If title does not provide layer, look into children
          for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
              var child = _a[_i];
              title = child.assembleTitle();
              if (title) {
                  return title;
              }
          }
          return undefined;
      };
      LayerModel.prototype.assembleLayout = function () {
          return null;
      };
      LayerModel.prototype.assembleMarks = function () {
          return assembleLayerSelectionMarks(this, flatten(this.children.map(function (child) {
              return child.assembleMarks();
          })));
      };
      LayerModel.prototype.assembleLegends = function () {
          return this.children.reduce(function (legends, child) {
              return legends.concat(child.assembleLegends());
          }, assembleLegends(this));
      };
      return LayerModel;
  }(Model));

  var RepeatModel = /** @class */ (function (_super) {
      __extends(RepeatModel, _super);
      function RepeatModel(spec, parent, parentGivenName, repeatValues, config) {
          var _this = _super.call(this, spec, parent, parentGivenName, config, repeatValues, spec.resolve) || this;
          _this.type = 'repeat';
          if (spec.resolve && spec.resolve.axis && (spec.resolve.axis.x === 'shared' || spec.resolve.axis.y === 'shared')) {
              warn(message.REPEAT_CANNOT_SHARE_AXIS);
          }
          _this.repeat = spec.repeat;
          _this.children = _this._initChildren(spec, _this.repeat, repeatValues, config);
          return _this;
      }
      RepeatModel.prototype._initChildren = function (spec, repeat, repeater, config) {
          var children = [];
          var row = repeat.row || [repeater ? repeater.row : null];
          var column = repeat.column || [repeater ? repeater.column : null];
          // cross product
          for (var _i = 0, row_1 = row; _i < row_1.length; _i++) {
              var rowField = row_1[_i];
              for (var _a = 0, column_1 = column; _a < column_1.length; _a++) {
                  var columnField = column_1[_a];
                  var name_1 = (rowField ? '_' + rowField : '') + (columnField ? '_' + columnField : '');
                  var childRepeat = {
                      row: rowField,
                      column: columnField
                  };
                  children.push(buildModel(spec.spec, this, this.getName('child' + name_1), undefined, childRepeat, config, false));
              }
          }
          return children;
      };
      RepeatModel.prototype.parseLayoutSize = function () {
          parseRepeatLayoutSize(this);
      };
      RepeatModel.prototype.assembleLayout = function () {
          // TODO: allow customization
          return {
              padding: { row: 10, column: 10 },
              offset: 10,
              columns: this.repeat && this.repeat.column ? this.repeat.column.length : 1,
              bounds: 'full',
              align: 'all'
          };
      };
      return RepeatModel;
  }(BaseConcatModel));

  function buildModel(spec, parent, parentGivenName, unitSize, repeater, config, fit) {
      if (isFacetSpec(spec)) {
          return new FacetModel(spec, parent, parentGivenName, repeater, config);
      }
      if (isLayerSpec(spec)) {
          return new LayerModel(spec, parent, parentGivenName, unitSize, repeater, config, fit);
      }
      if (isUnitSpec(spec)) {
          return new UnitModel(spec, parent, parentGivenName, unitSize, repeater, config, fit);
      }
      if (isRepeatSpec(spec)) {
          return new RepeatModel(spec, parent, parentGivenName, repeater, config);
      }
      if (isConcatSpec(spec)) {
          return new ConcatModel(spec, parent, parentGivenName, repeater, config);
      }
      throw new Error(message.INVALID_SPEC);
  }

  /**
   * Vega-Lite's main function, for compiling Vega-lite spec into Vega spec.
   *
   * At a high-level, we make the following transformations in different phases:
   *
   * Input spec
   *     |
   *     |  (Normalization)
   *     v
   * Normalized Spec (Row/Column channels in single-view specs becomes faceted specs, composite marks becomes layered specs.)
   *     |
   *     |  (Build Model)
   *     v
   * A model tree of the spec
   *     |
   *     |  (Parse)
   *     v
   * A model tree with parsed components (intermediate structure of visualization primitives in a format that can be easily merged)
   *     |
   *     | (Optimize)
   *     v
   * A model tree with parsed components with the data component optimized
   *     |
   *     | (Assemble)
   *     v
   * Vega spec
   */
  function compile(inputSpec, opt) {
      if (opt === void 0) { opt = {}; }
      // 0. Augment opt with default opts
      if (opt.logger) {
          // set the singleton logger to the provided logger
          set(opt.logger);
      }
      if (opt.fieldTitle) {
          // set the singleton field title formatter
          setTitleFormatter(opt.fieldTitle);
      }
      try {
          // 1. Initialize config by deep merging default config with the config provided via option and the input spec.
          var config = initConfig(mergeDeep({}, opt.config, inputSpec.config));
          // 2. Normalize: Convert input spec -> normalized spec
          // - Decompose all extended unit specs into composition of unit spec.  For example, a box plot get expanded into multiple layers of bars, ticks, and rules. The shorthand row/column channel is also expanded to a facet spec.
          var spec = normalize$2(inputSpec, config);
          // - Normalize autosize to be a autosize properties object.
          var autosize = normalizeAutoSize(inputSpec.autosize, config.autosize, isLayerSpec(spec) || isUnitSpec(spec));
          // 3. Build Model: normalized spec -> Model (a tree structure)
          // This phases instantiates the models with default config by doing a top-down traversal. This allows us to pass properties that child models derive from their parents via their constructors.
          // See the abstract `Model` class and its children (UnitModel, LayerModel, FacetModel, RepeatModel, ConcatModel) for different types of models.
          var model = buildModel(spec, null, '', undefined, undefined, config, autosize.type === 'fit');
          // 4 Parse: Model --> Model with components
          // Note that components = intermediate representations that are equivalent to Vega specs.
          // We need these intermediate representation because we need to merge many visualizaiton "components" like projections, scales, axes, and legends.
          // We will later convert these components into actual Vega specs in the assemble phase.
          // In this phase, we do a bottom-up traversal over the whole tree to
          // parse for each type of components once (e.g., data, layout, mark, scale).
          // By doing bottom-up traversal, we start parsing components of unit specs and
          // then merge child components of parent composite specs.
          //
          // Please see inside model.parse() for order of different components parsed.
          model.parse();
          // 5. Optimize the dataflow.  This will modify the data component of the model.
          optimizeDataflow(model.component.data);
          // 6. Assemble: convert model components --> Vega Spec.
          return assembleTopLevelModel(model, getTopLevelProperties(inputSpec, config, autosize));
      }
      finally {
          // Reset the singleton logger if a logger is provided
          if (opt.logger) {
              reset();
          }
          // Reset the singleton field title formatter if provided
          if (opt.fieldTitle) {
              resetTitleFormatter();
          }
      }
  }
  function getTopLevelProperties(topLevelSpec, config, autosize) {
      return __assign({ autosize: keys(autosize).length === 1 && autosize.type ? autosize.type : autosize }, extractTopLevelProperties(config), extractTopLevelProperties(topLevelSpec));
  }
  /*
   * Assemble the top-level model.
   *
   * Note: this couldn't be `model.assemble()` since the top-level model
   * needs some special treatment to generate top-level properties.
   */
  function assembleTopLevelModel(model, topLevelProperties) {
      // TODO: change type to become VgSpec
      // Config with Vega-Lite only config removed.
      var vgConfig = model.config ? stripAndRedirectConfig(model.config) : undefined;
      var data = [].concat(model.assembleSelectionData([]), 
      // only assemble data in the root
      assembleRootData(model.component.data, topLevelProperties.datasets || {}));
      delete topLevelProperties.datasets;
      var projections = model.assembleProjections();
      var title$$1 = model.assembleTitle();
      var style = model.assembleGroupStyle();
      var layoutSignals = model.assembleLayoutSignals();
      // move width and height signals with values to top level
      layoutSignals = layoutSignals.filter(function (signal) {
          if ((signal.name === 'width' || signal.name === 'height') && signal.value !== undefined) {
              topLevelProperties[signal.name] = +signal.value;
              return false;
          }
          return true;
      });
      var output = __assign({ $schema: 'https://vega.github.io/schema/vega/v3.json' }, (model.description ? { description: model.description } : {}), topLevelProperties, (title$$1 ? { title: title$$1 } : {}), (style ? { style: style } : {}), { data: data }, (projections.length > 0 ? { projections: projections } : {}), model.assembleGroup(layoutSignals.concat(model.assembleSelectionTopLevelSignals([]))), (vgConfig ? { config: vgConfig } : {}));
      return {
          spec: output
          // TODO: add warning / errors here
      };
  }



  var facet = /*#__PURE__*/Object.freeze({

  });

  /**
   * Required Encoding Channels for each mark type
   */
  var DEFAULT_REQUIRED_CHANNEL_MAP = {
      text: ['text'],
      line: ['x', 'y'],
      trail: ['x', 'y'],
      area: ['x', 'y']
  };
  /**
   * Supported Encoding Channel for each mark type
   */
  var DEFAULT_SUPPORTED_CHANNEL_TYPE = {
      bar: toSet(['row', 'column', 'x', 'y', 'size', 'color', 'fill', 'stroke', 'detail']),
      line: toSet(['row', 'column', 'x', 'y', 'color', 'fill', 'stroke', 'color', 'detail']),
      trail: toSet(['row', 'column', 'x', 'y', 'color', 'fill', 'stroke', 'color', 'detail', 'size']),
      area: toSet(['row', 'column', 'x', 'y', 'color', 'fill', 'stroke', 'detail']),
      tick: toSet(['row', 'column', 'x', 'y', 'color', 'fill', 'stroke', 'detail']),
      circle: toSet(['row', 'column', 'x', 'y', 'color', 'fill', 'stroke', 'size', 'detail']),
      square: toSet(['row', 'column', 'x', 'y', 'color', 'fill', 'stroke', 'size', 'detail']),
      point: toSet(['row', 'column', 'x', 'y', 'color', 'fill', 'stroke', 'size', 'detail', 'shape']),
      geoshape: toSet(['row', 'column', 'color', 'fill', 'stroke', 'detail', 'shape']),
      text: toSet(['row', 'column', 'size', 'color', 'fill', 'stroke', 'text']) // TODO(#724) revise
  };
  // TODO: consider if we should add validate method and
  // requires ZSchema in the main vega-lite repo
  /**
   * Further check if encoding mapping of a spec is invalid and
   * return error if it is invalid.
   *
   * This checks if
   * (1) all the required encoding channels for the mark type are specified
   * (2) all the specified encoding channels are supported by the mark type
   * @param  {[type]} spec [description]
   * @param  {RequiredChannelMap = DefaultRequiredChannelMap}  requiredChannelMap
   * @param  {SupportedChannelMap = DefaultSupportedChannelMap} supportedChannelMap
   * @return {String} Return one reason why the encoding is invalid,
   *                  or null if the encoding is valid.
   */
  function getEncodingMappingError(spec, requiredChannelMap, supportedChannelMap) {
      if (requiredChannelMap === void 0) { requiredChannelMap = DEFAULT_REQUIRED_CHANNEL_MAP; }
      if (supportedChannelMap === void 0) { supportedChannelMap = DEFAULT_SUPPORTED_CHANNEL_TYPE; }
      var mark = isMarkDef(spec.mark) ? spec.mark.type : spec.mark;
      var encoding = spec.encoding;
      var requiredChannels = requiredChannelMap[mark];
      var supportedChannels = supportedChannelMap[mark];
      for (var i in requiredChannels) { // all required channels are in encoding`
          if (!(requiredChannels[i] in encoding)) {
              return 'Missing encoding channel \"' + requiredChannels[i] +
                  '\" for mark \"' + mark + '\"';
          }
      }
      for (var channel in encoding) { // all channels in encoding are supported
          if (!supportedChannels[channel]) {
              return 'Encoding channel \"' + channel +
                  '\" is not supported by mark type \"' + mark + '\"';
          }
      }
      if (mark === BAR && !encoding.x && !encoding.y) {
          return 'Missing both x and y for bar';
      }
      return null;
  }

  var validate = /*#__PURE__*/Object.freeze({
    DEFAULT_REQUIRED_CHANNEL_MAP: DEFAULT_REQUIRED_CHANNEL_MAP,
    DEFAULT_SUPPORTED_CHANNEL_TYPE: DEFAULT_SUPPORTED_CHANNEL_TYPE,
    getEncodingMappingError: getEncodingMappingError
  });

  var version = "2.5.0";

  exports.aggregate = aggregate;
  exports.axis = axis;
  exports.bin = bin;
  exports.channel = channel;
  exports.compositeMark = index;
  exports.config = config;
  exports.data = data;
  exports.datetime = datetime;
  exports.encoding = encoding;
  exports.facet = facet;
  exports.fieldDef = fielddef;
  exports.legend = legend;
  exports.mark = mark;
  exports.scale = scale;
  exports.sort = sort;
  exports.spec = spec;
  exports.stack = stack$1;
  exports.timeUnit = timeunit;
  exports.transform = transform;
  exports.type = type;
  exports.util = util;
  exports.validate = validate;
  exports.compile = compile;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=vega-lite.js.map
