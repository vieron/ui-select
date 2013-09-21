var Emitter = require('emitter')
  , domify = require('domify')
  , classes = require('classes')
  , query = require('query')
  , events = require('events')
  , indexOf = require('indexof')
  , keyname = require('keyname')
  , scrolltop = require('scrolltop')
  , bind = require('bind')
  , data = require('data');

/**
 * Select constructor
 */

function UISelect (select, options) {
  this.fromSelect = select && select.tagName == 'SELECT';

  this.fromSelect && (this.selectEl = select);
  options = options || select;

  this.options = {};
  this.selectable = [];
  this.closed = true;
  this.val = undefined;
  this._group = undefined;
  this.placeholder = options.placeholder || '';
  this.searchable = options.search;
  this.tabindex = options.tabindex || UISelect.tabindex++;

  this.init();
}

UISelect.tabindex = 1;

var fn = UISelect.prototype;

/*
 * Inherit from emitter
*/

Emitter(fn);

fn.init = function() {

  if (this.fromSelect) {
    classes(this.selectEl).add('ui-select-hidden');
    this.selectEl.setAttribute('tabindex', -1);
  }

  this.windowEvents = events(window, this);
  this.render();
  this.events = events(this.el, this);

  if (this.fromSelect) {
    this.buildFromSelect();
    this.insertBefore();
  }

  this.el.setAttribute('tabindex', this.tabindex);

  this.bind();
};


fn.addOptionsFromSelect = function(parent) {
  var opts, o, j, jl;
  opts = parent.querySelectorAll('option');
  for (j = 0, jl = opts.length; j < jl; j++) {
    o = opts[j];
    this.add( o.value, o.innerHTML);
  }
};

fn.buildFromSelect = function() {
  var i, l;
  var optgroups = this.selectEl.querySelectorAll('optgroup');

  if (optgroups.length) {
    for (i = 0, l = optgroups.length; i < l; i++) {
      this.group(optgroups[i].label);
      this.addOptionsFromSelect(optgroups[i]);
    }
  } else {
    this.addOptionsFromSelect(this.selectEl);
  }

  return this;
};


/**
 * Render html
 */

fn.render = function () {
  var template = require('./templates/select.html');
  this.el = domify(template);
  this.list = query('.ui-select-options', this.el);
  this.input = query('.ui-select-search', this.el);
  this.classes = classes(this.el);

  this.label = query('.ui-select-label', this.el);
  this.label.innerHTML = this.placeholder;

  if (this.searchable)
    this.addClass('ui-select-searchable');

  return this;
};

/**
 * Bind events
 */

fn.bind = function () {
  var self = this;
  var setFocus = function(e) {
    var el = e.target;
    self.setFocus(data(el).get('value'));
  };

  var select = function(e) {
    stopPropagation(e);
    var el = e.target;
    self.select(data(el).get('value'));
  };

  this.events.bind('keypress', 'onkeypress');
  this.events.bind('keydown', 'onkeydown');
  this.events.bind('mousedown', stopPropagation);
  this.events.bind('mouseup', stopPropagation);
  this.events.bind('keyup', 'onkeyup');
  this.events.bind('change', 'onkeyup');
  this.events.bind('mousedown', 'toggle');

  this.events.bind('mouseup .ui-select-selectable', select);
  this.events.bind('mousedown .ui-select-selectable', select);
  this.events.bind('mouseover .ui-select-selectable', setFocus);

  return this;
};

/**
 * Unbind events
 */

fn.unbind = function () {
  this.events.unbind('keypress');
  this.events.unbind('keydown');
  this.events.unbind('keyup');
  this.events.unbind('change');
  this.events.unbind('mousedown');
  this.events.unbind('mouseup');
  this.events.unbind('mouseover');

  return this.unbindOutside();
};


/**
 * Bind window events
 */

fn.bindOutside = function () {
  this.windowEvents.bind('mousedown', 'close');
  this.windowEvents.bind('mouseup', 'close');
  this.windowEvents.bind('scroll', 'reposition');
  this.windowEvents.bind('resize', 'reposition');
  return this;
};

