var Summarization = Backbone.Model.extend({

});

window.summarization = new Summarization();

$('form').on('submit', function(event) {
  event.preventDefault();

  var action = event.target.action;
  var text = $('textarea[name=text]').val();
  console.log(text);

  $.post(action, {text: text}, function(resp) {
    $('#text-summary').text(resp);
  }, 'text');
});
