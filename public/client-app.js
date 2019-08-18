 (function() {

   var query = document.getElementById('query'),
     response_field = document.getElementById('response_field'),
     searchbutton = document.getElementById('search');

   if (localStorage.getItem("tracklist") !== null) {
     $("#get-tracks").hide()
     populateAlbumList()
   }

   // general utillity for interacting with the spotify api
   function sendquery() {
     console.log("Sending query...")
     $.ajax({
       url: 'https://api.spotify.com/v1/' + query.value,
       headers: {
         'Authorization': 'Bearer ' + access_token
       },
       success: function(response) {
         console.log("Response received")
         console.log(response)
       },
       error: function(response) {
         console.log(response.responseText)
       }
     });
   }
   searchbutton.onclick = sendquery;

   //get all the added tracks from user
   function _initGetTracks() {
     $("#get-tracks").hide()
     getTracks()
   }

   function getTracks(next = undefined) {
     let url,
       tracklist = [];

     next == undefined ? url = 'https://api.spotify.com/v1/me/tracks?limit=50' : url = next

     $.ajax({
       url: url,
       headers: {
         'Authorization': 'Bearer ' + access_token
       },
       success: function(response) {
         console.log(response)
         for (let object of response.items) {
           let track = object.track
           tracklist.push({
             name: track.name,
             album: track.album,
             artists: track.artists,
             uri: track.uri,
           })
         }
         console.log(tracklist)
         console.log(response.offset)
         if (response.next !== null) {
           getTracks(response.next)
         } else {
           console.log("finished")
           localStorage.setItem("tracklist", JSON.stringify(tracklist))
           populateAlbumList(localStorage.getItem("tracklist"))
         }
       },
       error: function(error) {
         console.log(error);
         $("#alert").show().text(error.responseText)
       }
     });
   }
   $('#get-tracks').click(_initGetTracks)

   function populateAlbumList(tracklist = undefined) {
     tracklist = JSON.parse(localStorage.getItem("tracklist"))
     let albumList = []

     console.log(tracklist)

     for (track of tracklist) {
       console.log(track.album.name)
       if (albumList.length == 0) {
         // albumList.push({
         //   likedTracks: 0,
         //   album: track.album
         // })
         console.log("first album")
       } else {
         for (album of albumList) {
           if (album.album.name == track.album.name) {
            // album.likedTracks++
            console.log("album already added")
           } else {
             // albumList.push({
             //   likedTracks: 0,
             //   album: track.album
             // })
             console.log("adding album")
           }
         }
       }
       console.log(albumList)
     }
   }

   function renderFavoriteAlbums() {}



   /**
    * Obtains parameters from the hash of the URL
    * @return Object
    */
   function getHashParams() {
     var hashParams = {};
     var e, r = /([^&;=]+)=?([^&;]*)/g,
       q = window.location.hash.substring(1);
     while (e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
     }
     return hashParams;
   }

   var params = getHashParams();

   var access_token = params.access_token,
     refresh_token = params.refresh_token,
     error = params.error;

   if (error) {
     alert('There was an error during the authentication');
   } else {
     if (access_token) {
       $.ajax({
         url: 'https://api.spotify.com/v1/me',
         headers: {
           'Authorization': 'Bearer ' + access_token
         },
         success: function(response) {
           console.log(response)
           render(response);
           $('#login').hide();
           $('#loggedin').show();
           $('#tools').show();
         }
       });
     } else {
       // render initial screen
       $('#login').show();
       $('#loggedin').hide();
       $('#tools').hide();
     }

     // document.getElementById('obtain-new-token').addEventListener('click', function() {
     //     $.ajax({
     //         url: '/refresh_token',
     //         data: {
     //             'refresh_token': refresh_token
     //         }
     //     }).done(function(data) {
     //         access_token = data.access_token;
     //         oauthPlaceholder.innerHTML = oauthTemplate({
     //             access_token: access_token,
     //             refresh_token: refresh_token
     //         });
     //     });
     // }, false);
   }

   function render(object) {
     $('#profile-photo').attr("src", object.images[0].url)
     $('#display-name').text("Logged in as " + object.display_name)
     $('#id').text(object.id);
     $('#email').text(object.email);
     $('#uri').text(object.uri)
     $('#country').text(object.country)
   }
 })();