/**
 * Unbind window events
 */

fn.unbindOutside = function () {
  this.windowEvents.unbind('mousedown', 'close');
  this.windowEvents.unbind('mouseup', 'close');
  this.windowEvents.unbind('scroll', 'reposition');
  this.windowEvents.unbind('resize', 'reposition');
  return this;
};

/**
 * Add option
 */

fn.add = function (value, text, selected) {
  var template = require('./templates/option.html');
  var el = domify(template);
  var list = this._group || this.list;

  el.innerHTML = text;
  this.options[value] = el;
  this.selectable.push('' + value);
  data(el).set({
    'value': value
  });

  list.appendChild(el);

  if (!(this.placeholder || this.val) || selected) {
    this.select(value);
  }

  this.emit('option', value, text);

  return this;
};

/**
 * Remove option
 */

fn.remove = function (value) {
  var option = this.options[value];
  this.el.removeChild(option);
  return this.emit('remove', value);
};

/**
 * Add optiongroup or get the optgroup label of the selected option
 */

fn.group = function (name) {

  if (typeof name == 'undefined') {
    return this.inGroup;
  }

  var template = require('./templates/group.html');
  var el = domify(template);
  var label = query('.ui-select-group-label', el);

  label.innerHTML = name;
  this._group = query('.ui-select-options', el);
  this.list.appendChild(el);

  return this.emit('group', name);
};

/**
 * React to keypress event when closed
 */

var isLetter = /\w/;

fn.onkeypress = function (e) {
  if (!this.closed) return;

  var key = e.keyCode;
  var c = String.fromCharCode(key);

  if (!isLetter.test(c)) return;

  preventDefault(e);
  this.input.value = c;
  this.open();
  this.filter(c);
};

/**
 * React to keydown event
 */

fn.onkeydown = function (e) {
  var key = e.keyCode;
  var current = this.inFocus || this.val;

  switch (keyname(key)) {
    case 'tab':
    case 'esc':
      this.close();
      break;
    case 'enter':
      preventDefault(e);
      this.select(current);
      break;
    case 'left':
    case 'right':
      this.open();
      break;
    case 'up':
      preventDefault(e);
      this.navigate(-1);
      break;
    case 'down':
      preventDefault(e);
      this.navigate(1);
      break;
  }
};

/**
 * React to keyup event
 */

fn.onkeyup = function () {
  this.filter(this.input.value);
};


/**
 * Move focus n positions up or down
 */

fn.navigate = function (n) {
  if (this.closed) return this.open();

  var selectable = this.selectable;
  var i = indexOf(selectable, this.inFocus) + n;

  if (selectable.length > i && i >= 0) {
    var value = selectable[i];
    this.setFocus(value);
  }

  return this;
};

/**
 * Highlight option with the given value
 */

fn.setFocus = function (value) {
  var focus = query('.ui-select-focus', this.list);
  var option = this.options[value];

  if (!option) return this;
  if (focus) classes(focus).remove('ui-select-focus');
  classes(option).add('ui-select-focus');

  this.inFocus = '' + value;
  this.scrollTo(value);

  return this.emit('focus', value);
};

/**
 * Select option with the given value
 */

fn.select = function (value) {
  var option = this.options[value];

  if (!option) return this;

  var selected = query('.ui-select-selected', this.list);
  if (selected) classes(selected).remove('ui-select-selected');
  classes(option).add('ui-select-selected');

  var group = option.parentNode.parentNode;
  if (classes(group).has('ui-select-group')) {
    var label = group.querySelector('.ui-select-group-label');
    this.inGroup = label.innerHTML;
  }

  this.label.innerHTML = option.innerHTML;
  this.val = '' + value;

  this.selectEl && (this.selectEl.value = value);

  this.emit('select', value);
  return this.close();
};

/**
 * Scroll to option with the given value
 */

