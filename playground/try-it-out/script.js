var el = function (sel) { return document.querySelector(sel); };
var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

var CODEMIRROR_SETTINGS = {
  value: '',
  mode:  'javascript',
  tabSize: 2,
  lineNumbers: true,
  autofocus: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
};

var renderEditor = function (onChange) {
  var container = el('.js-code-editor');
  var editor = CodeMirror(container, CODEMIRROR_SETTINGS);

  editor.on('change', function () {
    onChange(editor.getValue());
  });

  container.addEventListener('click', function () {
    editor.focus();
  });
  return editor;
};
var renderOutput = function () {
  var settings = clone(CODEMIRROR_SETTINGS), output;

  settings.readOnly = true;
  settings.cursorBlinkRate = -1;
  output = CodeMirror(el('.js-output-editor'), settings);
  return output;
};
var toggling = function (container, label, callback) {
  var storageKey = 'cssx-' + label;
  var is = localStorage && localStorage.getItem(storageKey) === 'true';
  var render = function () {
    container.innerHTML = (is ? '&#x2714;' : '&#x2718;') + ' ' + label;
    callback(is);
  };

  container.addEventListener('click', function () {
    localStorage && localStorage.setItem(storageKey, is = !is);
    render();
  });
  render();
};

var init = function () {
  var ast, transpiled;
  var output = renderOutput();
  var printIfNotEmpty = function (value) { output.setValue(!!value ? value : ''); };
  var printText = function (text) { printIfNotEmpty(text); };
  var printTranspiled = function () { printText(transpiled); };
  var printAST = function () { printIfNotEmpty(JSON.stringify(ast, null, 2)); };
  var print = printAST;
  var transpilerOpts = {
    minified: false
  };
  var render = function (value) {
    try {
      ast = cssxler.ast(value);
      transpiled = cssxler(value, transpilerOpts);
      print();
    } catch(err) {
      // console.log(err);
      printText(err.message);
    }
  };
  var editor = renderEditor(render);

  toggling(el('.js-view-ast'), 'View AST', function (value) {
    print = value ? printAST : printTranspiled;
    print();
  });
  toggling(el('.js-minify'), 'Minify', function (value) {
    transpilerOpts.minified = value;
    render(editor.getValue());
  });
};

window.onload = init;