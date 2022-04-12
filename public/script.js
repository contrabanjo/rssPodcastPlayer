const feedURL = "https://www.patreon.com/rss/dungeonsanddads?auth=Te1pL8_ENX5yUKVVz5LajSpQVcsw86-7";
let serverURL;
if (window.location.hostname.includes("localhost"))
  serverURL = "http://localhost:5000"
else {
  serverURL = "https://rss-podcast-player.herokuapp.com"
}

const parent = document.getElementById("podcasts");
let podcasts = [];
let queue = [];

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

function createPodcastElement(item, index, playedArr){
  const podcastElement = document.createElement("div");
  podcastElement.className = "podcast-element";
  podcastElement.guid = item.guid;

  const playButton = document.createElement("div");
  playButton.className = "play"
  playButton.addEventListener("click", () => updateNowPlaying(item));

  const podcastText = document.createElement("div");
  podcastText.className = "podcastText";

  const title = document.createElement("p");
  title.textContent = item.title;

  const date = document.createElement("span");
  const dateString = new Date(item.pubDate).toDateString().split(" ")
  date.textContent = dateString[1] + " " + dateString[3];

  const played = document.createElement("span");
  played.textContent = playedArr[index].played === true ? " - Played" : ""

  podcastText.append(title, date, played)

  const addToQueueButton = document.createElement("div");
  addToQueueButton.className = "add";
  addToQueueButton.textContent = "+";
  addToQueueButton.addEventListener("click", () => addToQueue(item));

  podcastElement.append(playButton, podcastText, addToQueueButton);

  return podcastElement;
}

function createAndAppendPodcastElementsfromArray(arr, parent){
  const guids = arr.slice(1).reduce((prev, current)=> prev = prev + "," + current.guid, arr[0].guid);
  getPlayed(guids).then(result => result.json().then(playedArr => {
    playedArr.sort((a, b)=> b.guid-a.guid)
    arr.forEach((item, index)=> {
      const newElement = createPodcastElement(item, index, playedArr)
      parent.append(newElement);
    })
  }))
}

function createQueue(arr){
  const oldQueueContainer = document.getElementById("queue")
  if (oldQueueContainer) oldQueueContainer.remove();

  if (arr.length > 0) {
    const queueContainer = document.createElement("div");
    queueContainer.id = "queue"

    const queueTitle = document.createElement("div");
    queueTitle.textContent = "Up Next:";
    queueContainer.append(queueTitle);

    arr.forEach(item => {
      const queueItem = document.createElement("div");
      queueItem.textContent = item.title;
      const minus = document.createElement("div");
      minus.textContent = "-";
      queueItem.append(minus);
      queueItem.addEventListener("click", ()=>{removeFromQueue(item)})
      queueContainer.append(queueItem);
    })

    document.getElementById("nowPlaying").after(queueContainer);
  }
}

function hideQueue(){
  document.getElementById("queue").remove();
}

function addToQueue(podcast){
  if (!queue.includes(podcast)){
    queue.push(podcast);
  }
  createQueue(queue);
}

function removeFromQueue(podcast){
  const index = queue.indexOf(podcast);
  queue.splice(index, 1);
  createQueue(queue);
}

function getQueue(){
  return queue
}

function clearQueue(){
  queue = [];
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

  audio.addEventListener("ended", playNextInQueue);

  audio.play();
  window.scrollTo(0,0);
}

function playNextInQueue(){
  const audio = document.getElementById("nowPlaying").childNodes[1];
  if (queue.length > 0) {
    audio.src = queue[0].enclosure.url;
    audio.play();
  }
  queue.shift();
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