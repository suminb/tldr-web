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
    'change textarea': 'textareaChanged'
  },

  initialize: function() {
    console.log('view.initialize');
    this.textareaChanged();
    this.render();
  },

  render: function() {
    console.log('view.render');

    // TODO: Bind this view to model.state
    this.stateChanged(this.model.state);
  },

  textareaChanged: function() {
    // FIXME: Any more robust way to handle this?
    this.model.text = $('textarea[name=text]').val();
  },

  stateChanged: function(state) {
    console.log('stateChanged');
    if (state == 'ready') {
      $('#loading').hide();
      if (this.model.summary) {
        // TODO: Bind this view to model.summary
        $('#summary').html(this.model.summary).show();
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
  }
});


$('form').on('submit', function(event) {
  event.preventDefault();

  var action = event.target.action;
  var text = window.summary.text;
  window.summary.state = 'loading';
  app.render();

  $.post(action, {text: text}, function(resp) {
    window.summary.summary = resp;
    window.summary.state = 'ready';
    app.render();
  }, 'text');
});


window.summary = new SummaryModel();
var app = new SummaryView({model: window.summary});
