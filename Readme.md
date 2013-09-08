
# ui-select

  A custom select component


  This component is built on the top of [combobox](https://github.com/eivindfjeldstad/combobox). So, most of the core functionality is taken from there but I've written a more complete API, added some new features and renamed the component to suit UI-kit needs and conventions.


## Installation

  Install with [component(1)](http://component.io):

    $ component install vieron/ui-select

## API

### .group([label])

**Create a new optgroup** or **get** the group name (if exists) of the selected option.

If you pass a string as argument, a new group will be created using this string as label.

```
ins.group('Group 1');
// returns ins

```

If you don't pass any argument it returns the group name (if exists) of the selected option.
If there is no option selected it will return `undefined`;

```
ins.group();
// returns 'Group 1'

```

### .add(value, text [, selected])

**Append a new option** to the select.


```
ins.add(1, 'Option 1');
// returns ins
```

Or if selected:

```
ins.add(2, 'Option 2', true);
// returns ins

```


### .value([val])

**Get** or **set** the ui-select value.

If argument is passed acts as a **setter**.

```
ins.value('option-1');
returns ins

```

And with no arguments acts as a **setter**.

```
ins.value();
// returns 'option-1'

```



## Build

	$ git clone git@github.com:vieron/ui-select.git
	$ cd ui-select
	$ npm install
	$ component install
	$ grunt


## Development

Same proccess as in Build but you can use grunt watch to trigger component build when a file changes.

	$ grunt watch



## License

  MIT
