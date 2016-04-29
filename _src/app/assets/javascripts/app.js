//=require ../../../bower_components/jquery/dist/jquery.min.js
//=require ../../../bower_components/foundation-sites/dist/foundation.min.js

$(document).foundation();

$(document).ready(function () {

  var $input = $('input');
  var $message = $('.callout');
  var $header = $('header');
  var $content = $('#content');
  var $main = $('main');
  var $close = $('#close');

  var show_message = function(message) {
    $message.html(message);
    $message.show();
  }

  var hide_message = function() {
    $message.hide();
  }

  var request_data = function (url) {
    hide_message();

    if(!url || url === '')
      return;

    var id = extract_id(url);

    $.get('http://bed.api.no/api/acpcomposer/v1.1/content/' + id)
      .done(function (data) {
        data = parse_content(data);
        insert_content(data);
        window.location.hash = url;
      })
      .fail(function () {
        show_message('Kunne ikke laste inn artikkelen!');
      });
  }

  var close_content = function() {
    $main.hide();
    $header.show();
  }

  var insert_content = function(content) {
    $header.hide();
    $main.show();
    $content.html(content);
    new Foundation.Orbit($('#slide'));
  };

  var parse_content = function(raw) {
    var output = '';

    output += '<h2>' + raw.title + '</h2>';
    output += '<p class="lead">' + raw.leadText + '</p>';
    output += raw.body;

    if(raw._embedded && raw._embedded.relations) {
      var extra = raw._embedded.relations;

      for(var index in extra) {
        var item = extra[index];

        if(item.type !== 'imageRelation')
          continue;

        output += '<figure><img src="'+item.fields.versions.large.url+'"><figcaption>'+item.caption+'</figcaption></figure>';
      }
    }

    return output;
  };

  var extract_id = function (url) {
    var split = url.split('/');
    return split[split.length - 1];
  };

  var current_hash = window.location.hash.substring(1);

  if (current_hash && current_hash !== "") {
    request_data(current_hash);
    $input.val(current_hash);
  }

  $input.on('click', function () {
    $(this).select();
  });

  $input.on('change paste', function () {
    request_data($input.val());
  });

  $close.on('click', function() {
    close_content();
  })

  close_content();
});

// http://bed.api.no/api/acpcomposer/v1.1/content/<ARTIKKEL-ID>
