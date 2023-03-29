const OPEN_API_KEY = 'XXX';
const UNSPLASH_API_KEY = 'XXX';

function openai(prompt) {
  var endpoint = 'https://api.openai.com/v1/completions';
  var requestData = {
    'model': "text-davinci-003",
    'prompt': prompt,
    'temperature': 0.0,
    'max_tokens': 4000 - prompt.split(" ").length + 10,
  };

  $("#overlay").fadeIn(300);
  $.ajax({
    type: 'POST',
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OPEN_API_KEY
    },
    data: JSON.stringify(requestData),
    success: function(response) {
      console.log(response.choices[0].text);
      $("#overlay").fadeOut(300);
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log(xhr.responseText);
      $("#overlay").fadeOut(300);
    }
  });
}

function unsplash(queries) {
  function fetchImages(query) {
    var url = 'https://api.unsplash.com/search/photos?query=' + query + '&per_page=3&client_id=' + UNSPLASH_API_KEY;
    return $.ajax({
      url: url
    });
  }
  // Fetch images for each query in parallel
  var promises = queries.map(fetchImages);

  $.when.apply($, promises).then(function() {
    var $slick = $('<div>').addClass('slick');

    // Loop through the results for each query and create an image element for each one
    for (var i = 0; i < arguments.length; i++) {
      var data = arguments[i][0];
      var $tile = $('<div>');
      $.each(data.results, function(j, result) {
	var $img = $('<img>').addClass('slick-img').attr({
	  'src': result.urls.thumb,
	  'data-lazy': result.urls.regular
	});
	$tile.append($img);
      });
      $tile.append($('<div>').addClass('bg-white shadow-md py-1 px-2 capitalize absolute slick-label').text(queries[i]));
      $slick.append($tile);
    }

    // Append the slick container to the carousel
    $('#image-carousel').append($slick);

    // Initialize the slick carousel
    $slick.on('mousewheel DOMMouseScroll wheel', (function(e) {
      e.preventDefault();
      if (e.originalEvent.deltaY < 0) {
	$(this).slick('slickNext');
      } else {
	$(this).slick('slickPrev');
      }
    })).slick({
      lazyLoad: 'ondemand',
      slidesToShow: 4,
      slidesToScroll: 2,
      infinite: false,
      arrows: true,
      prevArrow:"<img class='ml-4 z-40 slick-prev' src='img/left.png'>",
      nextArrow:"<img class='mr-4 z-40 slick-next' src='img/right.png'>",
      dots: true,
      responsive: [
	{
	  breakpoint: 1000,
	  settings: {
	    slidesToShow: 3,
	    slidesToScroll: 3,
	  }
	},
	{
	  breakpoint: 700,
	  settings: {
	    slidesToShow: 2,
	    slidesToScroll: 2,
	  }
	},
	{
	  breakpoint: 500,
	  settings: {
	    slidesToShow: 1,
	    slidesToScroll: 1,
	  }
	}
      ]
    });

  }, function() {
    console.log('Error fetching images from Unsplash API');
  });

}

$(document).ready(function() {

  $("#weekend").click(function() {
    openai(`Bulleted list of 15 popular and diverse activities that people do over the weekend.`);
  });

  unsplash(['dog', 'cat', 'bird', 'snake', 'hippo', 'rhino', 'elephant']);
});





