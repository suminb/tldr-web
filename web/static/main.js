// `tapp` stands for text summary app
var tapp = new Vue({
  el: '#text-summary',
  data: {
    loading: false, // NOTE: Not sure if this is a good idea
    text: '',
    summary: '',
  },
  methods: {
    submit: function(event) {
      var action = $('#text-summary form').attr('action');
      var text = $('#text-summary textarea[name=text]').val();
      tapp.summary = '';
      tapp.loading = true;
      $.post(action, {text: text}, function(resp) {
        tapp.summary = resp;
      }, 'text')
      .always(function() {
        tapp.loading = false;
      });
    }
  }
});

// FIXME: In some sense, we are abusing Vue. The following part must be
// refactored as soon as possible.

// `uapp` stands for URL summary app
var uapp = new Vue({
  el: '#url-summary',
  data: {
    state: 'ready',
    label: '',
    url: '',
    html: '',
    text: '',
    summary: ''
  },
  methods: {
    submit: function(event) {
      var action = $('#url-summary form').attr('action');
      var url = $('#url-summary input[name=url]').val();
      uapp.summary = '';
      uapp.state = 'fetch-url';

      $('.ui.progress').show();
      progress(0, 'Fetching the web page');
      $.get(action, {url: url}, function(resp) {
        progress(10, 'Web page fetched');
        uapp.html = resp.trim();
      })
      .fail(function(resp) {
        // TODO: Do something
      });
    }
  },
  watch: {
    html: function(value) {
      if (value) {
        uapp.state = 'extract-text';
        progress(25, 'Extracting text from HTML');
        $.post('/extract-text', {html: value}, function(resp) {
          progress(50, 'Extracted text from HTML');
          uapp.text = resp;
        });
      }
    },
    text: function(value) {
      if (value) {
        uapp.state = 'summarize';
        progress(55, 'Summarizing text');
        $.post('/', {text: value}, function(resp) {
          progress(100, 'Finished');
          uapp.summary = resp;
        }, 'text')
        .always(function() {
          setTimeout(function() {
            $('.ui.progress').hide(500);
          }, 500);
        });
      }
    }
  }
});

function progress(percent, label) {
  $('#url-summary .ui.progress').progress({
    percent: percent
  });
  uapp.label = label;
}
