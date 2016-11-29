var TextSummaryModel = Backbone.Model.extend({
  state: 'ready', // ready | loading | errored
  text: '',
  summary: ''
});


var URLSummaryModel = Backbone.Model.extend({
  fetch: function(url) {
    var model = this;
    // TODO: Check if URL is valid
    // FIXME: Is this okay to reference the view from model?
    urlSummaryView.progress(0, 'Fetching the web page');

    var params = {url: url};
    $.get('/fetch-url', params, function(resp) {
      urlSummaryView.progress(10, 'Web page fetched');
      model.set('html', resp.trim());
    })
    .fail(function(resp) {
      // TODO: Do something
    });
  }
});


var TextSummaryView = Backbone.View.extend({
  el: '#text-summary',
  bindings: {
  },

  events: {
    'change textarea': 'textareaChanged',
    'change:state': 'stateChanged'
  },

  initialize: function() {
    console.log('view.initialize');
    this.textareaChanged();
  },

  render: function() {
    console.log('view.render');
  },

  textareaChanged: function() {
    // FIXME: Any more robust way to handle this?
    this.model.text = $('textarea[name=text]').val();
  },

  stateChanged: function(state) {
    console.log('stateChanged');
  }
});


var URLSummaryView = Backbone.View.extend({
  el: '#url-summary',
  bindings: {
    'input[name=url]': 'value:url'
  },
  events: {
    'change input[name=url]': 'onChangeURL'
  },

  /**
   * @param percent (int)
   */
  progress: function(percent, label) {
    $('#url-summary .ui.progress').progress({
      percent: percent
    });
    $('#url-summary .ui.progress .label').html(label);
  },

  onChangeURL: function(event, x) {
    console.log('onChangeURL:', event);
    this.model.set('url', event.target.value);
  }
});


$('#text-summary form').on('submit', function(event) {
  event.preventDefault();

  var action = event.target.action;
  var text = textSummaryModel.text;
  textSummaryModel.set({state: 'loading'});

  $.post(action, {text: text}, function(resp) {
   textSummaryModel.set({summary: resp, state: 'ready'});
  }, 'text');
});


$('#url-summary form').on('submit', function(event) {
  event.preventDefault();

  var action = event.target.action;
  var url = urlSummaryModel.get('url');
  urlSummaryModel.set({html: null, text: null, summary: null});
  urlSummaryModel.fetch(url);
});


window.textSummaryModel = new TextSummaryModel();
window.urlSummaryModel = new URLSummaryModel();


// TODO: Could we remove this boiler-plate code?
textSummaryModel.on('change:summary', function(m, v) {
  console.log('model.summary changed');
});

textSummaryModel.on('change:state', function(m, state) {

  console.log('model.state changed:', state);

  // NOTE: At this point, the `model` sure looks like SummaryModel,
  // but it does not have `stateChanged` function defined inside the mode.
  // So we decided to do the work here until we figure what exactly is going
  // on.
  //
  // textSummaryModel.stateChanged(state);

  if (state == 'ready') {
    var summary = textSummaryModel.get('summary');
    $('#loading').hide();
    if (summary) {
      // TODO: Bind this view to textSummaryModel.summary
      $('#summary').html(summary).show();
    }
    else
      $('#summary').hide();
  }
  else if (state == 'loading') {
    $('#loading').show();
    $('#summary').hide();
  }
  else {
    throw 'Invalid state: ' + state;
  }
});

urlSummaryModel.on('change:html', function(model, value) {
  urlSummaryView.progress(20, 'Extracting text from HTML');
  $.post('/extract-text', {html: value}, function(resp) {
    urlSummaryView.progress(50, 'Extracted text from HTML');
    model.set('text', resp);
  });
});

urlSummaryModel.on('change:text', function(model, text) {
  console.log('urlSummaryModel change:text', model, text);
  $.post('/', {text: text}, function(resp) {
    urlSummaryView.progress(100, 'Finished');
    urlSummaryModel.set({summary: resp});
  }, 'text');
});

urlSummaryModel.on('change:summary', function(mode, value) {
  $('#url-summary div.summary').text(value);
});



var textSummaryView = new TextSummaryView({model: textSummaryModel});
var urlSummaryView = new URLSummaryView({model: urlSummaryModel});

$(function() {
  textSummaryModel.set({state: 'ready'});
});
