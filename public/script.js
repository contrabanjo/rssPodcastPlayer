const feedURL = "https://www.patreon.com/rss/dungeonsanddads?auth=Te1pL8_ENX5yUKVVz5LajSpQVcsw86-7";
const serverURL = "http://localhost:5000" //"https://rss-podcast-player.herokuapp.com" //"http://localhost:5000"

const parent = document.getElementById("podcasts");
let podcasts = [];

fetch(serverURL + "/podcasts").then((response)=>{
  response.json().then(res => {
      document.getElementById('loading').remove()
      podcasts = Array.from(res.items);
      const guids = podcasts.reduce((all, next, index)=> index > 0 ? all + ", ("+ next.guid + ", DEFAULT, DEFAULT)": all + "("+ next.guid + ", DEFAULT, DEFAULT)", "");
      postPodcastToDB(guids)
      createAndAppendPodcastElementsfromArray(res.items, parent);
  });
})

function postPodcastToDB(guid){
  fetch(serverURL + "/podcast", {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      guid: guid
    })
  });
}

function updateSeconds(guid, seconds){
  fetch(serverURL + "/seconds", {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      guid: guid,
      seconds: seconds
    })
  });
}

function saveCurrentSeconds(e){
  updateSeconds(e.target.guid, e.target.currentTime);
  if (e.target.currentTime/e.target.duration > 0.95){
    fetch(serverURL + "/played", {
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        guid: e.target.guid,
        played: true
      })
    })
  }
}

const currentAudio = document.getElementById("currentAudio");
currentAudio.addEventListener("timeupdate", saveCurrentSeconds);

function getCurrentSeconds(guid){
  return fetch(serverURL + "/seconds?guid=" + guid)
}

function getPlayed(guid){
  return fetch(serverURL + "/played?guid=" + guid);
}

function createAndAppendPodcastElementsfromArray(arr, parent){
  const allPlayed = arr.slice(1).reduce((prev, current)=> prev = prev + "," + current.guid, arr[0].guid);
  getPlayed(allPlayed).then(result => result.json().then( playedArr => {
    arr.forEach((item, index)=> {
      const podcastElement = document.createElement("div");
      podcastElement.className = "podcast-element";
      podcastElement.guid = item.guid;

      const title = document.createElement("p");
      title.textContent = item.title;

      const date = document.createElement("span");
      const dateString = new Date(item.pubDate).toDateString().split(" ")
      date.textContent = dateString[1] + " " + dateString[3];

      const played = document.createElement("span");
      played.textContent = playedArr[index] === "t" ? " - Played" : ""
      podcastElement.append(title, date, played);
      podcastElement.addEventListener("click", ()=> updateNowPlaying(item));

      parent.append(podcastElement);
    })
  }))
}

function updateNowPlaying(element){
  const nowPlaying = document.getElementById("nowPlaying");

  const audio = nowPlaying.childNodes[1];
  const title = document.getElementById("npTitle");
  const description = document.getElementById("npDescription");

  audio.src = element.enclosure.url;
  audio.guid = element.guid;
  title.textContent = element.title;
  description.innerHTML = element.content;

  getCurrentSeconds(element.guid).then(response => response.json().then(res=> audio.currentTime = res.seconds));

  window.scrollTo(0,0);
}

function onSearch(e){
  const podcastContainer = document.getElementById("podcasts")
  const podcastContainerParent = document.getElementById("main");
  podcastContainer.remove()

  const searchbar = document.getElementById("search");
  const searchTerm = searchbar.value.toUpperCase()
  const filteredPodcasts = podcasts.filter((item)=>item.title.toUpperCase().includes(searchTerm) || item.content.toUpperCase().includes(searchTerm));

  const newPodcastContainer = document.createElement("div");
  newPodcastContainer.id = "podcasts"
  podcastContainerParent.append(newPodcastContainer);
  createAndAppendPodcastElementsfromArray(filteredPodcasts, newPodcastContainer);

}

document.getElementById("search").addEventListener("input", onSearch)