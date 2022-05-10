let serverURL;
if (window.location.hostname.includes("localhost"))
  serverURL = "http://localhost:5000"
else {
  serverURL = "https://rss-podcast-player.herokuapp.com"
}


let podcasts = [];

//////initialize page////////////////////////
fetch(serverURL + "/podcasts").then((response)=>{
  response.json().then(res => {
      console.log(res);
      document.getElementById('loading').remove()

      const title = document.getElementById("title");
      title.textContent = res.title;

      podcasts = Array.from(res.items);
      const guids = podcasts.reduce((all, next, index)=> index > 0 ? all + ", ("+ next.guid + ", DEFAULT, DEFAULT)": all + "("+ next.guid + ", DEFAULT, DEFAULT)", "");
      postPodcastToDB(guids)

      const parent = document.getElementById("podcasts");
      //createAndAppendPodcastElementsfromArray(res.items, parent);
      createPagination(res.items, parent);
  });
})

//////initialize page////////////////////////


//////database calls////////////////////////
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

function getCurrentSeconds(guid){
  return fetch(serverURL + "/seconds?guid=" + guid)
}

function getPlayed(guid){
  return fetch(serverURL + "/played?guid=" + guid);
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

//////database calls////////////////////////

//////////////podcast elements////////////////////////

function createAndAppendPodcastElementsfromArray(arr, parent){
  if (arr.length > 0){
    const guids = arr.slice(1).reduce((prev, current)=> prev = prev + "," + current.guid, arr[0].guid);
    getPlayed(guids).then(result => result.json().then(playedArr => {
      playedArr.sort((a, b)=> b.guid-a.guid)
      arr.forEach((item, index)=> {
        const newElement = createPodcastElement(item, index, playedArr)
        parent.append(newElement);
      })
    }))
  }
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
//////////////podcast elements////////////////////////

//////////////pagination////////////////////////
let currentPage = 1;
let maxPages = 10;
let paginationContainer;
let paginationArray;

function calculatePages(arr){
  maxPages = Math.ceil((arr.length / 10))
  return maxPages;
}

function createPagination(arr, parent){
  paginationContainer = parent;
  paginationArray = arr;
  
  calculatePages(arr);

  

  const pageNumberContainer = document.createElement("div");
  pageNumberContainer.className = "page-number-container";
  displayPageNumbers(pageNumberContainer);
 
  parent.parentElement.insertBefore(pageNumberContainer, parent);
 
  displayPage(currentPage);
}

function displayPage(pageNumber){
  const page = document.getElementById("pageNumberInput");
  page.value = pageNumber;

  //page numbers start at 1, array index starts at 0;
  const currentIndex = (pageNumber - 1) * 10;
  const pageArray = paginationArray.slice(currentIndex, currentIndex + 10);
  
  clearAllChildren(paginationContainer);
  createAndAppendPodcastElementsfromArray(pageArray, paginationContainer);
}

function displayPageNumbers(parent){
  const pageNumberContainer = document.createElement("span");
  pageNumberContainer.className = "page-number-container"

  const prevPageButton = document.createElement("div");
  prevPageButton.className = "play";
  prevPageButton.addEventListener("click", prevPage);
  pageNumberContainer.append(prevPageButton);
  
  const pageNumberText1 = document.createElement("span");
  pageNumberText1.textContent = "Page "
  pageNumberContainer.append(pageNumberText1);

  const pageNumberInput = document.createElement("input");
  pageNumberInput.id = "pageNumberInput";
  pageNumberInput.type = "number";
  pageNumberInput.min = 0;
  pageNumberInput.max = maxPages;
  pageNumberInput.placeholder = 0;
  pageNumberInput.list = "pageNumbers";

  pageNumberInput.addEventListener("change", (e)=>{displayPage(e.target.value)});

  pageNumberContainer.append(pageNumberInput);  
  
  const datalist = document.createElement("datalist");
  datalist.id = "pageNumbers"
  for (i = 0; i <= maxPages; i++){
    const newOption = document.createElement("option");
    newOption.value = i;
    datalist.append(newOption);
  }
  
  pageNumberContainer.append(datalist);  

  const pageNumberText2 = document.createElement("span");
  pageNumberText2.textContent = "of " + maxPages;
  pageNumberContainer.append(pageNumberText2);

  const nextPageButton = document.createElement("div");
  nextPageButton.className = "play";
  nextPageButton.addEventListener("click", nextPage);
  pageNumberContainer.append(nextPageButton);
  
  parent.append(pageNumberContainer);
}

function createPageNumberButton(n){
  const newPageNumberButton = document.createElement("div");
  newPageNumberButton.textContent = n;
  newPageNumberButton.addEventListener("click", pageNumberButtonClick);
  return newPageNumberButton;
}

function pageNumberButtonClick(e){
  console.log(e.target.textContent);
  currentPage = e.target.textContent;
  displayPage(currentPage);
}

function nextPage(){
  if (currentPage + 1 <= maxPages) {
	currentPage+=1;
  }
  displayPage(currentPage);
}

function prevPage(){
  if (currentPage - 1 >= 1) {
	currentPage -=1;
  }
  displayPage(currentPage);
}

//////////////pagination////////////////////////

//////////////queue////////////////////////
let queue = [];

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

function playNextInQueue(){
  const audio = document.getElementById("currentAudio");
  if (queue.length > 0) {
    audio.src = queue[0].enclosure.url;
    audio.play();
  }
  queue.shift();
}
//////////////queue////////////////////////

///////////now playing/////////////////////

function updateNowPlaying(element){
  const nowPlaying = document.getElementById("nowPlaying");

  const audio = document.getElementById("currentAudio");
  const title = document.getElementById("npTitle");
  const description = document.getElementById("npDescription");

  audio.src = element.enclosure.url;
  audio.guid = element.guid;
  title.textContent = element.title;
  description.innerHTML = element.content;

  audio.addEventListener("loadedmetadata", (e)=>{
    getCurrentSeconds(element.guid).then(response => response.json().then(res=> {
      audio.currentTime = res.seconds    
    }));
  });

  audio.addEventListener("ended", playNextInQueue);

  audio.play();
  window.scrollTo(0,0);
}

///////////now playing/////////////////////

///////search /////////////////

function onSearch(e){
  const searchbar = document.getElementById("search");
  const searchTerm = searchbar.value.toUpperCase()
   
  const filteredPodcasts = podcasts.filter((item)=>{
   return item.title.toUpperCase().includes(searchTerm) || item.content.toUpperCase().includes(searchTerm);
  })
  
  const podcastContainer = document.getElementById("podcasts")
  clearAllChildren(podcastContainer);
  createAndAppendPodcastElementsfromArray(filteredPodcasts, podcastContainer);
}

document.getElementById("search").addEventListener("input", onSearch)

///////search /////////////////

/////////general///////////

function clearAllChildren(parent){
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/////////general///////////