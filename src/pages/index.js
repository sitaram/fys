import dynamic from 'next/dynamic';
import $ from 'jquery';
if (typeof window !== 'undefined')
  import('slick-carousel');  // load dynamically if running on the client side

import { useEffect } from 'react';
import Head from 'next/head'
import { JSDOM } from 'jsdom';
const UNSPLASH_API_KEY = '_HifaNwNoljS_lFLkUQ7L4nQulMXn6FcCazEVNlhTB8'; // TODO: move to server

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
    container.append($slick);

    // Initialize the slick carousel
    if(0)
    $slick.on('mousewheel DOMMouseScroll wheel', (function(e) {
      e.preventDefault();
      if (e.originalEvent.deltaY < 0) {
	$(this).slick('slickNext');
      } else {
	$(this).slick('slickPrev');
      }
    }));

    $slick.slick({
      lazyLoad: 'ondemand',
      slidesToShow: 4,
      slidesToScroll: 2,
      infinite: false,
      arrows: true,
      prevArrow:"<img class='ml-4 z-40 slick-prev' src='/left.png'>",
      nextArrow:"<img class='mr-4 z-40 slick-next' src='/right.png'>",
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

  var $box = $('<div class="p-3 my-2 bg-white rounded-lg shadow-md">').text('Here are some initial ideas:');
  $('#rest').append($box);
  unsplash($box, list[0]);
};

const openai = (prompt) => {
  $("#overlay").fadeIn(300);
  const data = $.ajax({
    type: 'GET',
    url: '/api/openai',
    data: { prompt: prompt },
    success: function(data) {
      $("#overlay").fadeOut(300);
      const out = data.choices[0].text;
      console.log(out);
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


export default function Home() {
  useEffect(() => {
    $(document).ready(() => {

	$('#weekend').off('click').click(function(e) {
	  openai(`Bulleted list of 15 popular and diverse activities that people do over the weekend.`);
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

	<div id="overlay"><div className="cv-spinner"><span className="spinner"></span></div></div>

	<div id="weekend" className="p-3 max-w-sm bg-white
	  rounded-lg flex items-center space-x-4 shadow-md hover:shadow-xl
	  active:shadow-none active:bg-neutral-100 active:mt-0.5 active:-mb-0.5 active:ml-0.5 active:-mr-0.5 ">

	  <img className="h-24 w-30" src="/weekend.png" alt="Weekend" />
	  <div>
	    <div className="text-l text-slate-500">What do you want to do..</div>
	    <p className="text-xl text-black">this weekend?</p>
	  </div>
	</div>

	<div id="rest"></div>
      </main>
    </>
  );
}
