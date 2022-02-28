const feedURL = "https://www.patreon.com/rss/dungeonsanddads?auth=Te1pL8_ENX5yUKVVz5LajSpQVcsw86-7";
const serverURL = "https://rss-podcast-player.herokuapp.com/"

const parent = document.getElementById("podcasts");
let podcasts = [];

fetch(serverURL + "/podcasts").then((response)=>{
  response.json().then(res => {
      console.log(res.items[0])
      podcasts = Array.from(res.items);
      podcasts.forEach((item)=> postPodcastToDB(item.guid));
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

function formatTimeForMySQL(time){
  let hours = 0;
  let minutes = time/60;
  if (minutes > 60) {
    hours = minutes/60;
    minutes = minutes-60;
  }
  let seconds = time%60;

  function addLeadingZero(n){
    n = Math.floor(n);
    if (n < 10) return "0" + n
    return n;
  }

  hours = addLeadingZero(hours);
  minutes = addLeadingZero(minutes);
  seconds = addLeadingZero(seconds);
  return hours + '' +  minutes +'' + seconds;
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

  arr.forEach(item=> {
    const podcastElement = document.createElement("div");
    podcastElement.className = "podcast-element";
    podcastElement.guid = item.guid;

    const title = document.createElement("p");
    title.textContent = item.title;

    const date = document.createElement("span");
    const dateString = new Date(item.pubDate).toDateString().split(" ")
    date.textContent = dateString[1] + " " + dateString[3];

    const played = document.createElement("span");
    podcastElement.append(title, date, played);
    podcastElement.addEventListener("click", ()=> updateNowPlaying(item));

    getPlayed(item.guid).then(response => response.json().then(res => {
       if (res.played === true){ played.textContent = " - Played"}
       parent.append(podcastElement);
      }))
  })
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