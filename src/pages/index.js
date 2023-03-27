import Head from 'next/head'
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import $ from 'jquery';
if (typeof window !== 'undefined')
  import('slick-carousel');  // load dynamically if running on the client side

const UNSPLASH_API_KEY = '_HifaNwNoljS_lFLkUQ7L4nQulMXn6FcCazEVNlhTB8'; // TODO: move to server

var initialized = false;
var location = '';
var preferences = '';

function unsplash(container, queries) {
  function fetchImages(query) {
    var url = 'https://api.unsplash.com/search/photos?query=' + query + '&per_page=3&client_id=' + UNSPLASH_API_KEY;
    return $.ajax({
      url: url
    });
  }
  // Fetch images for each query in parallel
  var promises = queries.map(fetchImages);

  $.when.apply($, promises).then(function() {
    var slick = $('<div class="slick flex flex-wrap justify-center">');

    // Loop through the results for each query and create an image element for each one
    for (var i = 0; i < arguments.length; i++) {
      var data = arguments[i][0];
      var tile = $('<div class="slick-tile my-2">');
      $.each(data.results, function(j, result) {
	var $img = $('<img>').addClass('slick-img').attr({
	  'src': result.urls.thumb,
	  'data-lazy': result.urls.regular
	});
	tile.append($img);
      });
      tile.append($('<div>').addClass('bg-white shadow-md py-1 px-2 capitalize absolute slick-label').text(queries[i]));
      slick.append(tile);
    }

    // Append the slick container to the carousel
    container.append(slick);

    if ($(window).width() > 400) {  // carousel on desktop, list on mobile
      slick.slick({
	lazyLoad: 'ondemand',
	slidesToShow: 4,
	slidesToScroll: 2,
	infinite: false,
	arrows: true,
	prevArrow:"<img class='ml-4 z-40 slick-prev' src='/left.png'>",
	nextArrow:"<img class='mr-4 z-40 slick-next' src='/right.png'>",
	responsive: [
	  {
	    breakpoint: 1000,
	    settings: {
	      slidesToShow: 3,
	      slidesToScroll: 3,
	    }
	  },
	  {
	    breakpoint: 768,
	    settings: {
	      slidesToShow: 1,
	      slidesToScroll: 1,
	    }
	  }
	]
      });
    }
  }, function() {
    console.log('Error fetching images from Unsplash API');
  });

};


function vsplit(strings) {
  const [firstParts, secondParts] = strings.reduce(
    ([firstParts, secondParts], string) => {
      const [firstPart, secondPart] = string.split(' - ');
      if (secondPart)
	return [[...firstParts, firstPart], [...secondParts, secondPart]];
      else
	return [[...firstParts, string], [...secondParts, string]];
    },
    [[], []]
  );
  return [firstParts, secondParts];
}

const render = (data) => {
  const capitalize = (s) => { return s[0].toUpperCase() + s.slice(1); };

  const list = vsplit(data.split(/[\n,]/).
    filter(x => x).
    map(x => capitalize(x.replace(/^ *(\d+\.)? */,'').replace(/\.$/,''))));

  var $box = $('<div class="p-2 flex items-center">');
  var $carousel = $('<div>');
  $box.append($carousel);

  var $box2 = $('<div class="p-3 bg-white rounded-lg shadow-md">');
  $box2.append(`
      Select one above to
      <div class="radio-buttons inline-flex py-2">
	<input type="radio" id="option1" name="radio" value="Option 1" class="form-radio sr-only" />
	<label for="option1" class="radio-label-text px-1 cursor-pointer rounded-sm">look deeper</label> |
	<input type="radio" id="option2" name="radio" value="Option 2" class="form-radio sr-only" />
	<label for="option2" class="radio-label-text px-1 cursor-pointer rounded-sm">see similar</label>
      </div>

      <br>Or add preferences:
      <input type="text" size=20 placeholder="E.g., with kids, hiking, near palo alto" class="border-2 my-2 border-gray-200 rounded-sm py-1 px-2 focus:outline-none focus:border-blue-300 focus:shadow-md">
      <br>E.g.,
  `);

  var suggestions = ['with kids', 'active', 'indoor'];
  if (location) suggestions.unshift('near ' + location);
  suggestions.forEach(s => {
    $box2.append(`<input type="button" class="px-1 border-0 border-gray-100 \
      underline decoration-dotted underline-offset-4 active:decoration-solid" value="` + s + `" />`);
  });

  $('#rest').append($box).append($box2);

  $('.radio-buttons').each(function() { $(this).children().first().attr('checked', true); }); // XXX clears all but latest
  $('input[type="radio"]').click(function(e) {  // XXX scrolls to top
    console.log(this);
  });

  unsplash($carousel, list[0]);
};

