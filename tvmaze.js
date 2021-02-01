/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const showsData = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`)
  const shows = [];
  for (let show of showsData.data){
    if (!show.show.image){
      shows.push({id: show.show.id, name: show.show.name, summary: show.show.summary, image: 'https://tinyurl.com/tv-missing'})
    } else {
      shows.push({id: show.show.id, name: show.show.name, summary: show.show.summary, image: show.show.image.medium})
    }
  }
  return shows;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div id="card" class="card" data-show-id="${show.id}">
           <div style="text-align: center" class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <img class="card-img-top" src=${show.image}>
             <button class="btn btn-primary" type="button" id="episodes-search">Get Episodes!</button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($item);
  } $(`#episodes-search*`).on('click', handleEpisodeSearch)
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

async function handleEpisodeSearch (evt) {
  evt.preventDefault();
  let showId = evt.target.closest('#card').dataset.showId
  const episodes = await getEpisodes(showId);
  $("#episodes-area").show();
  populateEpisodes(episodes);
};

function populateEpisodes(episodes){
  const $episodesList = $('#episodes-list')
  $episodesList.empty();
  for (episode of episodes){
    let $newEpisode = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`)
    $episodesList.append($newEpisode);
  }
}


/* getEpisodes is passed a show id (stored in the dom element as a data attribute),
gets results from the api, and loads them into the array episodes in the format we're looking for

*/

async function getEpisodes(showId) {
  const episodes = [];
  const episodesData = await axios.get(`http://api.tvmaze.com/shows/${showId}/episodes`)
  for (let episode of episodesData.data) {
    episodes.push({id: episode.id, name: episode.name, season: episode.season, number: episode.number})
  }
  return episodes;
}
