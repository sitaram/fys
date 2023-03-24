$(document).ready(function() {


});


jQuery(function($){
  $(document).ajaxSend(function() {
    $("#overlay").fadeIn(300);
  });
		
  $('#button').click(function(){
    $.ajax({
      type: 'GET',
      success: function(data){
        console.log(data);
      }
    }).done(function() {
      setTimeout(function(){
        $("#overlay").fadeOut(300);
      }, 500);
    });
  });	
});
