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


$('#url-summary form').on('submit', function(event) {
  event.preventDefault();

  var action = event.target.action;
  var url = urlSummaryModel.get('url');

  $('#url-summary div.summary').text('');

  // FIXME: This is probably error-prone code
  $('#url-summary button').prop('disabled', true);
  $('.ui.progress').show();

  urlSummaryModel.set({html: null, text: null, summary: null});
  urlSummaryModel.fetch(url);
});


window.urlSummaryModel = new URLSummaryModel();


urlSummaryModel.on('change:html', function(model, value) {
  if (value) {
    urlSummaryView.progress(25, 'Extracting text from HTML');
    $.post('/extract-text', {html: value}, function(resp) {
      urlSummaryView.progress(50, 'Extracted text from HTML');
      model.set('text', resp);
    });
  }
});

urlSummaryModel.on('change:text', function(model, value) {
  if (value) {
    urlSummaryView.progress(55, 'Summarizing text');
    $.post('/', {text: value}, function(resp) {
      urlSummaryView.progress(100, 'Finished');
      urlSummaryModel.set({summary: resp});
    }, 'text');
  }
});

urlSummaryModel.on('change:summary', function(mode, value) {
  if (value) {
    $('#url-summary div.summary').text(value);

    // FIXME: This is probably error-prone code
    $('#url-summary button').prop('disabled', false);
    $('.ui.summary').show();
    setTimeout(function() {
      $('.ui.progress').hide(500);
    }, 500);
  }
});



var urlSummaryView = new URLSummaryView({model: urlSummaryModel});
