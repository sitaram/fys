// density of interesting is super high
//
// pick topics worthy of discussion - more challenging, curiosity, ...
//
// decision problem picker: https://sharegpt.com/c/sa0Dj2K

import Head from 'next/head'
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import $ from 'jquery';
if (typeof window !== 'undefined')
  import('slick-carousel');  // load dynamically if running on the client side

var initialized = false;
var location = '';
var preferences = '';

function unsplash(container, queries) {
  function fetchImages(query) {
    return $.ajax({
      url: '/api/unsplash?q=' + query
    });
  }
  // Fetch images for each query in parallel
  var promises = queries.map(fetchImages);

  $.when.apply($, promises).then(function() {
    var slick = $('<div class="slick relative flex flex-wrap justify-center">');

    // Loop through the results for each query and create an image element for each one
    for (var i = 0; i < arguments.length; i++) {
      var outerTile = $('<div>').appendTo(slick);
      var tile = $('<div class="slick-tile mb-2">').appendTo(outerTile);
      var data = arguments[i][0];
      var imgs = $('<div class="slick-imgs mb-4 flex relative justify-center">').appendTo(tile);
      $.each(data.results, function(j, result) {
	$('<img>').addClass('slick-img').attr({
	  'src': result.urls.thumb,
	  'data-lazy': result.urls.regular
	}).appendTo(imgs);
      });
      $('<div class="slick-label bg-white relative shadow-md py-1 px-2 text-center">').text(queries[i]).appendTo(tile);
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
    map(x => capitalize(x.replace(/^ *(\d+\.|•)? */,'').replace(/\.$/,''))));

  var $box = $('<div class="p-2 flex items-center">');
  var $carousel = $('<div>');
  $box.append($carousel);
  $('#rest').empty().append($box);

  var $box2 = $('<div class="drawer-inner p-4 bg-white rounded-lg shadow-md">');
  $box2.append(`
      Select one above to
      <div class="radio-buttons inline-flex">
	<input type="radio" id="option1" name="radio" value="Option 1" class="form-radio sr-only" />
	<label for="option1" class="radio-label-text px-1 cursor-pointer rounded-sm">look deeper</label> |
	<input type="radio" id="option2" name="radio" value="Option 2" class="form-radio sr-only" />
	<label for="option2" class="radio-label-text px-1 cursor-pointer rounded-sm">see similar</label>
      </div>

      <br>What's on your mind?
      <input type="text" size=10 placeholder="E.g., with kids, hiking" value="` + preferences + `"
	class="prefs border-2 ml-1 my-2 border-gray-200 rounded-sm py-1 px-2 focus:outline-none focus:border-blue-300 focus:shadow-md">
      <br>E.g.,
  `);

  var suggestions = ['active', 'indoor', 'with kids', 'civil rights', 'blm', 'rainy day', 'winery', 'art',
  'meeting people', 'romantic'];
  suggestions.forEach(s => {
    $box2.append(`<input type="button" class="pref-sugg px-1 border-0 border-gray-100 \
      underline decoration-dotted underline-offset-4 active:decoration-solid" value="` + s + `" />`);
  });

  if ($(window).width() > 400) {
    $('#rest').append($box2);
// XXX DISABLED     var toolbar = $('#toolbar');
// XXX DISABLED     toolbar.empty().append($box2);
  } else {
    var drawer = $('#drawer');
    drawer.empty().append($box2);
    var height = $box2.outerHeight();
    drawer.css('height', '0').animate({height: height}, 100);
    // close: drawer.animate({height: 0}, 100);
  }

  $('.pref-sugg').click(function(e) {
    var v = $(this).val();
    var prefs = $('.prefs').val().split(', ');
    if (prefs.length === 1 && prefs[0] === '') prefs.splice(0, 1);
    var index = $.inArray(v, prefs);
    if (index === -1)
      prefs.push(v);
    else
      prefs.splice(index, 1);
    $('.prefs').val(preferences = prefs.join(', '));
    reload();
  });

  $('.radio-buttons').children().first().attr('checked', true); // XXX clears all but latest
  $('input[type="radio"]').click(function(e) {  // XXX scrolls to top
    console.log(this);
  });

  var input = $('.prefs');
  const inputLeft = input.offset().left;
  const windowWidth = $(window).width();
  const padding = parseInt(input.css('padding-left')) + parseInt(input.css('padding-right'));
  const border = parseInt(input.css('border-left-width')) + parseInt(input.css('border-right-width'));
  const margin = parseInt(input.css('margin-left')) + parseInt(input.css('margin-right'));
  const maxWidth = windowWidth - (inputLeft - $(window).scrollLeft()) - padding - border - margin;
  input.width(Math.min(maxWidth - 20, 800));

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
    $("#location").html(' near ' + location);
    $("#location-box").show();
  });
}

const reload = function() {
  var loc = $('#location-checkbox').prop('checked') ? ' near ' + location : '';
  openai(`Bulleted list of 15 popular and diverse activities that people do over the weekend` + loc
	 + (preferences ? ', with these preferences: ' + preferences : '')
	 + `.`, render);
};

export default function Home() {
  useEffect(() => {
    $(document).ready(() => {
	if (initialized) return;
	initialized = true;

	if (navigator.geolocation)
	  navigator.geolocation.getCurrentPosition(showPosition);

	$('#weekend').click(reload);

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
      <main className="relative">
	<div id="overlay"><div className="cv-spinner"><span className="spinner"></span></div></div>

	<div id="weekend" className="p-3 max-w-md bg-white
	  rounded-lg flex items-center space-x-4 shadow-md hover:shadow-xl
	  active:shadow-none active:bg-neutral-100 active:mt-0.5 active:-mb-0.5 active:ml-0.5 active:-mr-0.5 ">

	  <img className="h-23 w-28 py-2" src="/weekend.png" alt="Weekend" />
	  <div>
	    <div className="text-l text-slate-500">What do you want to do..</div>
	    <p className="text-xl text-black">this weekend?</p>

	    <div id="location-box" className="pt-1" hidden>
	      <input id="location-checkbox" type="checkbox" className="align-middle" />
	      <label id="location" htmlFor="location-checkbox" className="inline pl-1 text-blue-500 text-sm font-bold"></label>
	    </div>
	  </div>
	</div>

	<div id="rest"></div>

	<div id="toolbar-box relative">
	<div id="toolbar" className="absolute top-[100px] left-0 bg-white overflow-hidden transition-all duration-200 ease-in-out shadow-[0_-10px_10px_0_rgba(0,0,0,0.2)]" />
	</div>

	<div id="drawer" className="fixed bottom-0 left-0 w-full h-0 bg-white overflow-hidden transition-all duration-200 ease-in-out shadow-[0_-10px_10px_0_rgba(0,0,0,0.2)]" />
      </main>
    </>
  );
}
