var SummaryModel = Backbone.Model.extend({
  state: 'ready', // ready | loading | errored
  text: '',
  summary: ''
});

var SummaryView = Backbone.View.extend({
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


$('form').on('submit', function(event) {
  event.preventDefault();

  var action = event.target.action;
  var text = model.text;
  model.set({state: 'loading'});

  $.post(action, {text: text}, function(resp) {
    model.set({summary: resp, state: 'ready'});
  }, 'text');
});


window.model = new SummaryModel();


// TODO: Could we remove this boiler-plate code?
model.on('change:summary', function(m, v) {
  console.log('model.summary changed');
});

model.on('change:state', function(m, state) {

  console.log('model.state changed:', state);

  // NOTE: At this point, the `model` sure looks like SummaryModel,
  // but it does not have `stateChanged` function defined inside the mode.
  // So we decided to do the work here until we figure what exactly is going
  // on.
  //
  // model.stateChanged(state);

  if (state == 'ready') {
    var summary = model.get('summary');
    $('#loading').hide();
    if (summary) {
      // TODO: Bind this view to model.summary
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

var app = new SummaryView({model: model});

$(function() {
  model.set({state: 'ready'});
});
