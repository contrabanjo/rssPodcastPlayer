const feedURL = "https://www.patreon.com/rss/dungeonsanddads?auth=Te1pL8_ENX5yUKVVz5LajSpQVcsw86-7";
const podcastsURL = "http://localhost:3000/podcasts"

const parent = document.getElementById("podcasts");
let podcasts = [];

fetch(podcastsURL).then((response)=>{
  response.json().then(res => {
      console.log(res.items[0])
      podcasts = Array.from(res.items);
      createAndAppendPodcastElementsfromArray(res.items, parent);
  });
})

function createAndAppendPodcastElementsfromArray(arr, parent){
  arr.forEach(item=> {
    const podcastElement = document.createElement("div");
    podcastElement.className = "podcast-element";

    const title = document.createElement("p");
    title.textContent = item.title;

    const date = document.createElement("p");
    date.textContent = item.pubDate;

    podcastElement.append(title, date);

    podcastElement.url=item.enclosure["url"];
    podcastElement.addEventListener("click", ()=> updateNowPlaying(item));
    parent.append(podcastElement);
  })
}

function updateNowPlaying(element){
  const nowPlaying = document.getElementById("nowPlaying");

  const audio = nowPlaying.childNodes[1];
  const title = document.getElementById("npTitle");
  const description = document.getElementById("npDescription");

  audio.src = element.enclosure.url;
  title.textContent = element.title;
  description.innerHTML = element.content;

  window.scrollTo(0,0);
}

function onSearch(e){
  const podcastContainer = document.getElementById("podcasts")
  const podcastContainerParent = document.getElementsByTagName("body")[0];
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