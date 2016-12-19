/*!
 * v-validator.js v0.0.1
 * (c) 2016 JounQin <admin@1stg.me>
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VValidator = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var trueType = function trueType(value) {
  return [].slice.call({}.toString.call(value), 8, -1).join('');
};

var trueTypeFunc = function trueTypeFunc(type) {
  return function (value) {
    return type === trueType(value);
  };
};

var isArray = trueTypeFunc('Array');
var isFunction = trueTypeFunc('Function');
var isObjectLike = function isObjectLike(val) {
  return val != null && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
};

var log = function log(msg) {
  return "development" !== 'production' && console && console.log(msg);
};
var warn = function warn(msg) {
  return "development" !== 'production' && console && console.warn(msg);
};

var length = function length(len) {
  return function (val, model) {
    maxLength(len).call(this, val, model);
    return !!val && val.length === len;
  };
};

var minLength = function minLength(min) {
  return function (val) {
    return !!val && val.length >= min;
  };
};

var maxLength = function maxLength(max) {
  return function (val, model) {
    if (!val) return false;
    var valid = val.length <= max;
    if (!valid && model) this[model] = this[model].toString().substr(0, max);
    return valid;
  };
};

var mobile = function mobile(flag) {
  return function (val, model) {
    maxLength(11).call(this, val, model);
    return !!flag === /^1[35789]\d{9}$/.test(val);
  };
};

var validators = Object.freeze({
	length: length,
	minLength: minLength,
	maxLength: maxLength,
	mobile: mobile
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var applyRule = function applyRule(model, rule) {
  var modelVal = this[model];
  var validation = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.entries(rule)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          ruleKey = _step$value[0],
          ruleVal = _step$value[1];

      if (isFunction(ruleVal)) {
        validation[ruleKey] = ruleVal.call(this, modelVal);
        continue;
      }

      var validator = validators[ruleKey];

      if (!isFunction(validator)) {
        warn('there is no validator named ' + ruleKey + ', it will be ignored!');
        continue;
      }

      ruleVal = isArray(ruleVal) ? ruleVal : [ruleVal];
      validation[ruleKey] = validator.apply(undefined, _toConsumableArray(ruleVal)).call(this, modelVal, model);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var vModel = this.$v[model];

  Object.assign(vModel, validation);

  vModel.$invalid = Object.values(validation).some(function (v) {
    return !v;
  });
  vModel.$error = vModel.$dirty && vModel.$invalid;
};

var installed = false;

var index = (function (Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (installed) return Vue.util.warn('do not try to install plugin v-validator twice!');

  installed = true;

  log('plugin v-validator is installed!');

  Object.assign(validators, options.validators);

  var defineReactive = Vue.util.defineReactive;

  Vue.mixin({
    beforeCreate: function beforeCreate() {
      var _this = this;

      var validator = this.$options.validator;
      if (!validator) return;

      if (isFunction(validator)) validator = validator.call(this);

      validator.rules || (validator = { rules: validator });

      var rules = validator.rules;
      var auto = !!validator.auto;

      if (!isObjectLike(rules)) return warn('rules of validator should be an object');

      defineReactive(this, '$v', {});

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop = function _loop() {
          var _step2$value = _slicedToArray(_step2.value, 2),
              model = _step2$value[0],
              rule = _step2$value[1];

          defineReactive(_this.$v, model, {
            $dirty: auto,
            $error: false,
            $invalid: false
          });

          var vModel = _this.$v[model];

          Object.assign(vModel, {
            $touch: function $touch() {
              if (vModel.$dirty) return;

              vModel.$dirty = true;
              applyRule.call(_this, model, rule);
            },
            $reset: function $reset() {
              if (!vModel.$dirty) return;

              vModel.$dirty = false;
              applyRule.call(_this, model, rule);
            }
          });

          Vue.nextTick(function () {
            _this.$watch(model, function () {
              auto && (vModel.$dirty = true);
              applyRule.call(_this, model, rule);
            });

            vModel[auto ? '$touch' : '$reset']();
          });
        };

        for (var _iterator2 = Object.entries(rules)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  });
});

return index;

})));