fn.scrollTo = function (value) {
  var option = this.options[value];
  if (!option) return this;

  var list = query('.ui-select-list', this.el);
  var lh = list.clientHeight;
  var lt = list.scrollTop;
  var lb = lt + lh;

  var oh = option.offsetHeight;
  var ot = option.offsetTop;

  if (ot + oh > lb) {
    list.scrollTop = ot + oh - lh;
  } else if (ot < lt) {
    list.scrollTop = ot;
  }

  return this;
};

/**
 * Reposition select
 */

fn.reposition = function () {
  if (this.closed) return this;

  var wt = scrolltop();
  var wb = wt + window.innerHeight;

  var lh = this.label.offsetHeight;
  var lt = offset(this.el);

  var inner = query('.ui-select-inner', this.el);
  var ih = inner.offsetHeight;

  if (lt + lh + ih <= wb) {
    this.addClass('ui-select-south');
    this.removeClass('ui-select-north');
    return this.emit('position', 'south');
  }

  this.addClass('ui-select-north');
  this.removeClass('ui-select-south');
  return this.emit('position', 'north');
};

/**
 * Filter options by text
 */

fn.filter = function (filter) {
  var reg = new RegExp(filter || '', 'i');
  var selectable = this.selectable = [];

  for (var i in this.options) {
    var option = this.options[i];

    if (reg.test(option.innerHTML)) {
      selectable.push(i);
      classes(option).add('ui-select-selectable');
    } else {
      classes(option).remove('ui-select-selectable');
    }
  }

  this.hideEmpty();
  this.refocus();

  return this.emit('filter', filter);
};

/**
 * Hide empty groups
 */

fn.hideEmpty = function () {
  var groups = query.all('.ui-select-group', this.list);

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var options = query('.ui-select-selectable', group);

    if (options) {
      classes(group).remove('ui-select-empty');
    } else {
      classes(group).add('ui-select-empty');
    }
  }

  return this;
};

/**
 * Refocus if the element in focus is unselectable
 */

fn.refocus = function () {
  var selectable = this.selectable;

  if (~indexOf(selectable, this.inFocus))
    return this.scrollTo(this.inFocus);

  if (!selectable.length)
    return this.setFocus(null);

  return this.setFocus(selectable[0]);
};

/**
 *º Append select to el
 */

fn.appendTo = function (el) {
  el.appendChild(this.el);
  return this;
};


fn.insertBefore = function (el) {
  el || (el = this.selectEl);
  el.parentNode.insertBefore(this.el, el);
  return this;
};

/**
 * Add class to select
 */

fn.addClass = function (name) {
  this.classes.add(name);
  return this;
};

/**
 * Remove class from select
 */

fn.removeClass = function (name) {
  this.classes.remove(name);
  return this;
};

/**
 * Open select
 */

fn.open = function () {
  if (!this.closed) return this;
  return this.toggle();
};

/**
 * Close select
 */

fn.close = function () {
  if (this.closed) return this;
  return this.toggle();
};

/**
 * Toggle select visibility
 */

fn.toggle = function () {
  this.closed = !this.closed;

  this.classes.toggle('ui-select-open');
  this.classes.toggle('ui-select-closed');

  if (this.closed) {
    this.el.focus();
    this.unbindOutside();
    return this.emit('close');
  }

  this.bindOutside();
  this.setFocus(this.val);
  this.reposition();

  var input = this.input;
  tick(function () {
    input.focus();
  });

  return this.emit('open');
};



fn.value = function(val) {
  if (typeof val === 'undefined') { return this.val; }
  this.select(val);
  return this;
};

fn.destroy = fn.unbind;

/**
 * Get element offset
 */

function offset (el, to) {
  var parent = el;
  var top = el.offsetTop;

  while (parent = parent.offsetParent) {
    top += parent.offsetTop;
    if (parent == to) return top;
  }

  return top;
}

/**
 * Prevent default
 */

function preventDefault (e) {
  if (e.preventDefault) return e.preventDefault();
  e.returnValue = false;
}

/**
 * Stop event propagation
 */

function stopPropagation (e) {
  if (e.stopPropagation) return e.stopPropagation();
  e.cancelBubble = true;
}

/**
 * Defer execution
 */

function tick (callback) {
  setTimeout(callback, 0);
}

module.exports = UISelect;