const clearCache = () => {
  for (i in localStorage)
    if (i.match(/^openai:/))
      localStorage.removeItem(i);
}

const openai = (prompt, render) => {
  console.log(prompt);
  var cache = localStorage.getItem("openai:" + prompt);
  if (cache) {
    console.log('cached:' + cache);
    render(cache);
    return;
  }

  $("#overlay").fadeIn(300);
  const data = $.ajax({
    type: 'GET',
    url: '/api/openai',
    data: { prompt: prompt },
    success: function(data) {
      $("#overlay").fadeOut(300);
      const out = data.choices[0].text;
      console.log(out);
      localStorage.setItem("openai:" + prompt, out);
      render(out);
    },
    error: function(xhr, textStatus, errorThrown) {
      $("#overlay").fadeOut(300);
      console.log('Error fetching openAI completions');
    }
  }).then(function(data) {
    return data;
  });
};

function showPosition(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var accuracy = position.coords.accuracy;
  var url = "https://api.opencagedata.com/geocode/v1/json?q=" + latitude + "+" + longitude + "&key=b6640a4ba829450ea55332d76e588fdc&no_annotations=1";
  $.get(url, function(data) {
    var res = data.results[0].components;
    location = res.city + ', ' + res.state_code || res.state;
    $("#location").html('&#x25cf; ' + location);
  });
}

export default function Home() {
  useEffect(() => {
    $(document).ready(() => {
	if (initialized) return;
	initialized = true;

	if (navigator.geolocation)
	  navigator.geolocation.getCurrentPosition(showPosition);

  $('#drawer-toggle').click(function(e) {
    e.preventDefault();
    var drawer = $('#drawer');
    if (drawer.outerHeight() === 0) {
      drawer.css('height', 'auto');
      var height = drawer.outerHeight();
      drawer.css('height', '0').animate({height: height}, 100);
    } else {
      drawer.animate({height: 0}, 100);
    }
  });

	$('#weekend').click(function(e) {
	  openai(`Bulleted list of 15 popular and diverse activities that people do over the weekend, ` + preferences + `.`, render);
	});

    });
  }, []);

  return (
    <>
      <Head>
        <title>Find yourself</title>
        <meta name="description" content="Find yourself" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-3">

	<div id="location" className="fixed top-5 right-5 text-orange-700 text-sm font-bold"></div>

	<div id="overlay"><div className="cv-spinner"><span className="spinner"></span></div></div>

	<div id="weekend" className="p-3 max-w-sm bg-white
	  rounded-lg flex items-center space-x-4 shadow-md hover:shadow-xl
	  active:shadow-none active:bg-neutral-100 active:mt-0.5 active:-mb-0.5 active:ml-0.5 active:-mr-0.5 ">

	  <img className="h-23 w-28 py-2" src="/weekend.png" alt="Weekend" />
	  <div>
	    <div className="text-l text-slate-500">What do you want to do..</div>
	    <p className="text-xl text-black">this weekend?</p>
	  </div>
	</div>

	<div id="rest"></div>

	<a href="#" id="drawer-toggle" className="fixed bottom-0 left-0 w-full py-4 bg-blue-500 text-white text-center">Open Drawer</a>

	<div id="drawer" className="fixed bottom-0 left-0 w-full h-0 bg-gray-200 overflow-hidden transition-all duration-200 ease-in-out">

      Select one above to
      <div className="radio-buttons inline-flex py-2">
	<input type="radio" id="option1" name="radio" value="Option 1" className="form-radio sr-only" />
	<label htmlFor="option1" className="radio-label-text px-1 cursor-pointer rounded-sm">look deeper</label> |
	<input type="radio" id="option2" name="radio" value="Option 2" className="form-radio sr-only" />
	<label htmlFor="option2" className="radio-label-text px-1 cursor-pointer rounded-sm">see similar</label>
      </div>

	</div>

      </main>
    </>
  );
}
